export const INCOMPATIBLE_DEVICE_SHOW = 'INCOMPATIBLE_DEVICE_SHOW';
export const INCOMPATIBLE_DEVICE_HIDE = 'INCOMPATIBLE_DEVICE_HIDE';

/**
 * Show modal informing user about incompatible device
 * @return {{type: string}}
 */
export const showIncompatibleDeviceDialog = () => ({type: INCOMPATIBLE_DEVICE_SHOW});

/**
 * Hide modal
 * @return {{type: string}}
 */
export const hideIncompatibleDeviceDialog = () => ({type: INCOMPATIBLE_DEVICE_HIDE});
