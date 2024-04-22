import {LOGIN_SUCCESS, LOGOUT_USER} from './actionTypes';

const initialState = {
  isLoggedIn: false,
  userId: null,
  userName: '',
  // userState: null
};

export function usersReducer(state = initialState, action) {
  // console.log('usersReducers', state, action);

  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        userId: action.userId,
        isLoggedIn: action.isLoggedIn,
        userName: action.userName,
      };
    case LOGOUT_USER:
      return {
        ...state,
        userId: null,
        isLoggedIn: false,
        userName: false,
      };
    default:
      return state;
  }
}

export default usersReducer;
