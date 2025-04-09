/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var getDeviceWidthPairs = require('../compiler/getDeviceWidthPairs.cjs');

function responsiveValueFindHigherDeviceWithDefinedValue(value, breakpoint, devices, widths) {
  const componentWidths = widths ? getDeviceWidthPairs.getDeviceWidthPairs(widths, devices) : getDeviceWidthPairs.getDeviceWidthPairsFromDevices(devices);
  const componentWidthIndex = componentWidths.findIndex(x => x.deviceId === breakpoint);
  const componentWidth = devices[componentWidthIndex];
  if (!componentWidth) {
    throw new Error("undefined breakpoint");
  }

  //
  // if (device.breakpoint === null) {
  //   return;
  // }

  for (let i = componentWidthIndex + 1; i <= componentWidths.length - 1; i++) {
    const deviceId = componentWidths[i].deviceId;
    if (value[deviceId] !== undefined) {
      return devices.find(d => d.id === deviceId);
    }
  }
  return undefined;
}
function responsiveValueFindLowerDeviceWithDefinedValue(value, breakpoint, devices, widths) {
  const componentWidths = widths ? getDeviceWidthPairs.getDeviceWidthPairs(widths, devices) : getDeviceWidthPairs.getDeviceWidthPairsFromDevices(devices);
  const componentWidthIndex = componentWidths.findIndex(x => x.deviceId === breakpoint);
  const componentWidth = devices[componentWidthIndex];
  if (!componentWidth) {
    throw new Error("undefined breakpoint");
  }
  for (let i = componentWidthIndex - 1; i >= 0; i--) {
    const deviceId = componentWidths[i].deviceId;
    if (value[deviceId] !== undefined) {
      return devices.find(d => d.id === deviceId);
    }
  }
  return undefined;
}
function responsiveValueFindDeviceWithDefinedValue(value, breakpoint, devices, widths) {
  if (value[breakpoint] !== undefined) {
    return devices.find(x => x.id === breakpoint);
  }
  const higherDevice = responsiveValueFindHigherDeviceWithDefinedValue(value, breakpoint, devices, widths);
  if (higherDevice !== undefined) {
    return higherDevice;
  }
  const lowerDevice = responsiveValueFindLowerDeviceWithDefinedValue(value, breakpoint, devices, widths);
  if (lowerDevice !== undefined) {
    return lowerDevice;
  }
  return undefined;
}

exports.responsiveValueFindDeviceWithDefinedValue = responsiveValueFindDeviceWithDefinedValue;
exports.responsiveValueFindHigherDeviceWithDefinedValue = responsiveValueFindHigherDeviceWithDefinedValue;
exports.responsiveValueFindLowerDeviceWithDefinedValue = responsiveValueFindLowerDeviceWithDefinedValue;
//# sourceMappingURL=responsiveValueFindDeviceWithDefinedValue.cjs.map
