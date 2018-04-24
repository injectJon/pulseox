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

// component imports
import Nonin3230 from './containers/Nonin3230';
import { Logo } from './components/Logo';
import ConnectionManager from './components/ConnectionManager';

// Get device dimensions on startup
const deviceWidth = Dimensions.get( 'window' ).width;
const deviceHeight = Dimensions.get( 'window' ).height;

// TODO: use AsyncStorage to store paired devices

export default class App extends React.Component {
  constructor( props ) {
    super( props );
  }

  render() {
    return (
      <Provider store={ createStore( pulseoxApp, initialState ) }>
        <View style={ styles.container }>

          <Logo />

          <View style={ styles.deviceSpecificComponent }>

            <Nonin3230 />

          </View>

          <ConnectionManager />

        </View>
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
