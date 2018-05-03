import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
// import pulseoxApp from '../reducers';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  ToastAndroid } from 'react-native';
import * as constants from '../constants';

// component imports
import Nonin3230 from '../containers/Nonin3230';
import { Logo } from './Logo';
import ConnectionManager from './ConnectionManager';

// Get device dimensions on startup
const deviceWidth = Dimensions.get( 'window' ).width;
const deviceHeight = Dimensions.get( 'window' ).height;

// TODO: use AsyncStorage to store paired devices

export default class AppContainer extends React.Component {
  constructor( props ) {
    super( props );
  }

  render() {
    return (
      <View style={ styles.container }>

        <Logo />

        <View style={ styles.deviceSpecificComponent }>

          <Nonin3230 />

        </View>

        <ConnectionManager />

      </View>
    );
  }
}

AppContainer.contextTypes = {
  store: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  deviceSpecificComponent: {
    flex: 3,
  },
});