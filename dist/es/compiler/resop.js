/* with love from shopstory */
import { isSchemaPropComponent, isSchemaPropCollection, isSchemaPropComponentOrComponentCollection } from './schema/index.js';
import { responsiveValueNormalize } from '../responsiveness/responsiveValueNormalize.js';
import { responsiveValueForceGet } from '../responsiveness/responsiveValueGet.js';

/**
 *  Input like: { breakpoint1: sth, breakpoint2: sth, breakpoint3: sth, ... }
 */
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
function scalarizeNonComponentProp(value, breakpoint, schemaProp) {
  if (schemaProp) {
    // This function should never be called with component type
    if (schemaProp.type.startsWith("component")) {
      throw new Error("unreachable");
    }

    // Text values aren't responsive
    if (schemaProp.type === "text") {
      return value;
    }

    // other props are potentially responsive, so let's run responsiveValueGet
    return responsiveValueForceGet(value, breakpoint);
  }

  // for context props we just treat them as responsive
  return responsiveValueForceGet(value, breakpoint);
}
function scalarizeCollection(configs, breakpoint, devices, itemFieldsSchema) {
  return configs.map(child => {
    const scalarizedChild = {
      ...child
    };
    for (const [key, value] of Object.entries(scalarizedChild)) {
      const schemaProp = itemFieldsSchema.find(itemFieldSchemaProp => {
        return itemFieldSchemaProp.prop === key;
      });
      if (schemaProp) {
        scalarizedChild[schemaProp.prop] = scalarizeNonComponentProp(value, breakpoint, schemaProp);
      } else {
        scalarizedChild[key] = scalarizeNonComponentProp(value, breakpoint);
      }
    }
    return scalarizedChild;
  });
}
function scalarizeConfig(config, breakpoint, devices, schema) {
  const ret = {};

  /**
   * There is a bit of chaos here. To understand what is happening, we must know what "Config" is in context of resop.
   *
   * Config is not a "real" config we're using in the Shopstory in almost all places. We're dealing here with "intermediate compiled config" used during compilation. What it means:
   * 1. It has _component, _id, etc.
   * 2. All the props from schema that are *not* components are compiled and are available.
   * 3. All the props from schema that are components have only _component and _id (exception below)
   * 4. component-collections has child Configs that have item props that are also compiled and are added *to the root level of the config*. They're simply context props. (IMPORTANT! -> localised is already non-localised ;p)
   * 5. context props from compilation are also added to the config.
   *
   * PROBLEM:
   *
   * As long as we know the component "own props" (we have schema) and item props, we have no idea about context props types. It means that we can only blindly apply responsiveValueGet on them.
   *
   * SOLUTION:
   *
   * context props should be typed. Each editable component should have schema of own props and of context props.
   *
   */
  for (const prop in config) {
    const schemaProp = schema.find(x => x.prop === prop);

    // If schemaProp is defined, it means "own prop". Otherwise it must be a context prop (they're not "typed" yet and we don't have any information what types of context props we have)
    if (schemaProp) {
      // subcomponents don't get scalarized
      if (isSchemaPropComponent(schemaProp)) {
        ret[prop] = config[prop];
      }
      // component collection should have item props scalarized. We know the types of item props!
      // component collection localised is already dealing with value that is NON-LOCALISED (it was flattened earlier)
      else if (isSchemaPropCollection(schemaProp)) {
        ret[prop] = scalarizeCollection(config[prop], breakpoint, devices, schemaProp.itemFields || []);
      } else {
        ret[prop] = scalarizeNonComponentProp(config[prop], breakpoint, schemaProp);
      }
    } else {
      // context props automatically get scalarized
      ret[prop] = scalarizeNonComponentProp(config[prop], breakpoint);
    }
  }
  return ret;
}
function getUndefinedBreakpoints(resVal, devices) {
  const undefinedBreakpoints = [];
  devices.forEach(device => {
    if (resVal[device.id] === undefined) {
      undefinedBreakpoints.push(device.id);
    }
  });
  return undefinedBreakpoints;
}
function hasDefinedBreakpoints(resVal, devices) {
  const undefinedBreakpoints = getUndefinedBreakpoints(resVal, devices);
  return undefinedBreakpoints.length < devices.length;
}
function resop2(input, callback, devices, componentDefinition) {
  const schema = componentDefinition?.schema ?? [];

  // Decompose config into scalar configs
  const scalarInputs = {};
  devices.forEach(device => {
    scalarInputs[device.id] = {
      params: scalarizeConfig(input.params, device.id, devices, []),
      values: scalarizeConfig(input.values, device.id, devices, schema)
    };
  });
  const scalarOutputs = {};

  // run callback for scalar configs
  devices.forEach(device => {
    scalarOutputs[device.id] = callback(scalarInputs[device.id], device.id);
  });

  /**
   * Let's first squash all __props, components and item props
   */

  const componentPropNames = {};
  const componentItemPropsNamesAndLength = {};
  const propNames = new Set();

  // Let's add keys
  schema.forEach(schemaProp => {
    if (isSchemaPropComponentOrComponentCollection(schemaProp)) {
      componentPropNames[schemaProp.prop] = new Set();
    }
    if (isSchemaPropCollection(schemaProp)) {
      componentItemPropsNamesAndLength[schemaProp.prop] = {
        lengths: new Set(),
        names: new Set()
      };
    }
  });

  // Let's find all output prop names
  devices.forEach(device => {
    // prop names
    const propsObject = scalarOutputs[device.id].props ?? {};
    if (typeof propsObject !== "object" || propsObject === null) {
      throw new Error(`__props must be object, it is not for breakpoint: ${device.id}`);
    }
    for (const propName in propsObject) {
      propNames.add(propName);
    }

    // component prop names
    schema.forEach(schemaProp => {
      if (isSchemaPropComponentOrComponentCollection(schemaProp)) {
        const componentObject = scalarOutputs[device.id].components?.[schemaProp.prop] ?? {};
        if (typeof componentObject !== "object" || componentObject === null) {
          throw new Error(`resop error: component must be undefined or an object, it is not for device ${device.id} and prop ${schemaProp.prop}. Template: ${componentDefinition?.id}`);
        }
        for (const key in componentObject) {
          if (key === "itemProps") {
            continue;
          }
          componentPropNames[schemaProp.prop].add(key);
        }
        if (isSchemaPropCollection(schemaProp)) {
          const itemPropsArray = componentObject.itemProps ?? [];
          if (!Array.isArray(itemPropsArray)) {
            throw new Error(`resop error: item props must be undefined or an array (${schemaProp.prop}). Template: ${componentDefinition?.id}`);
          }
          itemPropsArray.forEach((itemObject, index) => {
            if (typeof itemObject !== "object" || itemObject === null) {
              throw new Error(`resop error: item in itemProps array must be object (${schemaProp.prop}.itemProps.${index}). Template: ${componentDefinition?.id}`);
            }
            for (const key in itemObject) {
              componentItemPropsNamesAndLength[schemaProp.prop].names.add(key);
            }
          });
          componentItemPropsNamesAndLength[schemaProp.prop].lengths.add(itemPropsArray.length);
        }
      }
    });
  });

  // Let's verify array lengths
  for (const componentName in componentItemPropsNamesAndLength) {
    const lengths = componentItemPropsNamesAndLength[componentName].lengths;
    if (lengths.size > 1) {
      throw new Error(`resop: incompatible item props arrays length for component: ${componentName}. Template: ${componentDefinition?.id}`);
    }
    const length = Array.from(lengths)[0];

    // If non-zero length, then there are extra requirements
    if (length > 0) {
      const itemsLength = input.values[componentName].length;
      if (itemsLength === 0 ? length > 1 : itemsLength !== length) {
        throw new Error(`resop: item props arrays length incompatible with items length for component: ${componentName}. Template: ${componentDefinition?.id}`);
      }
    }
  }

  // Let's compress
  const output = {
    props: {},
    components: {},
    styled: {}
  };

  // squash props
  propNames.forEach(propName => {
    const squashedValue = {
      $res: true
    };
    devices.forEach(device => {
      squashedValue[device.id] = scalarOutputs[device.id]?.props?.[propName];
    });
    if (hasDefinedBreakpoints(squashedValue, devices)) {
      const undefinedBreakpoints = getUndefinedBreakpoints(squashedValue, devices);
      if (undefinedBreakpoints.length > 0) {
        throw new Error(`resop: undefined value (breakpoints: ${undefinedBreakpoints}) for __props.${propName}. Template: ${componentDefinition?.id}`);
      }
      output.props[propName] = responsiveValueNormalize(squashedValue, devices); // props should be normalized
    }
  });

  // Squash components
  for (const componentName in componentPropNames) {
    output.components[componentName] = {};
    componentPropNames[componentName].forEach(componentPropName => {
      const squashedValue = {
        $res: true
      };
      devices.forEach(device => {
        squashedValue[device.id] = scalarOutputs[device.id].components?.[componentName]?.[componentPropName];
      });
      if (hasDefinedBreakpoints(squashedValue, devices)) {
        const undefinedBreakpoints = getUndefinedBreakpoints(squashedValue, devices);
        if (undefinedBreakpoints.length > 0) {
          throw new Error(`resop: undefined value (breakpoints ${undefinedBreakpoints}) for ${componentName}.${componentPropName}. Template: ${componentDefinition?.id}`);
        }
        output.components[componentName][componentPropName] = squashedValue;
      }
    });
  }

  // Squash item props
  for (const componentName in componentItemPropsNamesAndLength) {
    output.components[componentName].itemProps = [];
    const length = Array.from(componentItemPropsNamesAndLength[componentName].lengths)[0];
    for (let i = 0; i < length; i++) {
      output.components[componentName].itemProps[i] = {};
      componentItemPropsNamesAndLength[componentName].names.forEach(itemPropName => {
        const squashedValue = {
          $res: true
        };
        devices.forEach(device => {
          squashedValue[device.id] = scalarOutputs[device.id].components?.[componentName]?.itemProps?.[i]?.[itemPropName];
        });
        if (hasDefinedBreakpoints(squashedValue, devices)) {
          const undefinedBreakpoints = getUndefinedBreakpoints(squashedValue, devices);
          if (undefinedBreakpoints.length > 0) {
            throw new Error(`resop: undefined value (breakpoints ${undefinedBreakpoints}) for ${componentName}.${i}.${itemPropName}. Template: ${componentDefinition?.id}`);
          }
          output.components[componentName].itemProps[i][itemPropName] = squashedValue;
        }
      });
    }
  }
  const styledOnlyScalarOutputs = Object.fromEntries(Object.entries(scalarOutputs).map(_ref => {
    let [deviceId, result] = _ref;
    return [deviceId, result.styled];
  }));
  output.styled = squashCSSResults(styledOnlyScalarOutputs, devices);
  return output;
}

export { resop2, scalarizeConfig };
//# sourceMappingURL=resop.js.map
