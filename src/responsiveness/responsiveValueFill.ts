import { getDeviceWidthPairs } from "../compiler/getDeviceWidthPairs";
import { Devices, ResponsiveValue, TrulyResponsiveValue } from "../types";
import { isTrulyResponsiveValue } from "./isTrulyResponsiveValue";

export function responsiveValueFill<T>(
  value: ResponsiveValue<T>,
  devices: Devices,
  widths: TrulyResponsiveValue<number>
): ResponsiveValue<T> {
  if (!isTrulyResponsiveValue(value)) {
    return value;
  }

  const componentWidths = getDeviceWidthPairs(widths, devices);
  const result = {
    ...value,
  };

  componentWidths.forEach(({ width, deviceId }, index) => {
    if (result[deviceId] === undefined) {
      // Let's look for a value up
      for (let i = index + 1; i < componentWidths.length; i++) {
        const valueForHigherWidth = result[componentWidths[i].deviceId];

        if (valueForHigherWidth !== undefined) {
          result[deviceId] = valueForHigherWidth;
          break;
        }
      }

      // If still undefined, let's look for a value down
      if (result[deviceId] === undefined) {
        for (let i = index - 1; i >= 0; i--) {
          const valueForLowerWidth = result[componentWidths[i].deviceId];

          if (valueForLowerWidth !== undefined) {
            result[deviceId] = valueForLowerWidth;
            break;
          }
        }
      }

      if (result[deviceId] === undefined) {
        // Nothing defined at any width, so there is nothing to borrow. That
        // means a component's `auto` function returned an empty responsive
        // value, or one keyed only to a device this config no longer has —
        // both of which depend on the values in a saved document, so a throw
        // here blanked the page for one combination of them.
        //
        // Leaving the breakpoint undefined is what the property would have
        // been without the `auto` function at all.
        console.warn(
          `easyblocks: a responsive value had nothing defined at any breakpoint, so "${deviceId}" is left unset`,
        );
      }
    }
  });

  return result;
}
