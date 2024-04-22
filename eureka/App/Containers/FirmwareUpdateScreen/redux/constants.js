/**
 * Indication firmware upgrading flow
 * @type {{START_SOON: string, STOP: string, STARTED: string, INITIAL: string}}
 */
export const FirmwareUpdateState = {
  INITIAL: 'INITIAL',
  START_SOON: 'START_SOON',
  STARTED: 'STARTED',
  STOP: 'STOP',
};

/**
 * This controls showing modals about firmware update state
 *
 * @type {{SUCCESS: string, INITIAL: string, FAIL: string}}
 */
export const FirmwareUpdateResult = {
  INITIAL: 'INITIAL',
  SUCCESS: 'SUCCESS',
  FAIL: 'FAIL',
};
