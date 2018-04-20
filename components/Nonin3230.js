import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  ToastAndroid,
  Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import base64js from 'base64-js';
import Icon from 'react-native-vector-icons/dist/FontAwesome';

const deviceWidth = Dimensions.get( 'window' ).width;
const deviceHeight = Dimensions.get( 'window' ).height;

// constants
const CONTINUOUS_SERVICE_INDEX = 2;
const CONTINUOUS_CHARACTERISTIC_INDEX = 0;

export default class Nonin3230 extends React.Component {
  constructor( props ) {
    super( props );

    this.initialState = {
      isMonitoring: false,
      oximetryReading: '',
      pulseRate: '',
      oximetryTrend: new Array(),
      pulseTrend: new Array(),
    }

    this.state = { ...this.initialState };

    // this.getServices = this.getServices.bind( this );
    // this.getCharacteristics = this.getCharacteristics.bind( this );
    this.monitorContinuous = this.monitorContinuous.bind( this );
  }

  async componentDidMount() {
    // 1. toast, ask if user wants spot-check or continuous
    // 2. get relevent service and characteristic
    const device = this.props.device;

    // if user selects continuous:
    const service = await this.getServices( device );
    const characteristic = await this.getCharacteristics( service );
    this.monitorContinuous( characteristic );
  }

  getServices( device ) {
    return new Promise( resolve => {
      device.services()
        .then( services => {
          resolve( services[ CONTINUOUS_SERVICE_INDEX ] );
        } );
    } );
  }

  getCharacteristics( service ) {
    return new Promise( resolve => {
      service.characteristics()
        .then( characteristics => {
          resolve( characteristics[ CONTINUOUS_CHARACTERISTIC_INDEX ] );
        } );
    } );
  }

  monitorContinuous( characteristic ) {
    if ( this.state.isMonitoring ) return;

    // register for notifications, and listen for updates
    characteristic.monitor( ( error, updatedCharacteristic ) => {
      if ( error ) {
        // for some reason this triggers when we disconnect from the device
        this.setState( { isMonitoring: false } );
        return;
      } else {
        this.setState( { isMonitoring: true } );
      }

      const packet = base64js.toByteArray( updatedCharacteristic.value ); // byte array

      // see: 6.2.2 Serial Data Format (DF19) in the Integration Guide
      const parsedPacket = {
        length: packet[ 0 ],  // number of bytes in packet, including this one
        status: packet[ 1 ],  // indicates current device status (see: 6.2.2 of the integration guide)
        batteryVoltage: packet[ 2 ],  // voltage level of device batteries in 0.1 volt increments (decivolts)
        pi: [ packet[ 3 ], packet[ 4 ] ],  // pulse amplitude index (see: 6.2.2 of the integration guide)
        counter: [ packet[ 5 ], packet[ 6 ] ],  // counter for packets, used to confirm no data loss
        oximetryReading: packet[ 7 ],  // SpO_2 percentage, 1-100 (4 beat average as displayed)
        pulseRate: [ packet[ 8 ], packet[ 9 ] ],  // pule rate in beats per min, 0-321 (4 beat average as displayed)
      }


      const oximetryReading = parsedPacket.oximetryReading;
      const pulseRate = parsedPacket.pulseRate;

      // add new readings to trends
      const oximetryTrend = this.state.oximetryTrend;
      oximetryTrend.push( oximetryReading );
      const pulseTrend = this.state.pulseTrend;
      pulseTrend.push( pulseRate );

      this.setState( {
        oximetryReading,
        pulseRate,
        oximetryTrend,
        pulseTrend
      } );
    } );
  }

  render() {
    const isMonitoring = this.state.isMonitoring;

    const oximetryReading =
      isMonitoring
        ? this.state.oximetryReading
        : '- -'

    const pulseRate =
      isMonitoring
        ? this.state.pulseRate[ 1 ]
        : '- -'

    return (
      <View style={ styles.container }>
        <View style={ styles.readingsContainer }>
          <View style={ styles.oximetryReadingContainer }>
            <Text style={ styles.oximetryReadingText }>{ `${ oximetryReading } ` }</Text>
            <Icon name="percent" size={ 30 } style={ { marginBottom: 20 } }/>
            <Text style={ styles.oximetryUnitsMain }>{ ` SpO` }</Text>
            <Text style={ styles.oximetryUnitsSub }>{ `2` }</Text>
          </View>
          <View style={ styles.pulseRateContainer }>
            <Text style={ styles.pulseRateText }>{ `${ pulseRate } ` }</Text>
            <Icon name="heartbeat" size={ 30 } style={ { marginBottom: 20 } }/>
          </View>
        </View>
        <View style={ styles.trends }>

        </View>
      </View>
    );
  }
}

Nonin3230.propTypes = {
  device: PropTypes.object.isRequired,
  isConnected: PropTypes.bool.isRequired,
};

const styles = StyleSheet.create( {
  container: {
    width: deviceWidth - 60,
    // borderTopWidth: 2,
    // borderColor: '#ee7b22',
    height: '100%',
  },
  readingsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oximetryReadingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  oximetryReadingText: {
    fontSize: 90,
  },
  oximetryUnitsMain: {
    fontSize: 30,
    marginBottom: 17,
    fontWeight: 'bold',
  },
  oximetryUnitsSub: {
    fontSize: 15,
    marginBottom: 17,
    fontWeight: 'bold',
  },
  pulseRateContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  pulseRateText: {
    fontSize: 90,
  },
  trends: {

  },
} );
