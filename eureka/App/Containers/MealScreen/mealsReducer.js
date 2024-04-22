import {REFRESH_MEALS, RESET_MEALS} from './actionTypes';
import {MEALS_STATE} from '../../constants/AppDataConstants';

const initialState = {
  refresh: MEALS_STATE.RESET_MEALS,
};

function mealsReducer(state = initialState, action) {
  switch (action.type) {
    case REFRESH_MEALS:
      return {
        ...state,
        refresh: MEALS_STATE.REFRESH_MEAL,
      };
    case RESET_MEALS:
      return {
        ...state,
        refresh: MEALS_STATE.RESET_MEALS,
      };
    default:
      return state;
  }
}

export default mealsReducer;
