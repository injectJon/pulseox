import { combineReducers, createStore } from 'redux';
import moment from 'moment';

import * as actionTypes from './actionTypes';

const initialState = {
  device: '',
  spotCheck: new Array(),
  continuousCheck: new Array(),
  advertisingDevices: new Array(),
  connectionState: {
    scanning: false,
    connected: false,
    encrypted: false,
    lowBattery: false,
    monitoring: false,
    syncing: false,
    synced: false,
  },
}

const device = ( state = initialState.device, action ) => {
  switch( action.type ) {
    case actionTypes.SET_DEVICE:
      return action.device;
    case actionTypes.CLEAR_DEVICE:
      return action.device;
    default:
      return state;
  };
};

const spotCheck = ( state = initialState.spotCheck, action ) => {
  switch( action.type ) {
    case actionTypes.ADD_SPOTCHECK_READING:
      return [
        ...state,
        {
          timestamp: action.timestamp,
          reading: action.reading,
        }
      ];
    case actionTypes.CLEAR_SPOTCHECK_READINGS:
      return [];
    default:
      return state;
  };
};

const continuousCheck = ( state = initialState.continuousCheck, action ) => {
  switch( action.type ) {
    case actionTypes.ADD_CONTINUOUSCHECK_READING:
      return [
        ...state,
        {
          timestamp: action.timestamp,
          reading: action.reading,
        }
      ];
    case actionTypes.CLEAR_CONTINUOUSCHECK_READINGS:
      return [];
    default:
      return state;
  }
};

const advertisingDevices = ( state = initialState.advertisingDevices, action ) => {
  switch( action.type ) {
    case actionTypes.ADD_ADVERTISING_DEVICE:
      return [
        ...state,
        action.device,
      ];
    case actionTypes.REMOVE_ADVERTISING_DEVICE:
      return state.map( device => {
        if ( device.id !== action.deviceId ) {
          return device;
        }
      } );
    case actionTypes.CLEAR_ADVERTISING_DEVICES:
      return new Array();
    default:
      return state;
  }
};

const connectionState = ( state = initialState.connectionState, action ) => {
  switch( action.type ) {
    case actionTypes.TOGGLE_SCANNING:
      return {
        ...state,
        scanning: action.status,
      };

    case actionTypes.TOGGLE_CONNECTED:
      return {
        ...state,
        connected: action.status,
      };

    case actionTypes.TOGGLE_ENCRYPTED:
      return {
        ...state,
        encrypted: action.status,
      };

    case actionTypes.TOGGLE_LOW_BATTERY:
      return {
        ...state,
        lowBattery: action.status,
      };

    case actionTypes.TOGGLE_MONITORING:
      return {
        ...state,
        monitoring: action.status,
      };

    case actionTypes.TOGGLE_SYNCING:
      return {
        ...state,
        syncing: action.status,
      };

    case actionTypes.TOGGLE_SYNCED:
      return {
        ...state,
        synced: action.status,
      };

    case actionTypes.RESET_CONNECTION_STATE:
      return {
        ...state,
        ...initialState.connectionState,
      };
    default:
      return state;
  }
};

const pulseoxApp = combineReducers( {
  device,
  advertisingDevices,
  spotCheck,
  continuousCheck,
  connectionState,
} );

export default pulseoxApp;
