import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/dist/MaterialIcons';
import * as constants from '../../constants';

export const EncryptionIcon = ( props ) => {
  const { isEncrypted, size, style } = props;

  const iconName =
    isEncrypted
      ? 'enhanced-encryption'
      : 'no-encryption';

  const iconColor =
    isEncrypted
      ? constants.COLOR_NONIN_ORANGE
      : constants.COLOR_NONIN_BLUE;

  return (
    <Icon
      name={ iconName }
      style={ style }
      size={ size }
      color={ iconColor }
    />
  );
};

EncryptionIcon.propTypes = {
  isEncrypted: PropTypes.bool.isRequired,
  size: PropTypes.number.isRequired,
  style: PropTypes.any.isRequired,
};
