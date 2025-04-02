/* with love from shopstory */
import { isTrulyResponsiveValue } from './isTrulyResponsiveValue.js';
import { responsiveValueFindHigherDeviceWithDefinedValue, responsiveValueFindLowerDeviceWithDefinedValue, responsiveValueFindDeviceWithDefinedValue } from './responsiveValueFindDeviceWithDefinedValue.js';

function responsiveValueGetFirstHigherValue(value, breakpoint, devices, widths) {
  const higherDefinedDevice = responsiveValueFindHigherDeviceWithDefinedValue(value, breakpoint, devices, widths);
  if (!higherDefinedDevice) {
    return;
  }
  return value[higherDefinedDevice.id];
}
function responsiveValueGetFirstLowerValue(value, breakpoint, devices, widths) {
  const lowerDefinedDevice = responsiveValueFindLowerDeviceWithDefinedValue(value, breakpoint, devices, widths);
  if (!lowerDefinedDevice) {
    return;
  }
  return value[lowerDefinedDevice.id];
}
function responsiveValueGetDefinedValue(value, breakpoint, devices, widths) {
  if (!isTrulyResponsiveValue(value)) {
    return value;
  }
  const definedDevice = responsiveValueFindDeviceWithDefinedValue(value, breakpoint, devices, widths);
  if (!definedDevice) {
    return;
  }
  return value[definedDevice.id];
}

export { responsiveValueGetDefinedValue, responsiveValueGetFirstHigherValue, responsiveValueGetFirstLowerValue };
