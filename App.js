import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  ToastAndroid } from 'react-native';
import * as constants from './components/Nonin3230/constants';

// component imports
import Nonin3230 from './components/Nonin3230/Nonin3230';
import ConnectionManager from './components/ConnectionManager';

// Get device dimensions on startup
const deviceWidth = Dimensions.get( 'window' ).width;
const deviceHeight = Dimensions.get( 'window' ).height;

// TODO: use AsyncStorage to store paired devices

export default class App extends React.Component {
  constructor( props ) {
    super( props );

    this.initialState = {
      device: '',
      isScanning: false,
      isConnected: false,
      isEncrypted: false,
      isLowBattery: false,
    }

    this.state = {
      ...this.initialState
    };

    // context binding for component methods
    this.handleDeviceIsEncrypted = this.handleDeviceIsEncrypted.bind( this );
    this.handleDeviceLowBattery = this.handleDeviceLowBattery.bind( this );
    this.onConnectionEvent = this.onConnectionEvent.bind( this );
    this.onScanningEvent = this.onScanningEvent.bind( this );
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

  onConnectionEvent( isConnected, device ) {
    if ( !isConnected || !device ) {
      this.setState( { ...this.initialState } );
      return;
    }

    this.setState( { isConnected, device } )
  }

  onScanningEvent( isScanning ) {
    this.setState( { isScanning } );
  }

  render() {
    // app state constants
    const isConnected = this.state.isConnected;
    const isScanning = this.state.isScanning;
    const isEncrypted = this.state.isEncrypted;
    const isLowBattery = this.state.isLowBattery;
    const device = this.state.device;

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
        <ConnectionManager
          onScanningEvent={ this.onScanningEvent }
          onConnectionEvent={ this.onConnectionEvent }
          isEncrypted={ isEncrypted }
          isLowBattery={ isLowBattery }
        />
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
});
