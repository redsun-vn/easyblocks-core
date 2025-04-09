/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function resop(config, callback, devices) {
  // Decompose config into scalar configs
  const scalarConfigs = {};
  devices.forEach(device => {
    scalarConfigs[device.id] = scalarizeConfig(config, device.id);
  });
  const scalarOutputs = {};

  // run callback for scalar configs
  devices.forEach(device => {
    scalarOutputs[device.id] = callback(scalarConfigs[device.id], device.id);
  });
  return squashCSSResults(scalarOutputs, devices);
}
function squashCSSResults(scalarValues, devices, disableNesting) {
  // Let's check whether scalarValues represent object (for nesting) or a scalar value.
  let objectsNum = 0;
  let noObjectsNum = 0;
  let arraysNum = 0;
  for (const breakpointName in scalarValues) {
    const val = scalarValues[breakpointName];
    if (Array.isArray(val) && !disableNesting) {
      arraysNum++;
    } else if (typeof val === "object" && val !== null && !Array.isArray(val) && !disableNesting) {
      objectsNum++;
    } else if (val !== null && val !== undefined) {
      noObjectsNum++;
    }
  }

  // Only one flag can be > 0!!! Otherwise breakpoints return incompatible types
  if (objectsNum > 0 && (noObjectsNum > 0 || arraysNum > 0) || arraysNum > 0 && (noObjectsNum > 0 || objectsNum > 0) || noObjectsNum > 0 && (arraysNum > 0 || objectsNum > 0)) {
    throw new Error("This shouldn't happen. Mismatched types for different breakpoints!!!");
  }
  if (arraysNum > 0) {
    let biggestArrayLength = 0;
    for (const breakpoint in scalarValues) {
      biggestArrayLength = Math.max(biggestArrayLength, scalarValues[breakpoint].length); // {...allKeysObject, ...scalarValues[breakpoint]};
    }
    const ret = [];
    for (let i = 0; i < biggestArrayLength; i++) {
      const newScalarValues = {};
      for (const breakpoint in scalarValues) {
        let value = undefined;
        if (scalarValues[breakpoint]) {
          value = scalarValues[breakpoint][i];
        }
        newScalarValues[breakpoint] = value;
      }
      ret[i] = squashCSSResults(newScalarValues, devices);
    }
    return ret;
  }

  // If object -> recursion
  if (objectsNum > 0) {
    // allKeys is the object that has all the keys from all the scalar configs
    let allKeysObject = {};

    /**
     * Scalar values are like:
     *
     * {
     *    b1: { a: 10, b: 20 }
     *    b2: { a: 100, c: 300 }
     * }
     */

    for (const breakpoint in scalarValues) {
      allKeysObject = {
        ...allKeysObject,
        ...scalarValues[breakpoint]
      };
    }

    // scalarValues.forEach(scalarConfig => {
    //     allKeysObject = {...allKeysObject, ...scalarConfig};
    // });

    const allKeys = Object.keys(allKeysObject);
    const ret = {};

    /**
     * All keys are like: ['a', 'b', 'c']
     *
     * All used keys across all breakpoints
     */

    allKeys.forEach(key => {
      const newScalarValues = {};
      for (const breakpoint in scalarValues) {
        let value = undefined;
        if (scalarValues[breakpoint]) {
          value = scalarValues[breakpoint][key];
        }
        newScalarValues[breakpoint] = value;
      }
      /**
       * newScalarValues values are like:
       *
       * For key 'a':
       * {
       *      b1: 10,
       *      b2: 100
       * }
       *
       * For key 'b':
       * {
       *     b1: 20,
       *     b2: undefined
       * }
       *
       */

      /**
       * For fonts we don't want nesting + recursion. We want entire object to be passed to results.
       *
       * Later, renderer must know how to render xfont property :)
       *
       * Otherwise, media query conflicts arise and bad values are set.
       */
      ret[key] = squashCSSResults(newScalarValues, devices, key === "xfont");
    });
    return ret;
  }

  // Here we are sure we have scalar value, not some object to be nested. We must do 2 things:
  // - add "unset" instead of null / undefined
  // - create ResponsiveValue and normalize

  for (const key in scalarValues) {
    if (scalarValues[key] === undefined || scalarValues[key] === null) {
      scalarValues[key] = "unset";
    }
  }

  // Values (non-objects -> no nesting)
  return responsiveValueNormalize({
    ...scalarValues,
    $res: true
  }, devices);
}
function responsiveValueForceGet(value, deviceId) {
  if (isTrulyResponsiveValue(value)) {
    if (value[deviceId] === undefined) {
      const error = `You called responsiveValueForceGet with value ${JSON.stringify(value)} and deviceId: ${deviceId}. Value undefined.`;
      throw new Error(error);
    }
    return value[deviceId];
  }
  return value;
}
function isTrulyResponsiveValue(x) {
  return typeof x === "object" && x !== null && !Array.isArray(x) && x.$res === true;
}
function responsiveValueNormalize(arg, devices) {
  if (!isTrulyResponsiveValue(arg)) {
    return arg;
  }
  let previousVal = undefined;
  const ret = {
    $res: true
  };
  let numberOfDefinedValues = 0;
  for (let i = devices.length - 1; i >= 0; i--) {
    const breakpoint = devices[i].id;
    const val = arg[breakpoint];

    // TODO: if values are objects, it's to do
    if (typeof val === "object" && val !== null) {
      if (JSON.stringify(val) !== JSON.stringify(previousVal)) {
        ret[breakpoint] = val;
        previousVal = val;
        numberOfDefinedValues++;
      }
    } else {
      if (val !== undefined && val !== previousVal) {
        ret[breakpoint] = val;
        previousVal = val;
        numberOfDefinedValues++;
      }
    }

    // [x, null, null, y] => [x, y]
    if (i < devices.length - 1) {
      const nextBreakpoint = devices[i + 1].id;
      if (numberOfDefinedValues === 1 && ret[breakpoint] === undefined && ret[nextBreakpoint] !== undefined) {
        ret[breakpoint] = ret[nextBreakpoint];
        delete ret[nextBreakpoint];
      }
    }
  }
  if (numberOfDefinedValues === 1) {
    return ret[devices[0].id];
  }
  return ret;
}
function scalarizeConfig(config, breakpoint) {
  const ret = {};
  for (const prop in config) {
    ret[prop] = responsiveValueForceGet(config[prop], breakpoint);
  }
  return ret;
}

exports.resop = resop;
//# sourceMappingURL=resop.cjs.map
