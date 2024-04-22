import {Config as DEV_CONFIG} from '../../Components/Config/index.dev';
import {Config as STAGE_CONFIG} from '../../Components/Config/index.staging';
import {Config as PROD_CONFIG} from '../../Components/Config/index.production';
import RNDeviceInfo from 'react-native-device-info';
import preval from 'preval.macro';
import moment from 'moment';
import {setFirmwareUpdateInterval} from '../../Ble/handlers/TimerConfig';

const env = 'stage';

var APP_CONFIG = null;

const buildTimestamp = preval`module.exports = new Date().getTime();`;

const getDateString = () => {
  const lastUpdateMoment = moment.unix(buildTimestamp / 1000);
  const formattedDate = lastUpdateMoment.format('YYYY.MM.DD');

  return formattedDate;
};

if (env == 'dev') {
  APP_CONFIG = DEV_CONFIG;
} else if (env == 'stage') {
  APP_CONFIG = STAGE_CONFIG;
} else if (env == 'prod') {
  APP_CONFIG = PROD_CONFIG;
}

if (APP_CONFIG.FIRMWARE_UPDATE_AMOUNT && APP_CONFIG.FIRMWARE_UPDATE_UNIT) {
  setFirmwareUpdateInterval(APP_CONFIG.FIRMWARE_UPDATE_AMOUNT, APP_CONFIG.FIRMWARE_UPDATE_UNIT);
}

export const Update_User_Api = APP_CONFIG.GRAPHQL_BASE_URL;
export const Sign_In_Api = APP_CONFIG.EUREKA_GRAPHQL_BASE_URL;
export const StepsGoal_Api = APP_CONFIG.EUREKA_GRAPHQL_BASE_URL;

export const Profile_Pic_Upload_Api =
  APP_CONFIG.API_GATEWAY_BASE_URL + '/profilepicupload'; // + '/s3fileuploader?type=profilePicture&id=${user_id}';
export const Profile_Pic_Get_Url = APP_CONFIG.S3_URL + '/profilePictures'; //Append the image name from here

export const Login_Api = APP_CONFIG.API_GATEWAY_BASE_URL + '/login';
export const Get_master_Api = APP_CONFIG.API_GATEWAY_BASE_URL + '/masterdata';
export const Get_Api_Keys = APP_CONFIG.API_GATEWAY_BASE_URL + '/appsynckey';
export const POST_DEBUG_LOGS = APP_CONFIG.DEBUG_URL + '/debug-log';
export const SAVE_FCM_TOKEN_API = APP_CONFIG.EUREKA_GRAPHQL_BASE_URL;
export const DEBUG_LOG_FOLDER_PATH = '/Eureka/';
export const DEBUG_LOG_FILE_PATH = 'EurekaLogs.txt';

export const APP_VERSION = RNDeviceInfo.getVersion();
export const APP_RELEASE_DATE = getDateString();
export const Config = APP_CONFIG;
