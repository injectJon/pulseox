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
import Icon from 'react-native-vector-icons/dist/MaterialIcons';

// component imports
import Nonin3230 from './components/Nonin3230/Nonin3230';

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
      devicesDetected: true,
      isScanning: false,
      isConnected: false,
      isEncrypted: false,
      isLowBattery: false,
    }

    this.state = {
      ...this.initialState
    };

    // context binding for component methods
    this.scanForDevices = this.scanForDevices.bind( this );
    this.disconnectFromDevice = this.disconnectFromDevice.bind( this );
    this.handleDeviceIsEncrypted = this.handleDeviceIsEncrypted.bind( this );
    this.handleDeviceLowBattery = this.handleDeviceLowBattery.bind( this );
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

          this.setState( { advertisingDevices, advertisingDeviceNames, devicesDetected: true } );
        }
      }
    } );

    setTimeout( () => {
      this.manager.stopDeviceScan();
      this.setState( { isScanning: false } );

      if ( this.state.advertisingDevices.length < 1 ) {
        // TODO: no nonin devices were found, notify user with a toast
        this.setState( { devicesDetected: false } )
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

          // hack job, these werent resetting themselves when setting to initialState
          this.setState( { advertisingDevices: new Array(), advertisingDeviceNames: new Array() } )
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

  handleDeviceDisconnect() {
    this.setState( { isConnected: false } );
  }

  handleDeviceIsEncrypted( status ) {
    this.setState( { isEncrypted: status } );
  }

  handleDeviceLowBattery( status ) {
    this.setState( { isLowBattery: status } );
  }

  render() {
    // app state constants
    const isConnected = this.state.isConnected;
    const isScanning = this.state.isScanning;
    const isEncrypted = this.state.isEncrypted;
    const isLowBattery = this.state.isLowBattery;
    const devicesDetected = this.state.devicesDetected;
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

          const btIconName =
            isConnected && deviceName === device.name
              ? 'bluetooth-connected'
              : 'bluetooth';

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
                    <Icon
                      name={ ( isLowBattery && 'battery-alert' ) || 'battery-full' }
                      style={ styles.scannedDeviceIcon }
                      size={ 20 }
                      color={ ( isLowBattery && '#f45c42' ) || '#8fe228' }
                    />
                }
                {
                  isConnected &&
                    <Icon
                      name='enhanced-encryption'
                      style={ styles.scannedDeviceIcon }
                      size={ 20 }
                      color={ ( isEncrypted && '#ee7b22' ) || '#4d8ecb' }
                    />
                }
                <Icon
                  name={ btIconName }
                  style={ styles.scannedDeviceIcon }
                  size={ 20 }
                  color={ ( isConnected && '#ee7b22' ) || '#4d8ecb' }
                />
              </View>
            </View>
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
            handleDeviceIsEncrypted={ this.handleDeviceIsEncrypted }
            handleLowBattery={ this.handleDeviceLowBattery }
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


          { !devicesDetected && <Text style={ styles.noDevicesDetectedText }>{ 'No Nonin devices were detected.' }</Text> }

          { deviceNames || <View></View> }

          { connectionManagementButton }

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
    marginTop: 7,
  },
  deviceSpecificComponent: {
    flex: 3,
  },
  connectionManagement: {
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
  noDevicesDetectedText: {
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
});
