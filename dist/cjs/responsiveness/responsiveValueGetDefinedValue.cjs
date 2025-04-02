/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var isTrulyResponsiveValue = require('./isTrulyResponsiveValue.cjs');
var responsiveValueFindDeviceWithDefinedValue = require('./responsiveValueFindDeviceWithDefinedValue.cjs');

function responsiveValueGetFirstHigherValue(value, breakpoint, devices, widths) {
  const higherDefinedDevice = responsiveValueFindDeviceWithDefinedValue.responsiveValueFindHigherDeviceWithDefinedValue(value, breakpoint, devices, widths);
  if (!higherDefinedDevice) {
    return;
  }
  return value[higherDefinedDevice.id];
}
function responsiveValueGetFirstLowerValue(value, breakpoint, devices, widths) {
  const lowerDefinedDevice = responsiveValueFindDeviceWithDefinedValue.responsiveValueFindLowerDeviceWithDefinedValue(value, breakpoint, devices, widths);
  if (!lowerDefinedDevice) {
    return;
  }
  return value[lowerDefinedDevice.id];
}
function responsiveValueGetDefinedValue(value, breakpoint, devices, widths) {
  if (!isTrulyResponsiveValue.isTrulyResponsiveValue(value)) {
    return value;
  }
  const definedDevice = responsiveValueFindDeviceWithDefinedValue.responsiveValueFindDeviceWithDefinedValue(value, breakpoint, devices, widths);
  if (!definedDevice) {
    return;
  }
  return value[definedDevice.id];
}

exports.responsiveValueGetDefinedValue = responsiveValueGetDefinedValue;
exports.responsiveValueGetFirstHigherValue = responsiveValueGetFirstHigherValue;
exports.responsiveValueGetFirstLowerValue = responsiveValueGetFirstLowerValue;
