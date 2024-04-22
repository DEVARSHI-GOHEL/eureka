import {REFRESH_MEALS, RESET_MEALS} from './actionTypes';

export function refreshMealsAction() {
  return {
    type: REFRESH_MEALS,
  };
}

export function resetMealsAction() {
  return {
    type: RESET_MEALS,
  };
}
