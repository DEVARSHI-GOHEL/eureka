
export const timerConfig = {
    firmwareUpdateAmount: 8,
    firmwareUpdateUnit: 'hours',
}

/**
 * Define time interval between firmware update checking
 *
 * @param amount a number of interval (eg 5 means 5 hours or 5 minutes)
 * @param units 'hours' or 'minutes'
 */
export const setFirmwareUpdateInterval = (amount, units) => {
    timerConfig.firmwareUpdateAmount = amount;
    timerConfig.firmwareUpdateUnit = units;

}
