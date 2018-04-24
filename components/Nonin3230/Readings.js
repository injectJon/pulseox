import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  ToastAndroid,
  Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import * as constants from '../../constants';

export const Readings = ( props ) => {
  const { data, isSynced } = props;

  const readingColor =
    isSynced
      ? '#808080'
      : '#4d8ecb';

  return (
    <View style={ styles.parentContainer }>

      <View style={ styles.readingContainer }>
        <Text style={ [ styles.oximetryReadingText, { color: readingColor } ] }>{ `${ data.oximetry } ` }</Text>
        <Icon name="percent" size={ 30 } style={ { marginBottom: 20 } } color={ readingColor }/>
        <Text style={ [ styles.oximetryUnitsMain, { color: readingColor } ] }>{ ` SpO` }</Text>
        <Text style={ [ styles.oximetryUnitsSub, { color: readingColor } ] }>{ `2` }</Text>
      </View>

      <View style={ styles.readingContainer }>
        <Text style={ [ styles.pulseRateText, { color: readingColor } ] }>{ `${ data.pulse } ` }</Text>
        <Icon name="heartbeat" size={ 30 } style={ { marginBottom: 20 } } color={ readingColor }/>
      </View>

    </View>
  );

};

Readings.propTypes = {
  data: PropTypes.object.isRequired,
  isSynced: PropTypes.any,
};

const styles = StyleSheet.create( {
  parentContainer: {
    // flex: 1,

  },
  readingContainer: {
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
  pulseRateText: {
    fontSize: 90,
  },
} );
