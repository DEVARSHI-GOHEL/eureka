
import * as ReactNative from 'react-native';

jest.mock('@react-native-async-storage/async-storage', () => {
  return {
    setItem: async () => {},
    getItem: async (key) => (key+'-value'),
    removeItem: async () => {},
  };
});

jest.mock('react-native-device-info', () => ({
  getBrand: jest.fn(),
  getBundleId: jest.fn(),
  getDeviceId: jest.fn(),
  getSystemName: jest.fn(),
  getSystemVersion: jest.fn(),
  getVersion: jest.fn(),
  getBuildNumber: jest.fn(),
  getUniqueId: jest.fn(),
}));

jest.mock('react-native-fs', () => ({}));
