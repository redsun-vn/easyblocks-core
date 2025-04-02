/* with love from shopstory */
import { isTrulyResponsiveValue } from './isTrulyResponsiveValue.js';

function responsiveValueSet(responsiveValue, deviceId, value, devices) {
  let trulyResponsive;
  if (isTrulyResponsiveValue(responsiveValue)) {
    trulyResponsive = {
      ...responsiveValue
    };
  } else {
    trulyResponsive = {
      $res: true
    };
    devices.forEach(device => {
      trulyResponsive[device.id] = responsiveValue;
    });
  }
  return {
    ...trulyResponsive,
    [deviceId]: value
  };
}

export { responsiveValueSet };
