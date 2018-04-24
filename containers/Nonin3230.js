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
import * as constants from '../constants'

// component imports
import SpotCheck from '../components/Nonin3230/SpotCheck';
import Continuous from '../components/Nonin3230/Continuous';

const deviceWidth = Dimensions.get( 'window' ).width;


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

  componentWillMount() {
    const { store } = this.context;
    this.store = store;

    this.unsubscribe = store.subscribe( () => this.forceUpdate() );
  }

  componentDidMount() {

  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  runTaskAlert() {
    Alert.alert(
      'Tasks',
      'Choose a task to perform.',
      [
        {text: 'Spot-Check', onPress: () => this.runSpotCheck(), style: 'positive'},
        {text: 'Continuous', onPress: () => this.runContinuous(), style: 'positive'},
      ],
      { cancelable: false }
    );
  }

  runSpotCheck() {
    this.setState( { runningSpotCheck: true, runningContinuous: false } );
  }

  runContinuous() {
    this.setState( { runningContinuous: true, runningSpotCheck: false } );
  }

  render() {
    const state = this.store.getState();
    const isConnected = state.connectionState.connected;

    const runningSpotCheck = this.state.runningSpotCheck;
    const runningContinuous = this.state.runningContinuous;

    if ( isConnected && !runningSpotCheck && !runningContinuous) {
      this.runTaskAlert();
    }

    return (
      <View style={ styles.container }>
        {
          isConnected &&
          runningSpotCheck &&
            <SpotCheck />
        }
        {
          isConnected &&
          runningContinuous &&
            <Continuous />
        }
      </View>
    );
  }
}

Nonin3230.contextTypes = {
  store: PropTypes.ojbect,
};

const styles = StyleSheet.create( {
  container: {
    width: deviceWidth - 60,
    height: '100%',
  },
} );
