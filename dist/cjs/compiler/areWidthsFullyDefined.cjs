/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function areWidthsFullyDefined(widths, devices) {
  let areWidthsFullyDefined = true;
  devices.forEach(device => {
    if (widths[device.id] === -1) {
      areWidthsFullyDefined = false;
    }
  });
  return areWidthsFullyDefined;
}

exports.areWidthsFullyDefined = areWidthsFullyDefined;
