export const SHOW_REMOVE_ACCOUNT_SUCCESS_MODAL = 'SHOW_REMOVE_ACCOUNT_SUCCESS_MODAL';
export const SHOW_REMOVE_ACCOUNT_FAIL_MODAL = 'SHOW_REMOVE_ACCOUNT_FAIL_MODAL';
export const HIDE_REMOVE_ACCOUNT_MODALS = 'HIDE_REMOVE_ACCOUNT_MODALS';

/**
 * Show modal informing user about incompatible device
 * @return {{type: string}}
 */
export const showCancelAccountSuccess = () => ({type: SHOW_REMOVE_ACCOUNT_SUCCESS_MODAL});

/**
 * Hide modal
 * @return {{type: string}}
 */
export const showCancelAccountFail = (errorMessage) => ({type: SHOW_REMOVE_ACCOUNT_FAIL_MODAL, errorMessage});

/**
 * Hide modal
 * @return {{type: string}}
 */
export const hideRemoveAccountModals = () => ({type: HIDE_REMOVE_ACCOUNT_MODALS});
