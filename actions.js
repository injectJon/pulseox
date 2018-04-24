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
    timestamp: moment().milliseconds(),
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
    timestamp: moment().milliseconds(),
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

// Connection State actions
export const updateConnectionState = ( type, status ) => {
  return {
    type,
    status, // true or false
  };
};

