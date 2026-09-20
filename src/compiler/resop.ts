import {
  responsiveValueForceGet,
  responsiveValueNormalize,
} from "../responsiveness";
import {
  Devices,
  NoCodeComponentStylesFunctionResult,
  ResponsiveValue,
  SchemaProp,
  TrulyResponsiveValue,
} from "../types";
import {
  isSchemaPropCollection,
  isSchemaPropComponent,
  isSchemaPropComponentOrComponentCollection,
} from "./schema";
import type { InternalComponentDefinition } from "./types";

type Config = { [key: string]: any };

/**
 *  Input like: { breakpoint1: sth, breakpoint2: sth, breakpoint3: sth, ... }
 */
function squashCSSResults(
  scalarValues: { [key: string]: any },
  devices: Devices,
  disableNesting?: boolean
): any {
  // Let's check whether scalarValues represent object (for nesting) or a scalar value.
  let objectsNum = 0;
  let noObjectsNum = 0;
  let arraysNum = 0;

  for (const breakpointName in scalarValues) {
    const val = scalarValues[breakpointName];

    if (Array.isArray(val) && !disableNesting) {
      arraysNum++;
    } else if (
      typeof val === "object" &&
      val !== null &&
      !Array.isArray(val) &&
      !disableNesting
    ) {
      objectsNum++;
    } else if (val !== null && val !== undefined) {
      noObjectsNum++;
    }
  }

  // Only one flag can be > 0!!! Otherwise breakpoints return incompatible types
  if (
    (objectsNum > 0 && (noObjectsNum > 0 || arraysNum > 0)) ||
    (arraysNum > 0 && (noObjectsNum > 0 || objectsNum > 0)) ||
    (noObjectsNum > 0 && (arraysNum > 0 || objectsNum > 0))
  ) {
    // A `styles` function that returns an object at one breakpoint and a plain
    // value at another. It used to take the whole page down — published site
    // and editor canvas together — for a component whose own branch happened
    // to produce different shapes for one particular saved value.
    //
    // The shape used by the most breakpoints wins and the odd ones out are
    // dropped, so the block loses a property at some widths instead of the
    // page losing everything. The warning names the shapes, because this is a
    // mistake in a component that somebody has to go and fix.
    const winner =
      arraysNum >= objectsNum && arraysNum >= noObjectsNum
        ? "array"
        : objectsNum >= noObjectsNum
          ? "object"
          : "scalar";

    console.error(
      `easyblocks: a styles function returned different shapes at different breakpoints (${arraysNum} array, ${objectsNum} object, ${noObjectsNum} plain); keeping the ${winner} ones`
    );

    for (const breakpointName in scalarValues) {
      const val = scalarValues[breakpointName];
      const kind = Array.isArray(val) && !disableNesting
        ? "array"
        : typeof val === "object" && val !== null && !Array.isArray(val) && !disableNesting
          ? "object"
          : "scalar";

      if (kind !== winner) {
        scalarValues[breakpointName] = undefined;
      }
    }

    arraysNum = winner === "array" ? arraysNum : 0;
    objectsNum = winner === "object" ? objectsNum : 0;
    noObjectsNum = winner === "scalar" ? noObjectsNum : 0;
  }

  if (arraysNum > 0) {
    let biggestArrayLength = 0;

    for (const breakpoint in scalarValues) {
      biggestArrayLength = Math.max(
        biggestArrayLength,
        scalarValues[breakpoint].length
      ); // {...allKeysObject, ...scalarValues[breakpoint]};
    }

    const ret: any[] = [];

    for (let i = 0; i < biggestArrayLength; i++) {
      const newScalarValues: { [key: string]: any } = {};

      for (const breakpoint in scalarValues) {
        let value: any = undefined;

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
    let allKeysObject: { [key: string]: null } = {};

    /**
     * Scalar values are like:
     *
     * {
     *    b1: { a: 10, b: 20 }
     *    b2: { a: 100, c: 300 }
     * }
     */

    for (const breakpoint in scalarValues) {
      allKeysObject = { ...allKeysObject, ...scalarValues[breakpoint] };
    }

    // scalarValues.forEach(scalarConfig => {
    //     allKeysObject = {...allKeysObject, ...scalarConfig};
    // });

    const allKeys = Object.keys(allKeysObject);
    const ret: Config = {};

    /**
     * All keys are like: ['a', 'b', 'c']
     *
     * All used keys across all breakpoints
     */

    allKeys.forEach((key) => {
      const newScalarValues: { [key: string]: any } = {};

      for (const breakpoint in scalarValues) {
        let value: any = undefined;

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
  return responsiveValueNormalize({ ...scalarValues, $res: true }, devices);
}

function scalarizeNonComponentProp(
  value: any,
  breakpoint: string,
  schemaProp?: SchemaProp
) {
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

function scalarizeCollection(
  configs: Config[],
  breakpoint: string,
  devices: Devices,
  itemFieldsSchema: SchemaProp[]
) {
  return configs.map((child: any) => {
    const scalarizedChild: Record<string, any> = { ...child };

    for (const [key, value] of Object.entries(scalarizedChild)) {
      const schemaProp = itemFieldsSchema.find((itemFieldSchemaProp) => {
        return itemFieldSchemaProp.prop === key;
      });

      if (schemaProp) {
        scalarizedChild[schemaProp.prop] = scalarizeNonComponentProp(
          value,
          breakpoint,
          schemaProp
        );
      } else {
        scalarizedChild[key] = scalarizeNonComponentProp(value, breakpoint);
      }
    }

    return scalarizedChild;
  });
}

export function scalarizeConfig(
  config: Config,
  breakpoint: string,
  devices: Devices,
  schema: SchemaProp[]
): any {
  const ret: Record<string, any> = {};

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
    const schemaProp = schema.find((x) => x.prop === prop);

    // If schemaProp is defined, it means "own prop". Otherwise it must be a context prop (they're not "typed" yet and we don't have any information what types of context props we have)
    if (schemaProp) {
      // subcomponents don't get scalarized
      if (isSchemaPropComponent(schemaProp)) {
        ret[prop] = config[prop];
      }
      // component collection should have item props scalarized. We know the types of item props!
      // component collection localised is already dealing with value that is NON-LOCALISED (it was flattened earlier)
      else if (isSchemaPropCollection(schemaProp)) {
        ret[prop] = scalarizeCollection(
          config[prop],
          breakpoint,
          devices,
          schemaProp.itemFields || []
        );
      } else {
        ret[prop] = scalarizeNonComponentProp(
          config[prop],
          breakpoint,
          schemaProp
        );
      }
    } else {
      // context props automatically get scalarized
      ret[prop] = scalarizeNonComponentProp(config[prop], breakpoint);
    }
  }

  return ret;
}

function getUndefinedBreakpoints(
  resVal: TrulyResponsiveValue<any>,
  devices: Devices
) {
  const undefinedBreakpoints: string[] = [];
  devices.forEach((device) => {
    if (resVal[device.id] === undefined) {
      undefinedBreakpoints.push(device.id);
    }
  });
  return undefinedBreakpoints;
}

function hasDefinedBreakpoints(
  resVal: TrulyResponsiveValue<any>,
  devices: Devices
) {
  const undefinedBreakpoints = getUndefinedBreakpoints(resVal, devices);
  return undefinedBreakpoints.length < devices.length;
}

/**
 * Give every breakpoint a value, borrowing from the nearest one that has one.
 *
 * A `styles` function that answers at some widths and not others — the common
 * shape being `device.id === "xs" ? {...} : undefined` — used to throw, and a
 * throw here loses the entire page rather than one property. Borrowing is what
 * a responsive value means everywhere else in this engine, so it is also the
 * least surprising answer: the property simply carries across the widths the
 * component forgot to answer for.
 *
 * Returns whether anything had to be borrowed, so the caller can say so.
 */
function fillUndefinedBreakpoints(
  resVal: TrulyResponsiveValue<any>,
  devices: Devices
): boolean {
  const missing = getUndefinedBreakpoints(resVal, devices);

  if (missing.length === 0) {
    return false;
  }

  let nearest: any = undefined;

  // Downwards first, so a value set at a wide breakpoint reaches the narrow
  // ones below it — the direction this engine already fills in.
  devices.forEach((device) => {
    if (resVal[device.id] === undefined) {
      resVal[device.id] = nearest;
    } else {
      nearest = resVal[device.id];
    }
  });

  // Anything still missing sat above every defined value, so it borrows upwards.
  nearest = undefined;

  [...devices].reverse().forEach((device) => {
    if (resVal[device.id] === undefined) {
      resVal[device.id] = nearest;
    } else {
      nearest = resVal[device.id];
    }
  });

  return true;
}

type Resop2Result = Required<NoCodeComponentStylesFunctionResult>;

export function resop2(
  input: {
    values: Record<string, ResponsiveValue<any>>;
    params: Record<string, ResponsiveValue<any>>;
  },
  callback: (
    scalarInput: {
      values: Record<string, any>;
      params: Record<string, any>;
    },
    breakpointIndex: string
  ) => NoCodeComponentStylesFunctionResult,
  devices: Devices,
  componentDefinition?: InternalComponentDefinition
): Resop2Result {
  const schema = componentDefinition?.schema ?? [];

  // Decompose config into scalar configs
  const scalarInputs: Record<
    string,
    {
      values: Record<string, unknown>;
      params: Record<string, unknown>;
    }
  > = {};

  devices.forEach((device) => {
    scalarInputs[device.id] = {
      params: scalarizeConfig(input.params, device.id, devices, []),
      values: scalarizeConfig(input.values, device.id, devices, schema),
    };
  });

  const scalarOutputs: Record<string, NoCodeComponentStylesFunctionResult> = {};

  // run callback for scalar configs
  devices.forEach((device) => {
    scalarOutputs[device.id] = callback(scalarInputs[device.id], device.id);
  });

  /**
   * Let's first squash all __props, components and item props
   */

  const componentPropNames: Record<string, Set<string>> = {};
  const componentItemPropsNamesAndLength: Record<
    string,
    { lengths: Set<number>; names: Set<string> }
  > = {};
  const propNames: Set<string> = new Set();

  // Let's add keys
  schema.forEach((schemaProp) => {
    if (isSchemaPropComponentOrComponentCollection(schemaProp)) {
      componentPropNames[schemaProp.prop] = new Set();
    }
    if (isSchemaPropCollection(schemaProp)) {
      componentItemPropsNamesAndLength[schemaProp.prop] = {
        lengths: new Set(),
        names: new Set(),
      };
    }
  });

  // Let's find all output prop names
  devices.forEach((device) => {
    // prop names
    const propsObject = scalarOutputs[device.id].props ?? {};

    if (typeof propsObject !== "object" || propsObject === null) {
      // A styles function returning the wrong shape is a mistake in one
      // component. Everything below used to throw, which meant that mistake
      // blanked the whole page it happened to sit on, published site and
      // editor canvas alike. The block now loses the offending piece and the
      // rest of the page still renders, with a message naming what to fix.
      console.error(
        `easyblocks: __props must be an object; ignoring it for breakpoint ${device.id}. Template: ${componentDefinition?.id}`
      );

      return;
    }

    for (const propName in propsObject) {
      propNames.add(propName);
    }

    // component prop names
    schema.forEach((schemaProp) => {
      if (isSchemaPropComponentOrComponentCollection(schemaProp)) {
        const componentObject: Record<string, any> =
          scalarOutputs[device.id].components?.[schemaProp.prop] ?? {};

        if (typeof componentObject !== "object" || componentObject === null) {
          console.error(
            `easyblocks: components.${schemaProp.prop} must be undefined or an object; ignoring it for breakpoint ${device.id}. Template: ${componentDefinition?.id}`
          );

          return;
        }

        for (const key in componentObject) {
          if (key === "itemProps") {
            continue;
          }
          componentPropNames[schemaProp.prop].add(key);
        }

        if (isSchemaPropCollection(schemaProp)) {
          const rawItemProps = componentObject.itemProps ?? [];
          const itemPropsArray = Array.isArray(rawItemProps) ? rawItemProps : [];

          if (!Array.isArray(rawItemProps)) {
            console.error(
              `easyblocks: itemProps for ${schemaProp.prop} must be undefined or an array; treating it as empty. Template: ${componentDefinition?.id}`
            );
          }

          itemPropsArray.forEach((itemObject: any, index: number) => {
            if (typeof itemObject !== "object" || itemObject === null) {
              console.error(
                `easyblocks: itemProps.${index} of ${schemaProp.prop} must be an object; ignoring it. Template: ${componentDefinition?.id}`
              );

              return;
            }

            for (const key in itemObject) {
              componentItemPropsNamesAndLength[schemaProp.prop].names.add(key);
            }
          });

          componentItemPropsNamesAndLength[schemaProp.prop].lengths.add(
            itemPropsArray.length
          );
        }
      }
    });
  });

  // Let's settle on one array length per component.
  //
  // Both mismatches below used to throw, and both are reachable from ordinary
  // document data: a styles function that sizes `itemProps` from a layout
  // prop rather than from the collection, next to a saved page where the
  // author has since added or removed a child. Nothing in the engine keeps
  // those two numbers in step, so the page died over a disagreement it could
  // simply settle.
  for (const componentName in componentItemPropsNamesAndLength) {
    const lengths = componentItemPropsNamesAndLength[componentName].lengths;

    if (lengths.size > 1) {
      console.error(
        `easyblocks: itemProps for ${componentName} came back at different lengths across breakpoints (${Array.from(lengths).join(", ")}); using the longest. Template: ${componentDefinition?.id}`
      );
    }

    let length = Math.max(0, ...Array.from(lengths));

    // The number of children actually in the document wins: an itemProps entry
    // with no child to apply to does nothing, and a child with no entry simply
    // takes the styles it would have had anyway.
    //
    // An empty collection keeps its single placeholder entry, which is what the
    // engine has always allowed and what the editor's drop target is built on.
    if (length > 0) {
      const itemsLength = (input.values as any)[componentName]?.length ?? 0;
      const allowed = itemsLength === 0 ? Math.min(length, 1) : itemsLength;

      if (allowed !== length) {
        console.error(
          `easyblocks: ${componentName} has ${itemsLength} item(s) but its styles returned ${length} itemProps; using ${allowed}. Template: ${componentDefinition?.id}`
        );

        length = allowed;
      }
    }

    componentItemPropsNamesAndLength[componentName].lengths = new Set([length]);
  }

  // Let's compress
  const output: Resop2Result = {
    props: {},
    components: {},
    styled: {},
  };

  // squash props
  propNames.forEach((propName) => {
    const squashedValue: TrulyResponsiveValue<any> = {
      $res: true,
    };

    devices.forEach((device) => {
      squashedValue[device.id] = scalarOutputs[device.id]?.props?.[propName];
    });

    if (hasDefinedBreakpoints(squashedValue, devices)) {
      if (fillUndefinedBreakpoints(squashedValue, devices)) {
        console.error(
          `easyblocks: __props.${propName} was missing at some breakpoints; borrowed from the nearest one. Template: ${componentDefinition?.id}`
        );
      }

      output.props[propName] = responsiveValueNormalize(squashedValue, devices); // props should be normalized
    }
  });

  // Squash components
  for (const componentName in componentPropNames) {
    output.components[componentName] = {};

    componentPropNames[componentName].forEach((componentPropName) => {
      const squashedValue: TrulyResponsiveValue<any> = {
        $res: true,
      };
      devices.forEach((device) => {
        squashedValue[device.id] =
          scalarOutputs[device.id].components?.[componentName]?.[
            componentPropName
          ];
      });

      if (hasDefinedBreakpoints(squashedValue, devices)) {
        if (fillUndefinedBreakpoints(squashedValue, devices)) {
          console.error(
            `easyblocks: ${componentName}.${componentPropName} was missing at some breakpoints; borrowed from the nearest one. Template: ${componentDefinition?.id}`
          );
        }

        output.components[componentName][componentPropName] = squashedValue;
      }
    });
  }

  // Squash item props
  for (const componentName in componentItemPropsNamesAndLength) {
    output.components[componentName].itemProps = [];

    const length = Array.from(
      componentItemPropsNamesAndLength[componentName].lengths
    )[0];

    for (let i = 0; i < length; i++) {
      output.components[componentName].itemProps![i] = {};

      componentItemPropsNamesAndLength[componentName].names.forEach(
        (itemPropName) => {
          const squashedValue: TrulyResponsiveValue<any> = {
            $res: true,
          };

          devices.forEach((device) => {
            squashedValue[device.id] =
              scalarOutputs[device.id].components?.[componentName]?.itemProps?.[
                i
              ]?.[itemPropName];
          });

          if (hasDefinedBreakpoints(squashedValue, devices)) {
            if (fillUndefinedBreakpoints(squashedValue, devices)) {
              console.error(
                `easyblocks: ${componentName}.${i}.${itemPropName} was missing at some breakpoints; borrowed from the nearest one. Template: ${componentDefinition?.id}`
              );
            }

            output.components[componentName].itemProps![i][itemPropName] =
              squashedValue;
          }
        }
      );
    }
  }

  const styledOnlyScalarOutputs = Object.fromEntries(
    Object.entries(scalarOutputs).map(([deviceId, result]) => [
      deviceId,
      result.styled,
    ])
  );

  output.styled = squashCSSResults(styledOnlyScalarOutputs, devices);

  return output;
}
