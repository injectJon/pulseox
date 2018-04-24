import React from 'react';
import PropTypes from 'prop-types';
import base64js from 'base64-js';
import * as constants from '../../constants';
import {
  View,
  StyleSheet
} from 'react-native';
import * as actionTypes from '../../actionTypes';
import {
  addContinuousCheckReading,
  updateConnectionState
} from '../../actions';
import { Readings } from './Readings';


// PLX Continuous Measurement, characteristic UUID 0x2A5F
// The UUID for the service is 0x1822

export default class Continuous extends React.Component {
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
        // console.log( readings );

        // if ( !status.displaySync && this.store.getState().connectionState.synced ) {
        //   // spot-check is complete, send Measurement Complete command
        //   this.sendMeasurementComplete();
        // }

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

        this.store.dispatch(
          addContinuousCheckReading( readings )
        );
      }
    );
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

    // console.log( state.continuousCheck );

    let readings =
      state.continuousCheck[ state.continuousCheck.length - 1 ] &&
      state.continuousCheck[ state.continuousCheck.length - 1 ].reading ||
      { pulse: '- -', oximetry: '- -' };

    return (
      <View style={ styles.container }>
        <View style={ styles.readingsContainer }>
          <Readings
            data={ readings }
            isSynced={ false }
          />
        </View>
      </View>
    );
  }
};

Continuous.contextTypes = {
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
