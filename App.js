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

// Get device dimensions on startup
const deviceWidth = Dimensions.get( 'window' ).width;
const deviceHeight = Dimensions.get( 'window' ).height;

// Service/Characteristics relevent UUID constants
// TODO: Find relevent/useful UUID's in integration guide
const NONIN_OXIMETRY_SERVICE_UUID = '46a970e0-0d5f-11e2-8b5e-0002a5d5c51b';
const SPOT_CHECK = '';

export default class App extends React.Component {
  constructor( props ) {
    super( props );

    this.manager = new BleManager();

    this.initialState = {
      advertisingDevices: new Array(),
      advertisingDeviceNames: new Array(),
      device: '',
      deviceServices: new Array(),
      isScanning: false,
      isConnected: false,
      oximetryCharacteristic: '',
      oximetryMonitorData: new Array(),
      updatedReading: {
        oximetry: '',
        pulse: '',
      }
    }

    this.state = {
      ...this.initialState
    };

    // context binding for component methods
    this.scanForDevices = this.scanForDevices.bind( this );
    this.getDeviceServices = this.getDeviceServices.bind( this );
    this.getDeviceCharacteristics = this.getDeviceCharacteristics.bind( this );
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
    console.log( deviceIndex );
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

        this.getDeviceServices( device );
      } )
      .catch( error => {
        console.error( error );
      } );

  }

  getDeviceServices( device ) {
    // get services
    device.services()
      // store only oximetry measurement service
      .then( services => {
        const deviceServices = this.state.deviceServices;
        deviceServices.push( services[ 2 ] );

        this.setState( { deviceServices } );

        this.getDeviceCharacteristics();
      } );
  }

  getDeviceCharacteristics() {
    const deviceServices = this.state.deviceServices;

    deviceServices[ 0 ].characteristics()
      .then( characteristics => {
        const oximetryCharacteristic = characteristics[ 0 ];
        this.setState( { oximetryCharacteristic } );

        // subscribe to notifications for this characteristic
        oximetryCharacteristic.monitor( ( error, characteristic, transactionId ) => {
          const oximetryMonitorData = this.state.oximetryMonitorData;

          const newMonitorData = base64js.toByteArray( characteristic.value );

          const updatedReading = {
            oximetry: newMonitorData[ 7 ],
            pulse: newMonitorData[ 9 ],
          }

          // console.log( newMonitorData );
          oximetryMonitorData.push( newMonitorData );

          this.setState( { oximetryMonitorData, updatedReading } );
        } );
      } );
  }

  disconnectFromDevice() {
    // disconnect and wipe state
    const device = this.state.device;

    device.cancelConnection()
      .then( cancelledDevice => {
        // TODO: create an initial state class property
        this.setState( {
          advertisingDevices: new Array(),
          advertisingDeviceNames: new Array(),
          device: '',
          deviceServices: new Array(),
          isScanning: false,
          isConnected: false,
          oximetryMonitorData: new Array(),
        } );
      } );
  }

  render() {
    // app state boolean constants
    const isConnected = this.state.isConnected;
    const isScanning = this.state.isScanning;
    const haveServices = this.state.deviceServices.length > 0;
    const haveCharacteristics =
      haveServices &&
      this.state.deviceServices[0].foundCharacteristics &&
      this.state.deviceServices[0].foundCharacteristics.length > 0;
    const haveOximetryNotifications = this.state.oximetryMonitorData.length > 0;
    const haveOximetryReading = ( this.state.updatedReading.oximetry );
    const havePulseReading = ( this.state.updatedReading.pulse );

    const readings =
      ( haveOximetryReading && havePulseReading )
        ? (
            <View>
              <Text style={ styles.readings }>{ `SpO2: ${ this.state.updatedReading.oximetry }` }</Text>
              <Text style={ styles.readings }>{ `(<3): ${ this.state.updatedReading.pulse }` }</Text>
            </View>
          )
        : <Text>No Readings..</Text>

    // array of device names found during scan, if any
    const advertisingDeviceNames =
      this.state.advertisingDeviceNames.length < 1
        ? <Text>...</Text>
        : this.state.advertisingDeviceNames.map( ( deviceName, i ) => {
          return (
            <TouchableHighlight
              style={ styles.scannedDevice }
              key={ i }
              onPress={ this.connectToDevice.bind( this, i ) }
            >
              <Text>{ deviceName }</Text>
            </TouchableHighlight>
          );
        } );

      const dataLog =
        !haveOximetryNotifications
          ? <Text>No oximetry notification data yet...</Text>
          : this.state.oximetryMonitorData.map( ( value, i ) => {
            return (
              <Text key={ i }>{ value.toString() }</Text>
            )
          } )


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
              />
            )

      const disconnectButton = (
        <Button
          title={ 'Disconnect From Device' }
          onPress={ this.disconnectFromDevice }
        />
      )

    return (
      <View style={ styles.container }>
        <Image
          style={ styles.logo }
          source={ require( './assets/nonin.png' ) }
        />
        {
          readings
        }

        <View style={ styles.oximeteryReading }></View>
        <View style={ styles.pulseReading }></View>

        {/* <Text style={ styles.scannedDevice }>{ `Connected: ${ isConnected }`  }</Text>
        <Text style={ styles.scannedDevice }>{ `Scanning: ${ isScanning }` }</Text>
        <Text style={ styles.scannedDevice }>{ `Services Retrieved: ${ haveServices }` }</Text>
        <Text style={ styles.scannedDevice }>{ `Characteristics Retrieved: ${ haveCharacteristics || false }` }</Text> */}

        {
          isConnected
            ? disconnectButton
            : scanButton
        }
        <View>
          {
            advertisingDeviceNames.length > 0
              ? advertisingDeviceNames
              : <Text style={ styles.scannedDevice }>No Nonin devices found...</Text>
          }
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
  oximeteryReading: {

  },
  pulseReading: {

  },
  scanButton: {
    // minWidth: deviceWidth - 100,
    // margin: 10,
  },
  scannedDevice: {
    margin: 10,
  },
  readings: {
    fontSize: 72,
    margin: 10,
  }
});
