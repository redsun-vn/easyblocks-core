/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var devices = require('../compiler/devices.cjs');
var isTrulyResponsiveValue = require('./isTrulyResponsiveValue.cjs');
var responsiveValueGetDefinedValue = require('./responsiveValueGetDefinedValue.cjs');
var responsiveValueGetHighestDefinedDevice = require('./responsiveValueGetHighestDefinedDevice.cjs');

// Flattens recursively (max 2 levels)
function responsiveValueFlatten(resVal, devices$1) {
  if (!isTrulyResponsiveValue.isTrulyResponsiveValue(resVal)) {
    return resVal;
  }
  const result = {
    $res: true
  };
  let activeNestedValue = undefined;

  // resValCopy has maximum breakpoint always set correctly, otherwise if we have b1, ..., b5 and responsive value is set to b4, then values ABOVE b4 won't be set.
  const resValCopy = {
    ...resVal
  };
  const maxDeviceInValue = responsiveValueGetHighestDefinedDevice.responsiveValueGetHighestDefinedDevice(resValCopy, devices$1);
  const maxBreakpoint = devices$1[devices$1.length - 1].id;

  // Important condition. Sometimes if b5 is missing, b3 can be responsive and have b5 inside. Then b5 is defined.
  if (!resValCopy[maxBreakpoint] && isTrulyResponsiveValue.isTrulyResponsiveValue(resValCopy[maxDeviceInValue.id])) {
    activeNestedValue = resValCopy[maxDeviceInValue.id];
  }
  for (let i = devices$1.length - 1; i >= 0; i--) {
    const breakpoint = devices$1[i].id;
    const value = resValCopy[breakpoint];
    if (value === undefined) {
      // If active nested value, we take from nested value;
      if (activeNestedValue !== undefined && activeNestedValue[breakpoint] !== undefined) {
        result[breakpoint] = responsiveValueGetDefinedValue.responsiveValueGetDefinedValue(activeNestedValue, breakpoint, devices$1, devices.getDevicesWidths(devices$1) /** FOR NOW TOKENS ARE ALWAYS RELATIVE TO SCREEN WIDTH */);
      }
      continue;
    } else if (!isTrulyResponsiveValue.isTrulyResponsiveValue(value)) {
      activeNestedValue = undefined;
      result[breakpoint] = value;
    } else {
      activeNestedValue = value;
      result[breakpoint] = responsiveValueGetDefinedValue.responsiveValueGetDefinedValue(activeNestedValue, breakpoint, devices$1, devices.getDevicesWidths(devices$1) /** FOR NOW TOKENS ARE ALWAYS RELATIVE TO SCREEN WIDTH */);
    }
  }
  return result;
}

exports.responsiveValueFlatten = responsiveValueFlatten;
