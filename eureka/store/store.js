import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import {persistStore} from 'redux-persist'
import {composeWithDevToolsDevelopmentOnly} from '@redux-devtools/extension';

import rootReducer from '../reducers/rootReducer';

const store = createStore(
    rootReducer,
    compose(
      composeWithDevToolsDevelopmentOnly(applyMiddleware(thunk))
    )
);

/**
 * Load the data from async storage.
 * @type {Persistor}
 */
export const persistor = persistStore(store);


/**
 * To dispatch actions from any place
 */
export const dispatch = store.dispatch;

export default store;
