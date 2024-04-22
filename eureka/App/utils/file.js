import * as RNFS from "react-native-fs";

/**
 * Return true if MD5 hash of file equals to expectedHash
 *
 * @param filePath path to file
 * @param expectedHash
 * @return {Promise<boolean>}
 */
export const checkFileMd5 = async (filePath, expectedHash) => {
  const fileHash = await RNFS.hash(filePath, 'md5');
  const hash = 'md5:'+fileHash;
  return (hash == expectedHash);
}
