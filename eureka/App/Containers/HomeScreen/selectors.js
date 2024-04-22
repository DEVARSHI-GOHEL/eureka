const getHomeScreenStore = (appState) => appState.home;

export const selectStepGoal = (appState) => getHomeScreenStore(appState).stepGoal;
export const selectGlucoseUnit = (appState) => getHomeScreenStore(appState).glucoseUnit;
