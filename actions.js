import moment from 'moment';
import * as actionTypes from './actionTypes';

// Connected Device actions
export const setDevice = ( device ) => {
  return {
    type: actionTypes.SET_DEVICE,
    device,
  };
};

export const clearDevice = () => {
  return {
    type: actionTypes.CLEAR_DEVICE,
    device: '',
  };
};

// Spot Check actions
export const addSpotCheckReading = ( reading ) => {
  return {
    type: actionTypes.ADD_SPOTCHECK_READING,
    timestamp: moment().valueOf(),
    reading,
  };
};

export const clearSpotCheckReadings = () => {
  return {
    type: actionTypes.CLEAR_SPOTCHECK_READINGS,
  };
};

// Continuous Check actions
export const addContinuousCheckReading = ( reading ) => {
  return {
    type: actionTypes.ADD_CONTINUOUSCHECK_READING,
    timestamp: moment().valueOf(),
    reading,
  };
};

export const clearContinuousCheckReadings = () => {
  return {
    type: actionTypes.CLEAR_CONTINUOUSCHECK_READINGS,
  };
};

// Advertising Devices actions
export const addAdvertisingDevice = ( device ) => {
  return {
    type: actionTypes.ADD_ADVERTISING_DEVICE,
    device,
  };
};

export const removeAdvertisingDevice = ( deviceId ) => {
  return {
    type: actionTypes.REMOVE_ADVERTISING_DEVICE,
    deviceId,
  };
};

export const clearAdvertisingDevices = () => {
  return {
    type: actionTypes.CLEAR_ADVERTISING_DEVICES,
  };
};

// Trend actions
export const updateOximetryTrendDomain = ( domain ) => {
  return {
    type: actionTypes.UPDATE_OXIMETRY_DOMAIN,
    min: domain[0],
    max: domain[1],
  };
};

export const updatePulseTrendDomain = ( domain ) => {
  return {
    type: actionTypes.UPDATE_PULSE_DOMAIN,
    min: domain[0],
    max: domain[1],
  };
};

export const clearTrendDomains = () => {
  return {
    type: actionTypes.CLEAR_TREND_DOMAINS,
  };
};

// Connection State actions
export const updateConnectionState = ( type, status ) => {
  return {
    type,
    status, // true or false
  };
};

// UI State actions
export const runningSpotCheck = ( status ) => {
  return {
    type: actionTypes.TOGGLE_SPOT_CHECK,
    status,
  };
};

export const runningContinuousCheck = ( status ) => {
  return {
    type: actionTypes.TOGGLE_CONTINUOUS_CHECK,
    status,
  };
};

export const resetUiState = () => {
  return {
    type: actionTypes.RESET_UI_STATE,
  };
};

