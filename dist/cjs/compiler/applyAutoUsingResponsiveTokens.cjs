/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var isTrulyResponsiveValue = require('../responsiveness/isTrulyResponsiveValue.cjs');
var responsiveValueGetHighestDefinedDevice = require('../responsiveness/responsiveValueGetHighestDefinedDevice.cjs');
var responsiveValueGet = require('../responsiveness/responsiveValueGet.cjs');

function applyAutoUsingResponsiveTokens(input, compilationContext) {
  if (!isTrulyResponsiveValue.isTrulyResponsiveValue(input)) {
    return input;
  }
  const highestDefinedDevice = responsiveValueGetHighestDefinedDevice.responsiveValueGetHighestDefinedDevice(input, compilationContext.devices);
  let highestDefinedValue = responsiveValueGet.responsiveValueForceGet(input, highestDefinedDevice.id);
  const inputAfterAuto = {
    $res: true
  };
  for (let i = compilationContext.devices.length - 1; i >= 0; i--) {
    const device = compilationContext.devices[i];
    const value = responsiveValueGet.responsiveValueGet(input, device.id);
    if (value === undefined && isTrulyResponsiveValue.isTrulyResponsiveValue(highestDefinedValue.value)) {
      inputAfterAuto[device.id] = highestDefinedValue;
    }
    if (value !== undefined) {
      inputAfterAuto[device.id] = value;
      highestDefinedValue = input[device.id];
    }
  }
  return inputAfterAuto;
}

exports.applyAutoUsingResponsiveTokens = applyAutoUsingResponsiveTokens;
