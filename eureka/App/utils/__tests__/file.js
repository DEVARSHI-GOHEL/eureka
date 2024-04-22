import {checkFileMd5} from "../file";

const MOCK_FILE_CONTENT = 'asdasdcasdcasde';
const MD5_OF_MOCK_FILE_CONTENT = 'md5:f073e67273c48d6d27b41f18e2836639';

jest.mock('react-native-fs', () => {
  return { readFile: async () => { return MOCK_FILE_CONTENT; }}
});

describe('file', () => {

  it('should check MD5 file', async () => {
    const checkSumResult = await checkFileMd5('not/real/file',MD5_OF_MOCK_FILE_CONTENT);

    expect(checkSumResult).toBe(true);
  });
});
