import store from '../../../store/store';

const _DISPATCH = store.dispatch;

import {refreshMealsAction, resetMealsAction} from './action';

//to reset meals refresh action
function resetMeals() {
  _DISPATCH(resetMealsAction());
}

//to refresh meals after adding from watch
function refreshMeals() {
  _DISPATCH(refreshMealsAction());
}

const MealsCommandHandler = {
  refreshMeals,
  resetMeals,
};

export default MealsCommandHandler;
