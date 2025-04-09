/* with love from shopstory */
import { isTrulyResponsiveValue } from '../responsiveness/isTrulyResponsiveValue.js';
import { responsiveValueGetHighestDefinedDevice } from '../responsiveness/responsiveValueGetHighestDefinedDevice.js';
import { responsiveValueForceGet, responsiveValueGet } from '../responsiveness/responsiveValueGet.js';

function applyAutoUsingResponsiveTokens(input, compilationContext) {
  if (!isTrulyResponsiveValue(input)) {
    return input;
  }
  const highestDefinedDevice = responsiveValueGetHighestDefinedDevice(input, compilationContext.devices);
  let highestDefinedValue = responsiveValueForceGet(input, highestDefinedDevice.id);
  const inputAfterAuto = {
    $res: true
  };
  for (let i = compilationContext.devices.length - 1; i >= 0; i--) {
    const device = compilationContext.devices[i];
    const value = responsiveValueGet(input, device.id);
    if (value === undefined && isTrulyResponsiveValue(highestDefinedValue.value)) {
      inputAfterAuto[device.id] = highestDefinedValue;
    }
    if (value !== undefined) {
      inputAfterAuto[device.id] = value;
      highestDefinedValue = input[device.id];
    }
  }
  return inputAfterAuto;
}

export { applyAutoUsingResponsiveTokens };
//# sourceMappingURL=applyAutoUsingResponsiveTokens.js.map
