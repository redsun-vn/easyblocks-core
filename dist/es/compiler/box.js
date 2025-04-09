/* with love from shopstory */
import { flattenResponsiveStyles } from './flattenResponsiveStyles.js';

function compileBox(input, devices) {
  if (typeof input === "object" && input.$res) {
    const ret = {};
    for (const key in input) {
      if (key !== "$res") {
        ret["@" + key] = input[key];
      }
    }
    return ret;
  } else if (typeof input === "object" && input !== null) {
    const ret = {};

    /**
     * FIXME: there's a bug here!!!
     *
     * I don't know what to do about it. We add items in a correct order to the ret object, and JS should keep this order
     * but it clearly doesn't work and order gets broken. This breaks where "unset" is set in CSS and hence, inheritance is broken.
     *
     * This can be fixed by adding "specific media queries" (from - to) here. It's gonna work.
     */

    for (const key in input) {
      const val = input[key];
      if (typeof val === "object" && val.$res === true) {
        // const maxBreakpoint = responsiveValueGetMaxDefinedBreakpoint(val, devices);

        let isFirst = true;
        for (let i = devices.length - 1; i >= 0; i--) {
          const breakpoint = devices[i].id;
          if (val[breakpoint] === null || val[breakpoint] === undefined) {
            continue;
          }
          if (isFirst) {
            ret[key] = val[breakpoint];
            isFirst = false;
          } else {
            if (!ret["@" + breakpoint]) {
              ret["@" + breakpoint] = {};
            }
            ret["@" + breakpoint][key] = val[breakpoint];
          }
        }
        continue;
      }
      ret[key] = compileBox(val, devices);
    }
    return ret;
  }
  return input;
}
function getBoxStyles(styles, devices) {
  const flattenStyles = flattenResponsiveStyles(styles);
  const ret = {};

  // First copy all the non-responsive values
  for (const key in flattenStyles) {
    if (!key.startsWith("@") && key !== "__isBox" && key !== "__hash") {
      ret[key] = flattenStyles[key];
    }
  }

  // now copy breakpoint values in correct order
  for (let i = devices.length - 1; i >= 0; i--) {
    const device = devices[i];
    const breakpoint = device.id;

    // correct order!
    if (flattenStyles["@" + breakpoint]) {
      const resolvedKey = resolveDeviceIdToMediaQuery(device);
      ret[resolvedKey] = flattenStyles["@" + breakpoint];
    }
  }
  return ret;
}
function resolveDeviceIdToMediaQuery(device) {
  return `@media (max-width: ${device.breakpoint - 1}px)`;
}

export { compileBox, getBoxStyles };
//# sourceMappingURL=box.js.map
