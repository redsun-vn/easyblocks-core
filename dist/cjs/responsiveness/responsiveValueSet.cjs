/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var isTrulyResponsiveValue = require('./isTrulyResponsiveValue.cjs');

function responsiveValueSet(responsiveValue, deviceId, value, devices) {
  let trulyResponsive;
  if (isTrulyResponsiveValue.isTrulyResponsiveValue(responsiveValue)) {
    trulyResponsive = {
      ...responsiveValue
    };
  } else {
    trulyResponsive = {
      $res: true
    };
    devices.forEach(device => {
      trulyResponsive[device.id] = responsiveValue;
    });
  }
  return {
    ...trulyResponsive,
    [deviceId]: value
  };
}

exports.responsiveValueSet = responsiveValueSet;
