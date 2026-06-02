/* with love from shopstory */
import React, { useMemo, useContext, createContext, Fragment } from 'react';
import { W as entries, V as serialize, X as getBoxStyles, Y as findComponentDefinitionById, z as isLocalTextReference, i as isTrulyResponsiveValue$1, A as resolveExternalValue, Z as isSchemaPropComponentOrComponentCollection, _ as isSchemaPropComponent } from './configTraverse-6a652db8.js';
import { createStitches } from '@stitches/core';

function cleanString(value) {
  return value.replace(/\u2028/g, "");
}

function responsiveValueValues(value) {
  const values = [];
  entries(value).forEach(_ref => {
    let [key, v] = _ref;
    if (key === "$res") return;
    values.push(v);
  });
  return values;
}

function RichTextPartClient(props) {
  const {
    value,
    Text,
    TextWrapper
  } = props;
  const textValue = value || "\uFEFF";
  if (TextWrapper) {
    return /*#__PURE__*/React.createElement(Text.type, Text.props, /*#__PURE__*/React.createElement(TextWrapper.type, TextWrapper.props, textValue));
  }
  return /*#__PURE__*/React.createElement(Text.type, Text.props, textValue);
}

function selectionFramePositionChanged(target, container) {
  return {
    type: "@easyblocks-editor/selection-frame-position-changed",
    payload: {
      target,
      container
    }
  };
}
function richTextChangedEvent(payload) {
  return {
    type: "@easyblocks-editor/rich-text-changed",
    payload: serialize(payload)
  };
}
function componentPickerOpened(path) {
  return {
    type: "@easyblocks-editor/component-picker-opened",
    payload: {
      path
    }
  };
}
function componentPickerClosed(config) {
  return {
    type: "@easyblocks-editor/component-picker-closed",
    payload: {
      config
    }
  };
}
function itemInserted(payload) {
  return {
    type: "@easyblocks-editor/item-inserted",
    payload
  };
}
function itemMoved(payload) {
  return {
    type: "@easyblocks-editor/item-moved",
    payload
  };
}

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

const boxStyles = {
  boxSizing: "border-box",
  minWidth: "0px",
  margin: 0,
  padding: 0,
  border: 0,
  listStyle: "none"
};
const Box = /*#__PURE__*/React.forwardRef((props, ref) => {
  /**
   * passedProps - the props given in component code like <MyBox data-id="abc" /> (data-id is in passedProps)
   * restProps - the props given by Shopstory (like from actionWrapper)
   *
   * They are merged into "realProps".
   *
   * I know those names sucks, this needs to be cleaned up.
   */

  const {
    __compiled,
    __name,
    passedProps,
    devices,
    stitches,
    ...restProps
  } = props;
  const {
    __as,
    ...styles
  } = __compiled;
  const realProps = {
    ...restProps,
    ...passedProps
  };
  const {
    as,
    itemWrappers,
    className,
    ...restPassedProps
  } = realProps;
  const {
    boxClassName,
    componentClassName
  } = useMemo(() => {
    /**
     * We need styles to be "owned" by the current JS realm for Stitches/CSSOM.
     * structuredClone is faster than JSON.parse(JSON.stringify()) and handles
     * the same cross-realm object issue. Fall back to JSON round-trip if
     * structuredClone isn't available (older browsers).
     */
    const cloned = typeof structuredClone === "function" ? structuredClone(styles) : JSON.parse(JSON.stringify(styles));
    const correctedStyles = getBoxStyles(cloned, devices);
    const generateBoxClass = stitches.css(boxStyles);
    const generateClassName = stitches.css(correctedStyles);
    return {
      boxClassName: generateBoxClass(),
      componentClassName: generateClassName()
    };
  }, [styles.__hash]);
  return /*#__PURE__*/React.createElement(as || __as || "div", {
    ref,
    ...restPassedProps,
    className: [boxClassName, componentClassName, className].filter(Boolean).join(" "),
    "data-testid": __name
  }, props.children);
});
Box.displayName = "Box";

const EasyblocksExternalDataContext = /*#__PURE__*/createContext(null);
function useEasyblocksExternalData() {
  const context = useContext(EasyblocksExternalDataContext);
  if (!context) {
    throw new Error("useEasyblocksExternalData must be used within a EasyblocksExternalDataProvider");
  }
  return context;
}
function EasyblocksExternalDataProvider(_ref) {
  let {
    children,
    externalData
  } = _ref;
  return /*#__PURE__*/React.createElement(EasyblocksExternalDataContext.Provider, {
    value: externalData
  }, children);
}

const easyblocksStitchesInstances = [];
function easyblocksGetCssText() {
  return easyblocksStitchesInstances.map(stitches => stitches.getCssText()).join(" ");
}
function easyblocksGetStyleTag() {
  return /*#__PURE__*/React.createElement("style", {
    id: "stitches",
    dangerouslySetInnerHTML: {
      __html: easyblocksGetCssText()
    }
  });
}

const EasyblocksMetadataContext = /*#__PURE__*/createContext(undefined);
const EasyblocksMetadataProvider = _ref => {
  let {
    meta,
    children
  } = _ref;
  // Let's load stitches instance
  if (easyblocksStitchesInstances.length === 0) {
    easyblocksStitchesInstances.push(createStitches({}));
  }
  return /*#__PURE__*/React.createElement(EasyblocksMetadataContext.Provider, {
    value: {
      ...meta,
      stitches: easyblocksStitchesInstances[0]
    }
  }, children);
};
function useEasyblocksMetadata() {
  const context = useContext(EasyblocksMetadataContext);
  if (!context) {
    throw new Error("useEasyblocksMetadata must be used within a EasyblocksMetadataProvider");
  }
  return context;
}

function buildBoxes(compiled, name, actionWrappers, meta) {
  if (Array.isArray(compiled)) {
    return compiled.map((x, index) => buildBoxes(x, `${name}.${index}`, actionWrappers, meta));
  } else if (typeof compiled === "object" && compiled !== null) {
    if (compiled.__isBox) {
      const boxProps = {
        __compiled: compiled,
        __name: name,
        devices: meta.vars.devices,
        stitches: meta.stitches
      };
      return /*#__PURE__*/React.createElement(Box, boxProps);
    }
    const ret = {};
    for (const key in compiled) {
      ret[key] = buildBoxes(compiled[key], key, actionWrappers, meta);
    }
    return ret;
  }
  return compiled;
}

/**
 * Cached lookup: for a given definitions object, reuse the same wrapper
 * so findComponentDefinitionById's internal WeakMap hits every time.
 */
const _defContextCache = new WeakMap();
function getDefinitionsContext(definitions) {
  let ctx = _defContextCache.get(definitions);
  if (!ctx) {
    ctx = {
      definitions
    };
    _defContextCache.set(definitions, ctx);
  }
  return ctx;
}

/**
 * Cache which schema props are component/component-collection slots.
 * Avoids re-filtering the full schema array on every render.
 */
const _componentSlotsCache = new WeakMap();
function getComponentSlots(schema) {
  let slots = _componentSlotsCache.get(schema);
  if (!slots) {
    slots = schema.filter(isSchemaPropComponentOrComponentCollection);
    _componentSlotsCache.set(schema, slots);
  }
  return slots;
}
function getCompiledSubcomponents(id, compiledArray, contextProps, schemaProp, path, meta, isEditing, components) {
  const originalPath = path;
  if (schemaProp.type === "component-collection-localised") {
    path = path + "." + meta.vars.locale;
  }
  if (schemaProp.noInline) {
    const elements = compiledArray.map((compiledChild, index) => "_component" in compiledChild ? /*#__PURE__*/React.createElement(ComponentBuilder, {
      key: compiledChild._id,
      path: `${path}.${index}`,
      compiled: compiledChild,
      components: components
    }) : compiledChild);
    if (isSchemaPropComponent(schemaProp)) {
      return elements[0];
    } else {
      return elements;
    }
  }
  const EditableComponentBuilder = isEditing ? components["EditableComponentBuilder.editor"] : components["EditableComponentBuilder.client"];
  let elements = compiledArray.map((compiledChild, index) => "_component" in compiledChild ? /*#__PURE__*/React.createElement(EditableComponentBuilder, {
    key: compiledChild._id,
    compiled: compiledChild,
    index: index,
    length: compiledArray.length,
    path: `${path}.${index}`,
    components: components
  }) : compiledChild);
  const Placeholder = components["Placeholder"];

  // TODO: this code should be editor-only
  if (isEditing && Placeholder && elements.length === 0 && !contextProps.noInline &&
  // We don't want to show add button for this type
  schemaProp.type !== "component-collection-localised") {
    const type = getComponentMainType(schemaProp.accepts);
    elements = [/*#__PURE__*/React.createElement(Placeholder, {
      key: "placeholder",
      id: id,
      path: path,
      type: type,
      appearance: schemaProp.placeholderAppearance,
      onClick: () => {
        function handleComponentPickerCloseMessage(event) {
          if (event.data.type === "@easyblocks-editor/component-picker-closed") {
            window.removeEventListener("message", handleComponentPickerCloseMessage);
            if (event.data.payload.config) {
              window.parent.postMessage(itemInserted({
                name: path,
                index: 0,
                block: event.data.payload.config
              }));
            }
          }
        }
        window.addEventListener("message", handleComponentPickerCloseMessage);
        window.parent.postMessage(componentPickerOpened(originalPath));
      },
      meta: meta
    })];
  }
  if (isSchemaPropComponent(schemaProp)) {
    return elements[0] ?? /*#__PURE__*/React.createElement(Fragment, null);
  }

  // For collections: render progressively when there are many children.
  // In editing mode, render all at once (editor needs all items visible immediately).
  // if (!isEditing && elements.length > 3) {
  //   return progressiveElements(
  //     elements.map((el, i) =>
  //       React.isValidElement(el) ? el : <Fragment key={i}>{el}</Fragment>,
  //     ),
  //     3,
  //     2,
  //   );
  // }

  return elements;
}
const ComponentBuilder = /*#__PURE__*/React.memo(function ComponentBuilder(props) {
  const {
    compiled,
    passedProps,
    path,
    components,
    ...restProps
  } = props;
  const allPassedProps = {
    ...passedProps,
    ...restProps
  };
  const meta = useEasyblocksMetadata();
  const externalData = useEasyblocksExternalData();

  /**
   * Component is build in editing mode only if compiled.__editing is set.
   * This is the result of compilation.
   * The only case when compiled.__editing is set is when we're in Editor and for non-nested components.
   */
  const isEditing = compiled.__editing !== undefined;
  const pathSeparator = path === "" ? "" : ".";

  // Reuse a stable wrapper so findComponentDefinitionById's WeakMap cache hits.
  const defContext = getDefinitionsContext(meta.vars.definitions);
  const componentDefinition = findComponentDefinitionById(compiled._component, defContext);
  const component = getComponent(componentDefinition, components, isEditing);
  const isMissingComponent = compiled._component === "@easyblocks/missing-component";
  const isMissingInstance = component === undefined;
  const isMissing = isMissingComponent || isMissingInstance;
  const MissingComponent = components["@easyblocks/missing-component"];
  if (isMissing) {
    if (!isEditing) {
      return null;
    }
    if (isMissingComponent) {
      return /*#__PURE__*/React.createElement(MissingComponent, {
        error: true
      }, "Missing");
    } else {
      console.warn(`Missing "${compiled._component}"`);
      return /*#__PURE__*/React.createElement(MissingComponent, {
        component: componentDefinition,
        error: true
      }, "Missing");
    }
  }
  const Component = component;
  const shopstoryCompiledConfig = compiled;

  // Memoize the runtime object — it only depends on meta which is stable per render tree.
  const runtime = useMemo(() => ({
    stitches: meta.stitches,
    resop: resop,
    devices: meta.vars.devices
  }), [meta.stitches, meta.vars.devices]);

  // Memoize buildBoxes — only recompute when the compiled styled tree changes.
  const styledBoxes = useMemo(() => buildBoxes(shopstoryCompiledConfig.styled, "", {}, meta), [shopstoryCompiledConfig.styled, meta]);

  // Use cached slot list instead of filtering every schema prop on each render.
  const componentSlots = getComponentSlots(componentDefinition.schema);

  // Build subcomponents into a new styled object (must include both boxes and subcomponents).
  const styled = {
    ...styledBoxes
  };
  for (let i = 0; i < componentSlots.length; i++) {
    const schemaProp = componentSlots[i];
    const contextProps = shopstoryCompiledConfig.__editing?.components?.[schemaProp.prop] || {};
    const compiledChildren = shopstoryCompiledConfig.components[schemaProp.prop];
    styled[schemaProp.prop] = getCompiledSubcomponents(compiled._id, compiledChildren, contextProps, schemaProp, `${path}${pathSeparator}${schemaProp.prop}`, meta, isEditing, components);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    ref,
    __isSelected,
    ...restPassedProps
  } = allPassedProps || {};

  // Memoize the easyblocks prop — only changes when the component instance or selection changes.
  const easyblocksProp = useMemo(() => ({
    id: shopstoryCompiledConfig._id,
    isEditing,
    path,
    runtime,
    isSelected: __isSelected
  }), [shopstoryCompiledConfig._id, isEditing, path, runtime, __isSelected]);

  // Memoize external props — only changes when compiled props or external data changes.
  const externalProps = useMemo(() => mapExternalProps(shopstoryCompiledConfig.props, shopstoryCompiledConfig._id, componentDefinition, externalData), [shopstoryCompiledConfig.props, shopstoryCompiledConfig._id, componentDefinition, externalData]);
  const componentProps = {
    ...restPassedProps,
    ...externalProps,
    ...styled,
    __easyblocks: easyblocksProp
  };
  return /*#__PURE__*/React.createElement(Component, componentProps);
});
function getComponent(componentDefinition, components, isEditing) {
  let component;

  // We first try to find editor version of that component
  if (isEditing) {
    component = components[componentDefinition.id + ".editor"];
  }

  // If it still missing, we try to find client version of that component
  if (!component) {
    component = components[componentDefinition.id + ".client"];
  }
  if (!component) {
    // In most cases we're going to pick component by its id
    component = components[componentDefinition.id];
  }
  return component;
}

/**
 * Lazily-built Map cache for O(1) schema prop lookup by prop name.
 * Keyed on the schema array reference — rebuilt only when the schema array changes.
 */
const _schemaMapCache = new WeakMap();
function getSchemaPropMap(schema) {
  let map = _schemaMapCache.get(schema);
  if (!map) {
    map = new Map(schema.map(s => [s.prop, s]));
    _schemaMapCache.set(schema, map);
  }
  return map;
}
function mapExternalProps(props, configId, componentDefinition, externalData) {
  const resultsProps = {};
  const schemaMap = getSchemaPropMap(componentDefinition.schema);
  for (const propName in props) {
    const schemaProp = schemaMap.get(propName);
    if (schemaProp) {
      const propValue = props[propName];
      if (schemaProp.type === "text" && isLocalTextReference(propValue, "text")) {
        resultsProps[propName] = propValue.value;
      } else if (
      // FIXME: this is a mess
      !isTrulyResponsiveValue$1(propValue) && typeof propValue === "object" && "id" in propValue && "widgetId" in propValue && !("value" in propValue) || isTrulyResponsiveValue$1(propValue) && responsiveValueValues(propValue).every(v => typeof v === "object" && v && "id" in v && "widgetId" in v && !("value" in v))) {
        resultsProps[propName] = resolveExternalValue(propValue, configId, schemaProp, externalData);
      } else {
        resultsProps[propName] = props[propName];
      }
    } else {
      resultsProps[propName] = props[propName];
    }
  }
  return resultsProps;
}
function getComponentMainType(componentTypes) {
  let type;
  if (componentTypes.includes("action") || componentTypes.includes("actionLink")) {
    type = "action";
  } else if (componentTypes.includes("card")) {
    type = "card";
  } else if (componentTypes.includes("symbol")) {
    type = "icon";
  } else if (componentTypes.includes("button")) {
    type = "button";
  } else if (componentTypes.includes("section") || componentTypes.includes("token")) {
    type = "section";
  } else if (componentTypes.includes("item")) {
    type = "item";
  } else if (componentTypes.includes("image") || componentTypes.includes("$image")) {
    type = "image";
  } else if (componentTypes.includes("actionTextModifier")) {
    type = "actionTextModifier";
  } else {
    type = "item";
  }
  return type;
}

export { Box as B, ComponentBuilder as C, EasyblocksMetadataProvider as E, RichTextPartClient as R, EasyblocksExternalDataProvider as a, easyblocksGetStyleTag as b, cleanString as c, componentPickerClosed as d, easyblocksGetCssText as e, componentPickerOpened as f, itemMoved as g, richTextChangedEvent as h, itemInserted as i, responsiveValueValues as r, selectionFramePositionChanged as s, useEasyblocksMetadata as u };
