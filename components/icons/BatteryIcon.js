import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/dist/MaterialIcons';
import * as constants from '../../constants';

export const BatteryIcon = ( props ) => {
  const { isLowBattery, size, style } = props;

  const iconName =
    isLowBattery
      ? 'battery-alert'
      : 'battery-full';

  const iconColor =
    isLowBattery
      ? constants.COLOR_LOW_BATTERY
      : constants.COLOR_CHARGED_BATTERY;

  return (
    <Icon
      name={ iconName }
      style={ style }
      size={ size }
      color={ iconColor }
    />
  );
};

BatteryIcon.propTypes = {
  isLowBattery: PropTypes.bool.isRequired,
  size: PropTypes.number.isRequired,
  style: PropTypes.any.isRequired,
};
