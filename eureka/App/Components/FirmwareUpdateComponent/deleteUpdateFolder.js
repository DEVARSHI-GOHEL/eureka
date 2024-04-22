import * as RNFS from 'react-native-fs';

export const UPDATE_FOLDER = RNFS.DocumentDirectoryPath + '/update/'

/**
 * Delete folder (recursively with files)
 * @return {Promise<void>}
 */
export const deleteUpdateFolder = async () => {
  await RNFS.unlink(UPDATE_FOLDER);
};
