import * as RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import {EVENT_MANAGER} from '../../Ble/NativeEventHandler';
import {dispatch} from '../../../store/store';
import {
    firmwareFilesDownloaded,
    firmwareFilesDownloadProgress,
    firmwareUpdateResultError,
    firmwareUpdateStartDownloading,
} from '../../Containers/FirmwareUpdateScreen/redux/actions';

import {checkFileMd5} from '../../utils/file';
import {getNewFirmwareData} from "../../Services/updateChecker";
import NavigationService from "../../Navigators/NavigationService";
import {sleep} from "../../utils/sleep";
import {ANIMATION_TO_FINISH} from "../../Containers/FirmwareUpdateScreen/components/CircleLoaderConfig";
import {API} from "../../Services/API";
import {storeFirmwareUpdateMeta} from "../../../reducers/firmwareVersionReducer/actions";
import { deleteUpdateFolder, UPDATE_FOLDER } from "./deleteUpdateFolder";

/**
 * Dispatch downloading progress of firmware files.
 *
 * @param contentLength length of file
 * @param bytesWritten already downloaded
 * @param fileIndex current file index
 * @param filesTotal count of files to download
 */
const downloadProgress = (contentLength, bytesWritten, fileIndex, filesTotal) => {
    const downloadedFragment = bytesWritten / contentLength;
    const percent = Math.floor((downloadedFragment + fileIndex) / filesTotal * 100);

    dispatch(firmwareFilesDownloadProgress(percent))
}

/**
 * Return size of remote file (stored in s3)
 *
 * @param fileData
 * @return {Promise<number>}
 */
const getFileSize = async (fileData) => {

    const fileHead = await API.headApi(fileData.url);
    const contentLength = fileHead.headers?.['content-length'];
    return parseInt(contentLength, 10);
}

/**
 * Return true if there is enough space on storage for files. Otherwise return false.
 *
 * @param files
 * @return {Promise<boolean>}
 */
const checkStorageSpace = async (files) => {

    let requiredSpace = 0;

    for (const file of files) {
        const fileSize = await getFileSize(file);
        requiredSpace += fileSize;
    }

    const fsInfo = await RNFS.getFSInfo();

    // double the required space to have some free space on file manipulation
    requiredSpace *= 2;

    if (fsInfo.freeSpace < requiredSpace) {
        console.log(' free space: ', fsInfo.freeSpace);
        console.log('files total: ', requiredSpace);
        console.warn(`Not enough space. Required: ${requiredSpace}, but there is only ${fsInfo.freeSpace} space left.`)
        return false;
    }

    return true;

}

/**
 * Prepare empty folder for update files. If the folder exists and it contains some files, remove those files.
 * @return {Promise<void>}
 */
const prepareUpdateFolder = async () => {

    // check or create folder
    await RNFS.mkdir(UPDATE_FOLDER);
    // clean folder if there is any file
    const files = await RNFS.readDir(UPDATE_FOLDER);

    if (files.length > 0) {
        // delete files (including folder)
        await deleteUpdateFolder();
        // create the folder again
        await RNFS.mkdir(UPDATE_FOLDER);
    }
}

/**
 * Stored data for this function are prepared in 'checkFirmwareUpdate()' function.
 *
 * Function will start downloading files and after that it will initiate native code to upload firmware into watch.
 *
 * @return {Promise<void>}
 */
export const continueFirmwareDownload = async () => {

    const {files, version} = await getNewFirmwareData();
    let userId = await AsyncStorage.getItem('user_id');
    let device_msn = (await AsyncStorage.getItem('device_msn')).toString();

    try {
        dispatch(firmwareUpdateStartDownloading());
        dispatch(firmwareFilesDownloadProgress(0))

        // heck fre space:https://www.npmjs.com/package/react-native-fs -  getFSInfo
        await prepareUpdateFolder();

        const enoughSpace = await checkStorageSpace(files);
        if (!enoughSpace){
            throw new Error('Insufficient memory on your phone to continue the process');
        }

        for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
            const file = files[fileIndex];
            const filePath =
                RNFS.DocumentDirectoryPath +
                `/update/firmware_${moment().unix()}.cyacd2`;
            const options = {
                fromUrl: file.url,
                toFile: filePath,
                progressInterval: 200,
                progress: ({
                  contentLength,
                  bytesWritten
              }) => downloadProgress(contentLength, bytesWritten, fileIndex, files.length),
            };

            const fileInfo = await RNFS.downloadFile(options).promise;
            const fileSize = fileInfo.bytesWritten;
            // last percent will be indicate, that  checksum is calculated
            dispatch(firmwareFilesDownloadProgress(99));
            const checkSumResult = await checkFileMd5(filePath, file.hash);
            // file downloaded - set to 100%
            dispatch(firmwareFilesDownloadProgress(100));

            if (!checkSumResult) {
                console.warn(
                    'continueFirmwareDownload',
                    `file ${filePath} has different MD5 hash from ${file.hash}`,
                );
                dispatch(firmwareUpdateResultError('Downloaded file has incorrect hash'));
                EVENT_MANAGER.SEND.postFirmwareUpdate(
                    {
                        userId,
                        filePath,
                        device_msn,
                        version,
                    },
                    {
                        result: {
                            message: 'hash check error on firmware file download',
                            status: 'failed',
                        },
                    },
                );
            } else {

                // wait for progress animation to finish.
                await sleep(ANIMATION_TO_FINISH);

                dispatch(firmwareFilesDownloaded(
                    fileSize,
                ));
                dispatch(storeFirmwareUpdateMeta(
                    userId,
                    filePath,
                    device_msn,
                    version,
                ));

                NavigationService.navigate('UpdateScreensFlow', {updateMode: true});

                // reset download progress
                dispatch(firmwareFilesDownloadProgress(0));
            }
            fileIndex++;
        }

    } catch (err) {
        dispatch(firmwareUpdateResultError(err.message));
        console.warn('continueFirmwareDownload ', err);
    }
}
