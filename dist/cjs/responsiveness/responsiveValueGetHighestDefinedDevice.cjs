/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function responsiveValueGetHighestDefinedDevice(input, devices) {
  let highestDefinedDevice;
  for (let i = devices.length - 1; i >= 0; i--) {
    const device = devices[i];
    if (input[device.id] !== undefined) {
      highestDefinedDevice = device;
      break;
    }
  }
  if (highestDefinedDevice === undefined) {
    throw new Error("highest defined value doesn't exist");
  }
  return highestDefinedDevice;
}

exports.responsiveValueGetHighestDefinedDevice = responsiveValueGetHighestDefinedDevice;
//# sourceMappingURL=responsiveValueGetHighestDefinedDevice.cjs.map
