import React from 'react';
import PropTypes from 'prop-types';
import base64js from 'base64-js';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import moment from 'moment';
import * as constants from '../constants'
import {
  StyleSheet,
  Text,
  View,
  Button,
  ToastAndroid,
  Alert,
  Dimensions
} from 'react-native';
import {
  runningSpotCheck,
  runningContinuousCheck
} from '../actions';


// component imports
import SpotCheck from '../components/Nonin3230/SpotCheck';
import Continuous from '../components/Nonin3230/Continuous';

const deviceWidth = Dimensions.get( 'window' ).width;


export default class Nonin3230 extends React.Component {
  constructor( props ) {
    super( props );
  }

  componentWillMount() {
    const { store } = this.context;
    this.store = store;

    this.unsubscribe = store.subscribe( () => this.forceUpdate() );
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
        {text: 'Continuous', onPress: () => this.runContinuousCheck(), style: 'positive'},
      ],
      { cancelable: false }
    );
  }

  runSpotCheck() {
    this.store.dispatch( runningSpotCheck( true ) );
  }

  runContinuousCheck() {
    this.store.dispatch( runningContinuousCheck( true ) );
  }

  render() {
    const state = this.store.getState();
    const isConnected = state.connectionState.connected;
    const runningSpotCheck = state.uiState.runningSpotCheck;
    const runningContinuousCheck = state.uiState.runningContinuousCheck;

    if ( isConnected && ( !runningSpotCheck && !runningContinuousCheck ) ) {
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
          runningContinuousCheck &&
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
