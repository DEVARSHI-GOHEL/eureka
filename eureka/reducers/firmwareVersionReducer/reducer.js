import {actions} from './type';

function equalVersions(a, b){
  return `${a}`.toLowerCase() === `${b}`.toLowerCase();
};

const INITIAL_STATE = {
    watchVersion: '',
    newVersion: '',
    newVersionAvailable: false,
    updatedFirmwareVersion: null,
    uploadResult: null,
    firmwareUpdateParams:{},
};


const reducer = {
    [actions.FIRMWARE_VERSION_SET_WATCH_VERSION]: (state, {watchVersion}) => {
      if (equalVersions(state.watchVersion, watchVersion)) return state;
      return {
          ...state,
          watchVersion,
      }
    },
    [actions.FIRMWARE_VERSION_SET_NEW_VERSION]: (state, { newVersion, isAvailable }) => {
      if (
        equalVersions(state.newVersion, newVersion)
        && state.newVersionAvailable === isAvailable
      ) return state;
      return {
          ...state,
          newVersion,
          newVersionAvailable: isAvailable
      }
    },
    [actions.FIRMWARE_VERSION_SET_NEW_VERSION_AVAILABLE]: (state, {isAvailable}) => {
        if (state.newVersionAvailable === isAvailable) return state;
        return {
            ...state,
            newVersionAvailable: isAvailable
        }
    },
    [actions.FIRMWARE_VERSION_SET_UPDATE_VERSION]: (state,{message, status}) => {
        return {
            ...state,
            updatedFirmwareVersion: state.newVersion,
            uploadResult:{ message, status},
        }
    },
    [actions.FIRMWARE_VERSION_RESET_UPDATE_VERSION]: (state) => {
        return {
            ...state,
            updatedFirmwareVersion: null,
            uploadResult: null,
        }
    },
    [actions.FIRMWARE_STORE_META]: (state, {
        firmwareUpdateParams: {
            userId,
            filePath,
            device_msn,
            version,
        }
    }) => ({
        ...state,
        firmwareUpdateParams: {
            userId,
            filePath,
            device_msn,
            version,
        },
    }),

}

const firmwareVersionReducer = (state = INITIAL_STATE, action) => {
    const reducerFunction = reducer[action.type];
    if (!reducerFunction) return state;

    return reducerFunction(state, action);
}

export default firmwareVersionReducer;
