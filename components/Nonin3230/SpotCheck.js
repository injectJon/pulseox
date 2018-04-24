import React from 'react';
import PropTypes from 'prop-types';
import base64js from 'base64-js';
import * as constants from '../../constants';
import {
  View,
  Text,
  StyleSheet
} from 'react-native';
import * as actionTypes from '../../actionTypes';
import {
  updateConnectionState,
  addSpotCheckReading,
  clearAdvertisingDevices
} from '../../actions';
import { Readings } from './Readings';

// 1: turn on indications for spot-check characteristic
// 2: send display sync command, confirm it was accepted
// 2: wait for sync bit to be set in the status ( DF19 )
// 3: use readings being sent for the spot-check values
// 4: send the measurement complete command
// 5: handle device auto disconnect gracefully

export default class SpotCheck extends React.Component {
  constructor( props ) {
    super( props );
  }

  componentWillMount() {
    const { store } = this.context;

    this.store = store;

    this.unsubscribe = store.subscribe( () => this.forceUpdate() );
  }

  componentDidMount() {
    this.monitorDevice();
    // this.enableIndications();
    this.displaySync();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  monitorDevice() {
    const isMonitoring = this.store.getState().connectionState.monitoring;
    if ( isMonitoring ) return;

    const device = this.store.getState().device;

    device.monitorCharacteristicForService(
      constants.NONIN_SERVICE_UUID,
      constants.OXIMETRY_MEASUREMENT_UUID,
      ( error, response ) => {
        if ( error ) {
          console.log( error );
        }

        const { status, readings } = this.parsePacketData( response.value );

        if ( !status.displaySync && this.store.getState().connectionState.synced ) {
          // spot-check is complete, send Measurement Complete command
          this.sendMeasurementComplete();
        }

        // update connectionState
        this.store.dispatch(
          updateConnectionState(
            actionTypes.TOGGLE_ENCRYPTED,
            status.encrypted
          )
        );
        this.store.dispatch(
          updateConnectionState(
            actionTypes.TOGGLE_LOW_BATTERY,
            status.lowBattery
          )
        );
        this.store.dispatch(
          updateConnectionState(
            actionTypes.TOGGLE_SYNCED,
            status.displaySync
          )
        );

        if ( status.encrypted && status.displaySync ) {
          this.store.dispatch(
            addSpotCheckReading( readings )
          );
        }
      }
    );
  }

  enableIndications() {
    // NOT WORKING ATM: issues with command decoding on native side ble library ???
    // ERROR: 'java.lang.Double cannot be cast to java.lang.String'
    const device = this.store.getState().device;

    device.writeCharacteristicWithoutResponseForService( // do we expect a response?
      constants.PLX_SERVICE_UUID,
      constants.PLX_SPOTCHECK_MEASUREMENT_UUID,
      constants.SPOTCHECK_INDICATION_COMMAND
    )
      .then( ( error, response ) => base64js.toByteArray( response.value ) )
      .then( response => console.log( response ) )

  }

  displaySync() {
    const device = this.store.getState().device;

    device.writeCharacteristicWithResponseForService(
      constants.NONIN_SERVICE_UUID,
      constants.CONTROL_POINT_UUID,
      constants.DISPLAY_SYNC_COMMAND
    )
      .then( response => response.value )
      .then( data => {
        const packet = base64js.toByteArray( data ); // 0 means success
        console.log( packet );
      } );

  }

  sendMeasurementComplete() {
    const device = this.store.getState().device;

    device.writeCharacteristicWithResponseForService(
      constants.NONIN_SERVICE_UUID,
      constants.CONTROL_POINT_UUID,
      constants.MEASUREMENT_COMPLETE_COMMAND
    )
      .then( data => base64js.toByteArray( data.value ) )
      .then( byteArray => {
        const response = byteArray

        console.log( response );
      } );
  }

  parsePacketData( data ) {
    const packet = base64js.toByteArray( data );

    // parse device status -----------------
    let value = packet[ 1 ];
    const statusBits = [ 0, 0, 0, 0, 0, 0, 0, 0 ];
    for ( let i = 7; i >= 0; i-- ) {
      const mod = value % 2;
      value = Math.floor( value/2 );

      statusBits[ i ] = mod;
    }

    const status = {
      encrypted: statusBits[ 1 ],
      lowBattery: statusBits[ 2 ],
      correctCheck: statusBits[ 3 ],
      searching: statusBits[ 4 ],
      passedSPA: statusBits[ 5 ],
      weakPulseSignal: statusBits[ 6 ],
      displaySync: statusBits[ 7 ],
    };

    const readings = {
      pulse: packet[ 8 ] + packet[ 9 ],
      oximetry: packet[ 7 ]
    };

    // parse spot-check readings
    return { status, readings };
  }

  render() {
    let state = this.store.getState();

    let isSynced = state.connectionState.synced;

    let readings =
      state.spotCheck[ state.spotCheck.length - 1 ] &&
      state.spotCheck[ state.spotCheck.length - 1 ].reading ||
      { pulse: '- -', oximetry: '- -' };

    return (
      <View style={ styles.container }>
        {/* <Text>Spot-Check Component</Text> */}
        <View style={ styles.readingsContainer }>
          <Readings
            data={ readings }
            isSynced={ isSynced }
          />
        </View>
      </View>
    );
  }
};

SpotCheck.contextTypes = {
  store: PropTypes.object,
};

const styles = StyleSheet.create( {
  container: {
    flex: 1,
  },
  readingsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
} );
