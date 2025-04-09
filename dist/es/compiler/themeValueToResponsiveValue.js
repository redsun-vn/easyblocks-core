/* with love from shopstory */
import { isTrulyResponsiveValue } from '../responsiveness/isTrulyResponsiveValue.js';

function themeScalarValueToResponsiveValue(input, devices) {
  if (!isTrulyResponsiveValue(input)) {
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

export { themeScalarValueToResponsiveValue };
//# sourceMappingURL=themeValueToResponsiveValue.js.map
