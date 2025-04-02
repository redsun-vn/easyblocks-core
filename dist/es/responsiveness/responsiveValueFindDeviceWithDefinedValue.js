/* with love from shopstory */
import { getDeviceWidthPairs, getDeviceWidthPairsFromDevices } from '../compiler/getDeviceWidthPairs.js';

function responsiveValueFindHigherDeviceWithDefinedValue(value, breakpoint, devices, widths) {
  const componentWidths = widths ? getDeviceWidthPairs(widths, devices) : getDeviceWidthPairsFromDevices(devices);
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
  const componentWidths = widths ? getDeviceWidthPairs(widths, devices) : getDeviceWidthPairsFromDevices(devices);
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

export { responsiveValueFindDeviceWithDefinedValue, responsiveValueFindHigherDeviceWithDefinedValue, responsiveValueFindLowerDeviceWithDefinedValue };
