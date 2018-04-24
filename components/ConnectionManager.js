import React from 'react';
import PropTypes from 'prop-types';
import { BleManager } from 'react-native-ble-plx';
import base64js from 'base64-js';
import * as constants from '../constants';
import{
  StyleSheet,
  Text,
  View,
  Button,
  ListView,
  TouchableHighlight,
  Image,
  Dimensions,
  ToastAndroid
} from 'react-native';
import {
  BluetoothIcon,
  BatteryIcon,
  EncryptionIcon
} from './icons';

// action imports
import {
  updateConnectionState,
  addAdvertisingDevice,
  setDevice,
  clearDevice
} from '../actions';
import * as actionTypes from '../actionTypes';

const deviceWidth = Dimensions.get( 'window' ).width;

export default class ConnectionManager extends React.Component {
  constructor( props ) {
    super( props );

    this.manager = new BleManager();

    this.scanForDevices = this.scanForDevices.bind( this );
    this.disconnectFromDevice = this.disconnectFromDevice.bind( this );
  }

  componentWillMount() {
    // get and subscribe to redux store
    const { store } = this.context;

    this.store = store;

    this.unsubscribe = store.subscribe( () => this.forceUpdate() );
  }

  componentDidMount() {
    // confirm that bluetooth is enabled(?) on the device
    const subscription = this.manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
          // this.setState( { btIsPowered: true } );
          subscription.remove();
      }
    }, true);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  // gets all advertising nonin devices and stores them in the app state
  scanForDevices() {
    if ( this.store.getState().scanning ) return;

    const scanLength = 10000;

    this.store.dispatch(
      updateConnectionState( actionTypes.TOGGLE_SCANNING, true ),
    );

    this.manager.startDeviceScan( null, null, ( error, device ) => {
      if ( error ) {
        // toggle scanning to false
        this.store.dispatch(
          updateConnectionState( actionTypes.TOGGLE_SCANNING, false ),
        );

        return console.log( error );
      }

      if ( device.name && device.name.startsWith( 'Nonin' ) ) {
        const advertisingDevices = this.store.getState().advertisingDevices;

        // dont add duplicate devices to list
        for ( const advertisingDevice of advertisingDevices ) {
          if ( advertisingDevice.name === device.name) {
            return; // exit early
          }
        }

        // add advertising device
        this.store.dispatch(
          addAdvertisingDevice( device )
        );
    }
    } );

    setTimeout( () => {
      this.manager.stopDeviceScan();

      // toggle scanning to false
      this.store.dispatch(
        updateConnectionState(
          actionTypes.TOGGLE_SCANNING,
          false
        )
      );

      if ( this.state.advertisingDevices.length < 1 ) {
        // TODO: no nonin devices were found, notify user with a toast
      }
    }, scanLength );
  }

  // takes a device name and connects to said device
  connectToDevice( deviceIndex ) {
    const device = this.store.getState().advertisingDevices[ deviceIndex ];

    // connect to selected device
    this.manager.connectToDevice( device.id )
      .then( device => {
        return device.discoverAllServicesAndCharacteristics();
      } )
      .then( device => {
        // set new device
        this.store.dispatch( setDevice( device ) );
        // toggle connected to true
        this.store.dispatch( updateConnectionState(
          actionTypes.TOGGLE_CONNECTED,
          true
        ) );

        // handle device disconnect
        device.onDisconnected( ( error, disconnectedDevice ) => {

          // clear device
          this.store.dispatch( clearDevice() );

          // reset connectionState
          this.store.dispatch(
            updateConnectionState(
              actionTypes.RESET_CONNECTION_STATE
            )
          );
        } );
      } )
      .catch( error => {
        console.error( error );
      } );

  }

  disconnectFromDevice() {
    // disconnect and wipe state
    const device = this.store.getState().device;

    device.cancelConnection()
      .then( cancelledDevice => {
        // remove device
        this.store.dispatch( clearDevice() );

        // reset connectionState
        this.store.dispatch(
          updateConnectionState(
            actionTypes.RESET_CONNECTION_STATE
          )
        );
      } );
  }

  render() {
    const state = this.store.getState();

    const device = state.device;
    const advertisingDeviceNames = state.advertisingDevices.map( d => d.name )

    const isConnected = state.connectionState.connected;
    const isScanning = state.connectionState.scanning;
    const isEncrypted = state.connectionState.encrypted;
    const isLowBattery = state.connectionState.lowBattery;

    const devices =
      advertisingDeviceNames.length > 0 &&
      advertisingDeviceNames.map( ( deviceName, i ) => {
        const borderColor =
            isConnected && deviceName === device.name
              ? constants.COLOR_NONIN_ORANGE
              : constants.COLOR_NONIN_BLUE;

          const iconSize = 20;

          return (
            <View style={ [ styles.scannedDevice, { borderColor } ] }>
              <Text
                style={ styles.scannedDeviceText }
                key={ i }
                onPress={ this.connectToDevice.bind( this, i ) }
              >
                { deviceName }
              </Text>
              <View style={ styles.scannedDeviceIconContainer }>
                {
                  isConnected &&
                    <BatteryIcon
                      isLowBattery={ isLowBattery }
                      size={ iconSize }
                      style={ styles.scannedDeviceIcon }
                    />
                }
                {
                  isConnected &&
                    <EncryptionIcon
                      isEncrypted={ isEncrypted }
                      size={ iconSize }
                      style={ styles.scannedDeviceIcon }
                    />
                }
                <BluetoothIcon
                  isConnected={ isConnected }
                  size={ iconSize }
                  style={ styles.scannedDeviceIcon }
                />
              </View>
            </View>
          );
      } );

    const scanButton =
      isScanning
        ? (
            <Button
              title={ 'Scan for Devices' }
              disabled={ true }
              onPress={ this.scanForDevices }
            />
          )
        : (
            <Button
              title={ 'Scan for Devices' }
              onPress={ this.scanForDevices }
              color={ '#4d8ecb' }
            />
          );

    const disconnectButton = (
      <Button
        title={ 'Disconnect From Device' }
        onPress={ this.disconnectFromDevice }
        color={ '#4d8ecb' }
      />
    );

    const connectionManagementButton =
      isConnected
        ? <View style={ styles.connectionManagementButton }>{ disconnectButton }</View>
        : <View style={ styles.connectionManagementButton }>{ scanButton }</View>;

    return (
      <View style={ styles.container }>

        { isScanning && <Text style={ styles.scanningMessages }>{ 'Scanning...' }</Text> }

        { devices || <View></View> }

        { connectionManagementButton }

      </View>
    );
  }
}

ConnectionManager.contextTypes = {
  store: PropTypes.object,
}

const styles = StyleSheet.create( {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: deviceWidth - 60,
  },
  connectionManagementButton: {
    width: '100%',
    marginBottom: 30,
  },
  scannedDevice: {
    // width: '100%',
    width: deviceWidth - 60,
    borderLeftWidth: 4,
    marginTop: 10,
    marginBottom: 10,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scannedDeviceText: {
    fontSize: 18,
    textAlign: 'center',
  },
  scanningMessages: {
    paddingBottom: 5,
    fontSize: 18,
    textAlign: 'center',
  },
  scannedDeviceIconContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  scannedDeviceIcon: {

  },
} );
