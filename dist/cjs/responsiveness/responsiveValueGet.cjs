/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var isTrulyResponsiveValue = require('./isTrulyResponsiveValue.cjs');

function responsiveValueGet(value, deviceId) {
  if (isTrulyResponsiveValue.isTrulyResponsiveValue(value)) {
    return value[deviceId];
  }
  return value;
}
function responsiveValueForceGet(value, deviceId) {
  if (isTrulyResponsiveValue.isTrulyResponsiveValue(value)) {
    if (value[deviceId] === undefined) {
      const error = `You called responsiveValueForceGet with value ${JSON.stringify(value)} and deviceId: ${deviceId}. Value undefined.`;
      throw new Error(error);
    }
    return value[deviceId];
  }
  return value;
}

exports.responsiveValueForceGet = responsiveValueForceGet;
exports.responsiveValueGet = responsiveValueGet;
