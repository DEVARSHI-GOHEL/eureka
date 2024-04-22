
import * as React from 'react';

/**
 * Use this as reference in main navigation component.
 * @type {React.RefObject<unknown>}
 */
export const navigationRef = React.createRef();

/**
 * NavigationService substitutes calling navigation, which is passed as component property.
 * So with this service, navigation commands can be called from any component/function.
 */
const NavigationService = {
    navigate: (name, params) => {
        navigationRef.current?.navigate(name, params);
    },
    goBack: () => {
        navigationRef.current?.goBack();
    },
    reset: (state) => {
        navigationRef.current?.reset(state);
    },
};

export default NavigationService;
