/* with love from shopstory */
import { getDevicesWidths } from '../compiler/devices.js';
import { isTrulyResponsiveValue } from './isTrulyResponsiveValue.js';
import { responsiveValueGetDefinedValue } from './responsiveValueGetDefinedValue.js';
import { responsiveValueGetHighestDefinedDevice } from './responsiveValueGetHighestDefinedDevice.js';

// Flattens recursively (max 2 levels)
function responsiveValueFlatten(resVal, devices) {
  if (!isTrulyResponsiveValue(resVal)) {
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
  const maxDeviceInValue = responsiveValueGetHighestDefinedDevice(resValCopy, devices);
  const maxBreakpoint = devices[devices.length - 1].id;

  // Important condition. Sometimes if b5 is missing, b3 can be responsive and have b5 inside. Then b5 is defined.
  if (!resValCopy[maxBreakpoint] && isTrulyResponsiveValue(resValCopy[maxDeviceInValue.id])) {
    activeNestedValue = resValCopy[maxDeviceInValue.id];
  }
  for (let i = devices.length - 1; i >= 0; i--) {
    const breakpoint = devices[i].id;
    const value = resValCopy[breakpoint];
    if (value === undefined) {
      // If active nested value, we take from nested value;
      if (activeNestedValue !== undefined && activeNestedValue[breakpoint] !== undefined) {
        result[breakpoint] = responsiveValueGetDefinedValue(activeNestedValue, breakpoint, devices, getDevicesWidths(devices) /** FOR NOW TOKENS ARE ALWAYS RELATIVE TO SCREEN WIDTH */);
      }
      continue;
    } else if (!isTrulyResponsiveValue(value)) {
      activeNestedValue = undefined;
      result[breakpoint] = value;
    } else {
      activeNestedValue = value;
      result[breakpoint] = responsiveValueGetDefinedValue(activeNestedValue, breakpoint, devices, getDevicesWidths(devices) /** FOR NOW TOKENS ARE ALWAYS RELATIVE TO SCREEN WIDTH */);
    }
  }
  return result;
}

export { responsiveValueFlatten };
//# sourceMappingURL=responsiveValueFlatten.js.map
