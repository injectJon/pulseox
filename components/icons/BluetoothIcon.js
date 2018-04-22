import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/dist/MaterialIcons';
import * as constants from '../Nonin3230/constants';

export const BluetoothIcon = ( props ) => {
  const { isConnected, size, style } = props;

  const iconName =
    isConnected
      ? 'bluetooth-connected'
      : 'bluetooth';

  const iconColor =
    isConnected
      ? '#ee7b22'
      : '#4d8ecb';

  return (
    <Icon
      name={ iconName }
      style={ style }
      size={ size }
      color={ iconColor }
    />
  );
};

BluetoothIcon.propTypes = {
  isConnected: PropTypes.bool.isRequired,
  size: PropTypes.number.isRequired,
  style: PropTypes.any.isRequired,
};

