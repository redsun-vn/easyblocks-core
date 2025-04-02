/* with love from shopstory */
import { isTrulyResponsiveValue } from './isTrulyResponsiveValue.js';

function responsiveValueGet(value, deviceId) {
  if (isTrulyResponsiveValue(value)) {
    return value[deviceId];
  }
  return value;
}
function responsiveValueForceGet(value, deviceId) {
  if (isTrulyResponsiveValue(value)) {
    if (value[deviceId] === undefined) {
      const error = `You called responsiveValueForceGet with value ${JSON.stringify(value)} and deviceId: ${deviceId}. Value undefined.`;
      throw new Error(error);
    }
    return value[deviceId];
  }
  return value;
}

export { responsiveValueForceGet, responsiveValueGet };
