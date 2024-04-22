import {
  HIDE_REMOVE_ACCOUNT_MODALS,
  SHOW_CANCEL_ACCOUNT_FAIL_MODAL,
  SHOW_REMOVE_ACCOUNT_FAIL_MODAL,
  SHOW_REMOVE_ACCOUNT_SUCCESS_MODAL
} from "./actions";

const INITIAL_STATE = {
  successVisible: false,
  failVisible: false,
  errorMessage: null,
};

const reducer = {
  [SHOW_REMOVE_ACCOUNT_SUCCESS_MODAL]: (state)=> ({
    ...state,
    successVisible: true,
  }),
  [SHOW_REMOVE_ACCOUNT_FAIL_MODAL]: (state,{errorMessage})=> ({
    ...state,
    failVisible: true,
    errorMessage,
  }),
  [HIDE_REMOVE_ACCOUNT_MODALS]: (state)=> ({
    ...state,
    successVisible: false,
    failVisible: false,
    errorMessage: null,
  }),
}

const accountRemoveReducer = (state = INITIAL_STATE, action) => {
  const reducerFunction = reducer[action.type];
  if (!reducerFunction) return state;

  return reducerFunction({ ...state} , action);
}

export default accountRemoveReducer;
