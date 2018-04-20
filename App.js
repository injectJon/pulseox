import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  ListView,
  TouchableHighlight,
  Image,
  Dimensions,
  ToastAndroid } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import base64js from 'base64-js';

// component imports
import Nonin3230 from './components/Nonin3230';

// Get device dimensions on startup
const deviceWidth = Dimensions.get( 'window' ).width;
const deviceHeight = Dimensions.get( 'window' ).height;

// TODO: use AsyncStorage to store paired devices

export default class App extends React.Component {
  constructor( props ) {
    super( props );

    this.manager = new BleManager();

    this.initialState = {
      advertisingDevices: new Array(),
      advertisingDeviceNames: new Array(),
      device: '',
      isScanning: false,
      isConnected: false,
    }

    this.state = {
      ...this.initialState
    };

    // context binding for component methods
    this.scanForDevices = this.scanForDevices.bind( this );
    this.disconnectFromDevice = this.disconnectFromDevice.bind( this );
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

    this.manager.startDeviceScan( null, null, ( error, device ) => {
      if ( error ) return console.log( error );

      if ( device.name && device.name.startsWith( 'Nonin' ) ) {
        // add the advertising nonin device to the state
        // only if its not already stored
        const advertisingDevices = this.state.advertisingDevices;
        const advertisingDeviceNames = this.state.advertisingDeviceNames;

        if ( advertisingDeviceNames.indexOf( device.name ) < 0 ) {
          advertisingDevices.push( device );
          advertisingDeviceNames.push( device.name );

          this.setState( { advertisingDevices, advertisingDeviceNames } );
        }
      }
    } );

    setTimeout( () => {
      this.manager.stopDeviceScan();
      this.setState( { isScanning: false } );

      if ( this.state.advertisingDevices.length < 1 ) {
        // TODO: no nonin devices were found, notify user with a toast

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

        // handle device disconnect
        device.onDisconnected( ( error, disconnectedDevice ) => {
          this.setState( { ...this.initialState } );
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
      } );
  }

  render() {
    // app state constants
    const isConnected = this.state.isConnected;
    const isScanning = this.state.isScanning;
    const device = this.state.device;
    const advertisingDeviceNames = this.state.advertisingDeviceNames;

    // array of device names found during scan, if any
    const deviceNames =
      this.state.advertisingDeviceNames.length > 0 &&
        this.state.advertisingDeviceNames.map( ( deviceName, i ) => {
          const borderColor =
            isConnected && deviceName === device.name
              ? '#ee7b22'
              : '#4d8ecb'

          return (
            <TouchableHighlight
              style={ [ styles.scannedDevice, { borderColor } ] }
              key={ i }
              onPress={ this.connectToDevice.bind( this, i ) }
            >
              <Text style={ styles.scannedDeviceText }>{ deviceName }</Text>
            </TouchableHighlight>
          );
        } );

    const scanButton =
      isScanning
        ? (
            <Button
              title={ 'Scanning...' }
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

    const deviceSpecificComponent =
      isConnected
        ? (
          <Nonin3230
            device={ device }
            isConnected={ isConnected }
          />
        )
        : <View></View>

    return (
      <View style={ styles.container }>

        <Image
          style={ styles.logo }
          source={ require( './assets/nonin.png' ) }
        />
        <View style={ styles.deviceSpecificComponent }>
          { deviceSpecificComponent }
        </View>
        <View style={ styles.connectionManagement }>
          { connectionManagementButton }

            { deviceNames || <View></View> }
        </View>
      </View>
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
  logo: {
    width: deviceWidth - 100,
    height: 100,
  },
  deviceSpecificComponent: {
    flex: 3,
  },
  connectionManagement: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: deviceWidth - 60,
  },
  connectionManagementButton: {
    width: '100%',
  },
  scannedDevice: {
    width: '100%',
    borderBottomWidth: 2,
    // borderColor: '#ee7b22',
    marginTop: 10,
    padding: 5,
  },
  scannedDeviceText: {
    fontSize: 18,
    textAlign: 'center',
  },
});
