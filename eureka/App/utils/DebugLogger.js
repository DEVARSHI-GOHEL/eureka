import {
  POST_DEBUG_LOGS,
  DEBUG_LOG_FILE_PATH,
  DEBUG_LOG_FOLDER_PATH,
} from '../Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import {Platform} from 'react-native';
import {postWithAuthorization} from "../Services/graphqlApi";

export default async (eventDescription, functionName, fileName, lineNumber) => {
  console.log(
    'debug logger request',
    eventDescription,
    functionName,
    fileName,
    lineNumber,
  );

  try {
    let userIdAsync = await AsyncStorage.getItem('user_id');
    let fullName = await AsyncStorage.getItem('user_name');
    let isDebugEnabled = await AsyncStorage.getItem('debug_log_enabled');

    await writeToDebugFile(
      `Line No.-${lineNumber},Function Name:- ${functionName},File Name-:${fileName},Description:-${eventDescription}`,
    );
    if (!JSON.parse(isDebugEnabled)) {
      // console.log('Debug Logger Is Disabled - debug logger');
      console.log(
          ' -- debug logger request',
          eventDescription,
          functionName,
          fileName,
          lineNumber,
      );


      return;
    }

    const response = await postWithAuthorization(
      POST_DEBUG_LOGS,
      {
        ts: new Date().getTime().toString(),
        userId: Number(userIdAsync),
        userName: fullName,
        codeCategoryId: 3,
        fileName,
        functionName,
        eventDescription,
        lineNumber,
        applicationNameId: 1,
        operationName: 'add',
      }
    );

    console.log(response.data, 'data');
  } catch (error) {
    console.log(error, 'Error debug log');
  }
};

const writeToDebugFile = async (data) => {
  try {
    let directory = '';
    let response = '';
    if (Platform.OS == 'ios') {
      directory = `${RNFS.LibraryDirectoryPath}${DEBUG_LOG_FOLDER_PATH}`;
      await RNFS.mkdir(directory);

      let text = `\n Date:-${new Date()}\n\n${data}\n\n-------------------------------------------------------------\n\n`;

      response = await RNFS.appendFile(
        `${RNFS.LibraryDirectoryPath}${DEBUG_LOG_FOLDER_PATH}${DEBUG_LOG_FILE_PATH}`,
        text,
        'utf8',
      );
    } else {
      directory = `${RNFS.ExternalCachesDirectoryPath}${DEBUG_LOG_FOLDER_PATH}`;
      await RNFS.mkdir(directory);

      let text = `\n Date:-${new Date()}\n\n${data}\n\n-------------------------------------------------------------\n\n`;

      response = await RNFS.appendFile(
        `${RNFS.ExternalCachesDirectoryPath}${DEBUG_LOG_FOLDER_PATH}${DEBUG_LOG_FILE_PATH}`,
        text,
        'utf8',
      );
    }

    console.log(response);
  } catch (error) {
    throw error;
  }
};
