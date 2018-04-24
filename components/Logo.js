import React from 'react';
import {
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';

const deviceWidth = Dimensions.get( 'window' ).width;

export const Logo = () => {
  return (
    <Image
      style={ styles.logo }
      source={ require( '../assets/nonin.png' ) }
    />
  );
}

const styles = StyleSheet.create( {
  logo: {
    width: deviceWidth - 100,
    height: 100,
    marginTop: 7,
  },
} );
