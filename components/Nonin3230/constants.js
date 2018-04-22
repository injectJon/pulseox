import { Buffer } from 'buffer';
// 6.2.1 Nonin Oximetry Service (proprietary service)
export const NONIN_SERVICE_UUID = '46A970E0-0D5F-11E2-8B5E-0002A5D5C51B';
export const OXIMETRY_MEASUREMENT_UUID = '0AAD7EA0-0D60-11E2-8E3C-0002A5D5C51B';
export const CONTROL_POINT_UUID = '1447AF80-0D60-11E2-88B6-0002A5D5C51B';

// 6.2.3 Pulse Oximeter Service (standardized service)
export const PLX_SERVICE_UUID = 0x1822;
export const PLX_SPOTCHECK_MEASUREMENT_UUID = 0x2A5E;
export const PLX_CONTINUOUS_MEASUREMENT_UUID = 0x2A5F;
export const PLX_FEATURES_UUID = 0x2A60;
export const PLX_RACP_UUID = 0x2A52;

// Commands
export const SPOTCHECK_INDICATION_COMMAND = Buffer.from( [ 2, 0 ] ).toString( 'base64' );
export const MEASUREMENT_COMPLETE_COMMAND = Buffer.from( [ 0x62, 0x4E, 0x4D, 0x4D, 0x49 ] ).toString( 'base64' );
export const DISPLAY_SYNC_COMMAND = Buffer.from( [ 0x61, 0x05 ] ).toString( 'base64' );

// Types of
export const TYPE_OXIMETRY_READING = 'TYPE_OXIMETRY_READING';
export const TYPE_PULSE_READING = 'TYPE_PULSE_READING';