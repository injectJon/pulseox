import React from 'react';
import {
  StyleSheet,
  View,
  Dimensions
} from 'react-native';
import {
  VictoryChart,
  VictoryTheme,
  VictoryLine,
  VictoryAxis
} from 'victory-native';
import PropTypes from 'prop-types';
import moment from 'moment';

import * as constants from '../../constants';

const deviceWidth = Dimensions.get( 'window' ).width;

export const TrendGraph = ( props ) => {
  const { trendType, data, domain } = props;
  let d;

  if ( trendType === constants.OXIMETRY_TREND ) {
    d = [ domain[ 0 ] - 1, domain[ 1 ] + 1 ];
  }

  if ( trendType === constants.PULSE_TREND ) {
    d = [ domain[ 0 ] - 5, domain[ 1 ] + 5 ];
  }

  const adjustedDomain = {
    x: [ 1, 20 ],
    y: d,
  };

  const width = deviceWidth - 60;

  return (
    <View style={ styles.trendContainer }>
      <VictoryChart
        theme={VictoryTheme.material}
        height={ 150 }
        width={ width }
      >
        <VictoryLine data={ data }/>
        <VictoryAxis
          height={ 150 }
          width={ width - 20 }
          standalone={false}
          domain={ adjustedDomain.x }
        />
        <VictoryAxis dependentAxis
          height={ 150 }
          width={ width - 20 }
          standalone={false}
          domain={ adjustedDomain.y }
        />
      </VictoryChart>
    </View>
  );
};

TrendGraph.propTypes = {
  trendType: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  domain: PropTypes.array.isRequired,
};

const styles = StyleSheet.create( {
  trendContainer: {
    flex: 1,
    width: '100%',
  }
} );
