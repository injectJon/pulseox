import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import pulseoxApp from './reducers';
import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  ToastAndroid } from 'react-native';
import * as constants from './constants';

import AppContainer from './components/AppContainer';

const initialState = {
  device: '',
  spotCheck: new Array(),
  continuousCheck: new Array(),
  advertisingDevices: new Array(),
  trendDomains: {
    oximetry: new Array(),
    pulse: new Array(),
  },
  connectionState: {
    scanning: false,
    connected: false,
    encrypted: false,
    lowBattery: false,
    monitoring: false,
    syncing: false,
    synced: false,
  },
  uiState: {
    runningSpotCheck: false,
    runningContinuousCheck: false,
  }
}

export default class App extends React.Component {
  constructor( props ) {
    super( props );
  }

  render() {
    return (
      <Provider store={ createStore( pulseoxApp, initialState ) }>
        <AppContainer />
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  deviceSpecificComponent: {
    flex: 3,
  },
});
