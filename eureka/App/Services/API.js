import axios from 'axios';
import LifePlusModuleExport from '../../LifePlusModuleExport';
import i18n from "i18n-js";

const ApiInstant = axios.create({headers: {}});

const constAppendDefautHeaders = ({headers, ...restOptions}) => {
  const resultHeaders = {
    'Accept-Language': i18n.locale,
    ...headers
  }
  const result= {
    headers: resultHeaders,
    ...restOptions
  }
  return result;
}
function postApi(url, data, options) {

  return ApiInstant.post(url, data, constAppendDefautHeaders(options||{})).then(res => {

    if (res.status === 200) {
      return res;
    }
    return null;
  }).catch(function(error){
    const anonymData= {...data};

    // anonymize very sensitive data
    if (anonymData.password) {anonymData.password='*****';}

    let keys = {type: "POST", url: url, data: JSON.stringify(anonymData), options: JSON.stringify(options)}
    handleErrorReport(error, keys);
    throw error;
  });
}

function getApi(url, options) {
  return ApiInstant.get(url, options).then(res => {
    if (res.status === 200) {
      return res;
    }
    return null;
  }).catch(error => {
    let keys = {type: "GET", url: url, options: JSON.stringify(options)}
    handleErrorReport(error, keys);
    throw error;
  });
}

function headApi(url, options) {
  return ApiInstant.head(url, options).then(res => {
    if (res.status === 200) {
      return res;
    }
    return null;
  }).catch(error => {
    let keys = {type: "GET", url: url, options: JSON.stringify(options)}
    handleErrorReport(error, keys);
    throw error;
  });
}

function deleteApi(url, options) {
  return ApiInstant.delete(url, options).then(res => {
    if (res.status === 200) {
      return res;
    }
    return null;
  }).catch(error => {
    let keys = {type: "DELETE", url: url, options: JSON.stringify(options)}
    handleErrorReport(error, keys);
    throw error;
  });
}

function putApi(url, options) {
  return ApiInstant.put(url, options).then(res => {
    if (res.status === 200) {
      return res;
    }
    return null;
  }).catch(error => {
    let keys = {type: "PUT", url: url, options: JSON.stringify(options)}
    handleErrorReport(error, keys);
    throw error;
  });
}


function handleErrorReport(error, keys) {
  const reportPrams= {...keys};

  if (error.message){
    reportPrams.responseError = error.message;
  }

  if (error.stack){
    reportPrams.stack= error.stack;
  }

  if(error.response) {
    let statusCode = error.response.status;
    if(statusCode >= 400 && statusCode <= 599) {
      reportPrams.status = statusCode
    }
  }

  LifePlusModuleExport.apiError(JSON.stringify(reportPrams));
}

export const API = {
  postApi,
  getApi,
  deleteApi,
  putApi,
  headApi,
};
