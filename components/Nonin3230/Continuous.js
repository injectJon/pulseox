import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet
} from 'react-native';

// PLX Continuous Measurement, characteristic UUID 0x2A5F
// The UUID for the service is 0x1822

export default class Continuous extends React.Component {
  constructor( props ) {
    super( props );

    this.initialState = {

    };

    this.state = { ...this.initialState };
  }

  render() {
    return (
      <View style={ styles.container }>

      </View>
    );
  }
};

Continuous.propTypes = {
  device: PropTypes.object.isRequired,
};

const styles = StyleSheet.create( {
  container: {
    flex: 1,
  }
} );
