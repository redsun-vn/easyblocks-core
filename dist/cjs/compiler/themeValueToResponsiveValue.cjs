/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var isTrulyResponsiveValue = require('../responsiveness/isTrulyResponsiveValue.cjs');

function themeScalarValueToResponsiveValue(input, devices) {
  if (!isTrulyResponsiveValue.isTrulyResponsiveValue(input)) {
    return input;
  }
  const output = {
    $res: true
  };
  devices.forEach(device => {
    const val = input[device.id];
    if (val !== undefined) {
      output[device.id] = val;
    }
  });
  return output;
}

exports.themeScalarValueToResponsiveValue = themeScalarValueToResponsiveValue;
//# sourceMappingURL=themeValueToResponsiveValue.cjs.map
