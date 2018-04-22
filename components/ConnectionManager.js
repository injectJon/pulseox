import React from 'react';
import PropTypes from 'prop-types';
import { BleManager } from 'react-native-ble-plx';
import base64js from 'base64-js';
import * as constants from './components/Nonin3230/constants';
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

export default class ConnectionManager extends React.Component {
  constructor( props ) {
    super( props );

    this.manager = new BleManager();

    this.initialState = {
      advertisingDevices: new Array(),
      devicesDetected: true, // initialized as true to prevent display on initial render
      isScanning: false,
      isConnected: false,
      isEncrypted: false,
      isLowBattery: false,
      device: '',
    };

    this.state = { ...this.initialState };

    this.scanForDevices = this.scanForDevices.bind( this );
    this.disconnectFromDevice = this.disconnectFromDevice.bind( this );

    // handlers to bubble up connection state
    this.onScanningEvent = this.props.onScanningEvent;
    this.onConnectionEvent = this.props.onConnectionEvent;

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

  // gets all advertising nonin devices and stores them in the app state
  scanForDevices() {
    if ( this.state.isScanning ) return;

    // scan for 10sec then notify: no device found
    this.setState( { isScanning: true } )
    this.onScanningEvent( true );

    this.manager.startDeviceScan( null, null, ( error, device ) => {
      if ( error ) {
        this.setState( { isScanning: false } );
        this.onScanningEvent( false );

        return console.log( error );
      }

      if ( device.name && device.name.startsWith( 'Nonin' ) ) {
        // add the advertising nonin device to the state
        // only if its not already stored
        const advertisingDevices = this.state.advertisingDevices;
        const advertisingDeviceNames = this.state.advertisingDeviceNames;

        if ( advertisingDeviceNames.indexOf( device.name ) < 0 ) {
          advertisingDevices.push( device );
          advertisingDeviceNames.push( device.name );

          this.setState( { advertisingDevices, advertisingDeviceNames, devicesDetected: true } );
        }
      }
    } );

    setTimeout( () => {
      this.manager.stopDeviceScan();
      this.setState( { isScanning: false } );

      if ( this.state.advertisingDevices.length < 1 ) {
        // TODO: no nonin devices were found, notify user with a toast
        this.setState( { devicesDetected: false } );
        this.onScanningEvent( false );
      }

    }, 10000 );

  }

  // takes a device name and connects to said device
  connectToDevice( deviceIndex ) {
    const device = this.state.advertisingDevices[ deviceIndex ];

    // connect to selected device
    this.manager.connectToDevice( device.id )
      .then( device => {
        return device.discoverAllServicesAndCharacteristics();
      } )
      .then( device => {
        // TODO: Toast and ask for spot-check/continuous functionality

        this.setState( { device, isConnected: true } );
        this.onConnectionEvent( true, device );

        // handle device disconnect
        device.onDisconnected( ( error, disconnectedDevice ) => {
          this.setState( { ...this.initialState } );
          this.onConnectionEvent( false, '' );

          // hack job, these werent resetting themselves when setting to initialState
          this.setState( { advertisingDevices: new Array() } )
        } );
      } )
      .catch( error => {
        console.error( error );
      } );

  }

  disconnectFromDevice() {
    // disconnect and wipe state
    const device = this.state.device;

    device.cancelConnection()
      .then( cancelledDevice => {
        this.setState( { ...this.initialState } );
        this.onConnectionEvent( false, '' );
      } );
  }

  render() {
    // constants
    const isConnected = this.state.isConnected;
    const isScanning = this.state.isScanning;
    const devicesDetected = this.state.devicesDetected;
    const device = this.state.device;
    const advertisingDeviceNames = this.state.advertisingDevices.map( d => d.name );
    const isEncrypted = this.props.isEncrypted;
    const isLowBattery = this.props.isLowBattery;

    const devices =
      this.state.advertisingDeviceNames.length > 0 &&
      this.state.advertisingDeviceNames.map( ( deviceName, i ) => {
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

        { !devicesDetected && <Text style={ styles.scanningMessages }>{ 'No Nonin devices were detected.' }</Text> }

        { deviceNames || <View></View> }

        { connectionManagementButton }

      </View>
    );
  }
}

ConnectionManager.propTypes = {
  // app state change handlers
  onScanningEvent: PropTypes.func.isRequired,
  onConnectionEvent: PropTypes.func.isRequired,
  // app state values
  isEncrypted: PropTypes.any.isRequired,
  isLowBattery: PropTypes.any.isRequired,
};

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
