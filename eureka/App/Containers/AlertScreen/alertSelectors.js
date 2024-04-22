const getAlertStore = (appState) => appState.alerts;

export const getKey = ({ time, id }) => {
  if (!time || !id) return null;
  return `${time}#${id}`;
}

export const parseTimeAndKey = (key) => {
  const [time, id] = key.split('#');
  return ({ time, id });
}

export const selectIsShowAlertBadge = (appState) =>
  getAlertStore(appState).isShowAlertBadge;

export const selectNewAlertList = (appState) => {
  const idsMap = new Map();
  getAlertStore(appState).newAlertList
    .filter(key => !!key)
    .forEach(key => {
    idsMap.set(key, parseTimeAndKey(key));
  });
  return idsMap;
}

export const selectDeletedAlertList = (appState) => {
  const deletedMap = new Map();
  getAlertStore(appState).deleted.forEach(key => {
    deletedMap.set(key, parseTimeAndKey(key));
  });
  return deletedMap;
}

export const selectEditedAlertMap = (appState) =>
  new Map(Object.entries(getAlertStore(appState).edited));
