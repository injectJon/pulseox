import React from 'react';
import PropTypes from 'prop-types';
import base64js from 'base64-js';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import moment from 'moment';
import {
  StyleSheet,
  Text,
  View,
  Button,
  ToastAndroid,
  Alert,
  Dimensions } from 'react-native';

// import constants
import * as constants from './constants'

// component imports
// import { TrendGraph } from './TrendGraph';
// import { Reading } from './Reading';
import SpotCheck from './SpotCheck';
import Continuous from './Continuous';

const deviceWidth = Dimensions.get( 'window' ).width;
const deviceHeight = Dimensions.get( 'window' ).height;


export default class Nonin3230 extends React.Component {
  constructor( props ) {
    super( props );

    this.initialState = {
      runningSpotCheck: false,
      runningContinuous: false,
    }

    this.state = { ...this.initialState };

    this.runSpotCheck = this.runSpotCheck.bind( this );
    this.runContinuous = this.runContinuous.bind( this );
  }

  componentDidMount() {

    Alert.alert(
      'Tasks',
      'Choose a task to perform.',
      [
        {text: 'Spot-Check', onPress: () => this.runSpotCheck(), style: 'positive'},
        {text: 'Continuous', onPress: () => this.runContinuous(), style: 'positive'},
      ],
      { cancelable: false }
    )
  }

  runSpotCheck() {


    this.setState( { runningSpotCheck: true, runningContinuous: false } );
  }

  runContinuous() {


    this.setState( { runningContinuous: true, runningSpotCheck: false } );
  }

  render() {
    const runningSpotCheck = this.state.runningSpotCheck;
    const runningContinuous = this.state.runningContinuous;

    return (
      <View style={ styles.container }>
        {
          runningSpotCheck &&
            <SpotCheck
              device={ this.props.device }
              handleDeviceIsEncrypted={ this.props.handleDeviceIsEncrypted }
              handleLowBattery={ this.props.handleLowBattery }
            />
        }
        {
          runningContinuous &&
            <Continuous device={ this.props.device } />
        }
      </View>
    );
  }
}

Nonin3230.propTypes = {
  device: PropTypes.object.isRequired,
  isConnected: PropTypes.bool.isRequired,
  handleDeviceIsEncrypted: PropTypes.func.isRequired,
  handleLowBattery: PropTypes.func.isRequired,
  handleDeviceDisconnect: PropTypes.func.isRequired,
};

const styles = StyleSheet.create( {
  container: {
    width: deviceWidth - 60,
    height: '100%',
  },
} );
