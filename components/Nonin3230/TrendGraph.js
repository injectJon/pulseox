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

const getTickValues = ( data ) => {
  // return array of timestamps in milliseconds
  // return data.map( d =>  d.timestamp );

  return data.map( d => moment( d.timestamp ).format( `h:mm:ss` ) );
};

const getTickLabels = ( values ) => {

  return values.map( v => {
    const time = v;
    // const time = moment( v ).format( `h:mm:ss` );
    let timeSplit = time.split( '' )

    // get seconds and convert to int
    const seconds = parseInt( timeSplit.slice( -2 ).join( '' ) );

    // only push seconds on 5sec intervals

    if ( seconds % 20 === 0 ) {
      return time;
    }
  } );
};

export const TrendGraph = ( props ) => {
  const { data, pulseDomain, oximetryDomain } = props;

  const trendData =
    data.length < 120
      ? data
      : [ ...data.slice( 0, 120 ) ];

  let pulseReadings =
    trendData.map( ( d, i ) => { return { x: i, y: d.reading.pulse } } );

  let oximetryReadings =
    trendData.map( ( d, i ) => { return { x: i, y: d.reading.oximetry } } );

  if ( pulseReadings.length < 2 || oximetryReadings.length < 2 ) {
    return <View></View>;
  }

  // adjust pulse and oximetry domains for trend readability
  oximetryDomain[ 0 ] = oximetryDomain[ 0 ] - 1;
  oximetryDomain[ 1 ] = oximetryDomain[ 1 ] + 1;

  pulseDomain[ 0 ] = pulseDomain[ 0 ] - 5;
  pulseDomain[ 1 ] = pulseDomain[ 1 ] + 5;

  const width = deviceWidth - 60;

  // get x-axis tick values
  const tickValues = getTickValues( trendData );
  const tickLabels = getTickLabels( tickValues );

  return (
    <View style={ styles.trendContainer }>

      <View style={ styles.trend }>
        <VictoryChart
          theme={VictoryTheme.material}
          height={ 150 }
          width={ width }
        >
          <VictoryAxis
            height={ 150 }
            width={ width - 20 }
            standalone={false}
            domain={ [ 1, tickValues.length ] }
            tickValues={ tickValues }
            tickFormat={ tickLabels }
          />
          <VictoryAxis dependentAxis
            height={ 150 }
            width={ width - 20 }
            standalone={false}
            domain={ oximetryDomain }
          />
          <VictoryLine data={ oximetryReadings }/>
        </VictoryChart>
      </View>

    <View style={ styles.trend }>
        <VictoryChart
          theme={VictoryTheme.material}
          height={ 150 }
          width={ width }
        >
          <VictoryAxis
            height={ 150 }
            width={ width - 20 }
            standalone={false}
            domain={ [ 1, tickValues.length ] }
            tickValues={ tickValues }
            tickFormat={ tickLabels }
          />
          <VictoryAxis dependentAxis
            height={ 150 }
            width={ width - 20 }
            standalone={false}
            domain={ pulseDomain }
          />
          <VictoryLine data={ pulseReadings }/>
        </VictoryChart>
      </View>

    </View>
  );
};

TrendGraph.propTypes = {
  data: PropTypes.array.isRequired,
  pulseDomain: PropTypes.array.isRequired,
  oximetryDomain: PropTypes.array.isRequired,
};

const styles = StyleSheet.create( {
  trendContainer: {
    flex: 1,
    width: '100%',
  },
  trend: {
    flex: 1,
  }
} );
