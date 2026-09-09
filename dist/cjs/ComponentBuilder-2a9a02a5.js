/* with love from shopstory */
'use strict';

var React = require('react');
var findComponentDefinition = require('./findComponentDefinition-13d8e05b.js');
var core = require('@stitches/core');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

function cleanString(value) {
  return value.replace(/\u2028/g, "");
}

function responsiveValueValues(value) {
  const values = [];
  findComponentDefinition.entries(value).forEach(_ref => {
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
    return /*#__PURE__*/React__default["default"].createElement(Text.type, Text.props, /*#__PURE__*/React__default["default"].createElement(TextWrapper.type, TextWrapper.props, textValue));
  }
  return /*#__PURE__*/React__default["default"].createElement(Text.type, Text.props, textValue);
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
    payload: findComponentDefinition.serialize(payload)
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

/**
 * Wrapped in `:where()` so the rule carries no specificity at all.
 *
 * Every Box gets this reset plus a class generated from its own styles, and both are single
 * classes — equal specificity, so whichever the browser reads last wins. That is fine while
 * they live in one stylesheet, and stops being fine the moment they do not: server-rendered
 * CSS is streamed into the body, the browser's own instance writes into the head, and the
 * head is read first. A component whose styles are generated only in the browser then loses
 * every padding, margin and border to a reset that happens to sit further down the page.
 *
 * At zero specificity the reset always loses to the component rule and position stops
 * mattering. It also now loses to a bare element selector, which is the intended trade: an
 * author who writes `ul { padding-left: 2rem }` means it.
 */
const boxStyles = {
  ":where(&)": {
    boxSizing: "border-box",
    minWidth: "0px",
    margin: 0,
    padding: 0,
    border: 0,
    listStyle: "none"
  }
};
/**
 * Class names for one set of compiled styles, remembered per Stitches instance.
 *
 * A page repeats its styles far more than it varies them: the webino home page compiles
 * 2,350 Box style objects out of 387 distinct ones. Every Box still paid full price for its
 * own copy — a deep clone, a responsive pass and two Stitches registrations — because
 * `useMemo` spans re-renders of a single element and a server render has none. Six of every
 * seven of those calls were recomputing a result already known.
 *
 * `__hash` is a content hash of the styles, and the memo below already trusted it to say
 * when two style objects are the same; this only widens that trust from one element to the
 * whole tree. The cache hangs off the Stitches instance, so it is discarded with the request
 * that owns it and can never reach another tenant, and off `devices`, which the responsive
 * pass reads.
 */
const classNamesByStitches = new WeakMap();

/** The reset is a module constant, so its class is generated once per Stitches instance. */
const resetClassByStitches = new WeakMap();
function getResetClassName(stitches) {
  let className = resetClassByStitches.get(stitches);
  if (className === undefined) {
    className = stitches.css(boxStyles)();
    resetClassByStitches.set(stitches, className);
  }
  return className;
}
function buildClassNames(stitches, devices, styles) {
  /**
   * Styles have to be owned by the current JS realm for Stitches/CSSOM: the editor renders
   * its canvas in an iframe and passes objects across that boundary. `structuredClone` is
   * faster than a JSON round trip and covers the same case; the round trip is there for
   * browsers without it.
   */
  const cloned = typeof structuredClone === "function" ? structuredClone(styles) : JSON.parse(JSON.stringify(styles));
  return {
    boxClassName: getResetClassName(stitches),
    componentClassName: stitches.css(findComponentDefinition.getBoxStyles(cloned, devices))()
  };
}
function getClassNames(stitches, devices, styles) {
  const hash = styles.__hash;

  // Styles compiled without a hash cannot be told apart, so they are never cached.
  if (typeof hash !== "string") {
    return buildClassNames(stitches, devices, styles);
  }
  let byDevices = classNamesByStitches.get(stitches);
  if (!byDevices) {
    byDevices = new WeakMap();
    classNamesByStitches.set(stitches, byDevices);
  }
  let byHash = byDevices.get(devices);
  if (!byHash) {
    byHash = new Map();
    byDevices.set(devices, byHash);
  }
  let classNames = byHash.get(hash);
  if (!classNames) {
    classNames = buildClassNames(stitches, devices, styles);
    byHash.set(hash, classNames);
  }
  return classNames;
}
const Box = /*#__PURE__*/React__default["default"].forwardRef((props, ref) => {
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
  } = React.useMemo(() => getClassNames(stitches, devices, styles),
  // `stitches` and `devices` join the hash because the class names are only valid for the
  // instance that generated them and the devices they were compiled against.
  [stitches, devices, styles.__hash]);
  return /*#__PURE__*/React__default["default"].createElement(as || __as || "div", {
    ref,
    ...restPassedProps,
    className: [boxClassName, componentClassName, className].filter(Boolean).join(" "),
    "data-testid": __name
  }, props.children);
});
Box.displayName = "Box";

/**
 * Created on first use rather than at module scope.
 *
 * The package root re-exports this module, so any consumer that imports an unrelated
 * helper from the root pulls this file into its module graph. In a React Server
 * Components environment `react` resolves to a build without `createContext`, so calling
 * it while the module evaluates throws before the consumer renders anything — even though
 * the provider itself is only ever used on the client.
 */
let externalDataContext = null;
function getExternalDataContext() {
  if (!externalDataContext) {
    externalDataContext = /*#__PURE__*/React.createContext(null);
  }
  return externalDataContext;
}
function useEasyblocksExternalData() {
  const context = React.useContext(getExternalDataContext());
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
  const ExternalDataContext = getExternalDataContext();
  return /*#__PURE__*/React__default["default"].createElement(ExternalDataContext.Provider, {
    value: externalData
  }, children);
}

/**
 * A Stitches instance plus the helpers to serialise what it has collected.
 *
 * Call it once per render tree — `useState(() => createEasyblocksStitches())` — and pass the
 * result to `<Easyblocks stitches={...} />`.
 *
 * Be aware of what that does and does not buy, because it is less than it looks. Stitches
 * memoises `createStitches` on the JSON of its config, so every call here with the same empty
 * config answers with the same object: two calls in one process are one instance and one
 * sheet, and on a server without a `document` that sheet is shared further still. A response
 * therefore carries whatever the process has generated since it started, across tenants, not
 * this page's rules alone — which is most of why the emitted `<style>` is as large as it is.
 *
 * Nothing here is wrong on screen: class names are derived from the styles rather than from
 * the instance, so a shared sheet names everything exactly as a private one would and a
 * browser instance still agrees with the server's markup at hydration. What it costs is
 * weight. Giving a call its own instance takes a config that serialises differently, and that
 * trades the growing sheet for a memo entry per call that is never released, so it is not a
 * fix to apply casually. `Box.test.tsx` pins the naming behaviour this all rests on.
 */
function createEasyblocksStitches() {
  // Typed loosely on purpose: `sheet` is part of the runtime surface but not the published
  // types, and `Box` already receives this instance as `any`.
  const stitches = core.createStitches({});
  const getCssText = () => stitches.getCssText();

  /**
   * Cumulative: the sheet is never drained, so this answers with every rule generated so far.
   *
   * Draining it between flushes is the mistake to avoid. Stitches re-inserts a rule it no
   * longer knows about, so the shared `Box` reset would reappear in a later tag, after the
   * component rules that already streamed.
   *
   * That used to decide the cascade, and no longer does: the reset is wrapped in `:where()`
   * and carries no specificity, so a component rule wins wherever either one sits. What is
   * left is pure weight — a streaming caller that returns this on every flush ships the whole
   * sheet each time, measured at twenty copies of 113 KB in one document.
   *
   * A caller streaming this into a response should therefore remember what it has already
   * sent and return only the rest: identical text means send nothing, and text that extends
   * what was sent means send the extension. Keep the fallback for text that does not extend
   * it — the sheet groups rules by layer, so a rule landing in an earlier group rewrites the
   * middle of the string, and sending the whole sheet again is the only safe answer there.
   */
  const getStyleTag = () => /*#__PURE__*/React__default["default"].createElement("style", {
    id: "stitches",
    dangerouslySetInnerHTML: {
      __html: getCssText()
    }
  });
  return {
    stitches,
    getCssText,
    getStyleTag
  };
}

/**
 * Fallback instance for callers that have not adopted `createEasyblocksStitches`.
 *
 * Shared process-wide, so it carries the accumulation described above and is only safe
 * where one tree exists at a time — the editor, and client-only rendering. Server rendering
 * should pass an explicit instance instead.
 */
const easyblocksStitchesInstances = [];
function easyblocksGetCssText() {
  return easyblocksStitchesInstances.map(stitches => stitches.getCssText()).join(" ");
}
function easyblocksGetStyleTag() {
  return /*#__PURE__*/React__default["default"].createElement("style", {
    id: "stitches",
    dangerouslySetInnerHTML: {
      __html: easyblocksGetCssText()
    }
  });
}

/** Created on first use — see the note in EasyblocksExternalDataProvider. */
let metadataContext = null;
function getMetadataContext() {
  if (!metadataContext) {
    metadataContext = /*#__PURE__*/React.createContext(undefined);
  }
  return metadataContext;
}
const EasyblocksMetadataProvider = _ref => {
  let {
    meta,
    children,
    stitches
  } = _ref;
  if (!stitches && easyblocksStitchesInstances.length === 0) {
    easyblocksStitchesInstances.push(core.createStitches({}));
  }
  const MetadataContext = getMetadataContext();
  return /*#__PURE__*/React__default["default"].createElement(MetadataContext.Provider, {
    value: {
      ...meta,
      stitches: stitches ?? easyblocksStitchesInstances[0]
    }
  }, children);
};
function useEasyblocksMetadata() {
  const context = React.useContext(getMetadataContext());
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
      return /*#__PURE__*/React__default["default"].createElement(Box, boxProps);
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
    slots = schema.filter(findComponentDefinition.isSchemaPropComponentOrComponentCollection);
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
    const elements = compiledArray.map((compiledChild, index) => "_component" in compiledChild ? /*#__PURE__*/React__default["default"].createElement(ComponentBuilder, {
      key: compiledChild._id,
      path: `${path}.${index}`,
      compiled: compiledChild,
      components: components
    }) : compiledChild);
    if (findComponentDefinition.isSchemaPropComponent(schemaProp)) {
      return elements[0];
    } else {
      return elements;
    }
  }
  const EditableComponentBuilder = isEditing ? components["EditableComponentBuilder.editor"] : components["EditableComponentBuilder.client"];
  let elements = compiledArray.map((compiledChild, index) => "_component" in compiledChild ? /*#__PURE__*/React__default["default"].createElement(EditableComponentBuilder, {
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
    elements = [/*#__PURE__*/React__default["default"].createElement(Placeholder, {
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
  if (findComponentDefinition.isSchemaPropComponent(schemaProp)) {
    return elements[0] ?? /*#__PURE__*/React__default["default"].createElement(React.Fragment, null);
  }
  return elements;
}
const ComponentBuilder = /*#__PURE__*/React__default["default"].memo(function ComponentBuilder(props) {
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
  const componentDefinition = findComponentDefinition.findComponentDefinitionById(compiled._component, defContext);
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
      return /*#__PURE__*/React__default["default"].createElement(MissingComponent, {
        error: true
      }, "Missing");
    } else {
      console.warn(`Missing "${compiled._component}"`);
      return /*#__PURE__*/React__default["default"].createElement(MissingComponent, {
        component: componentDefinition,
        error: true
      }, "Missing");
    }
  }
  const Component = component;
  const shopstoryCompiledConfig = compiled;

  // Memoize the runtime object — it only depends on meta which is stable per render tree.
  const runtime = React.useMemo(() => ({
    stitches: meta.stitches,
    resop: resop,
    devices: meta.vars.devices
  }), [meta.stitches, meta.vars.devices]);

  // Memoize buildBoxes — only recompute when the compiled styled tree changes.
  const styledBoxes = React.useMemo(() => buildBoxes(shopstoryCompiledConfig.styled, "", {}, meta), [shopstoryCompiledConfig.styled, meta]);

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
  const easyblocksProp = React.useMemo(() => ({
    id: shopstoryCompiledConfig._id,
    isEditing,
    path,
    runtime,
    isSelected: __isSelected
  }), [shopstoryCompiledConfig._id, isEditing, path, runtime, __isSelected]);

  // Memoize external props — only changes when compiled props or external data changes.
  const externalProps = React.useMemo(() => mapExternalProps(shopstoryCompiledConfig.props, shopstoryCompiledConfig._id, componentDefinition, externalData), [shopstoryCompiledConfig.props, shopstoryCompiledConfig._id, componentDefinition, externalData]);
  const componentProps = {
    ...restPassedProps,
    ...externalProps,
    ...styled,
    __easyblocks: easyblocksProp
  };
  return /*#__PURE__*/React__default["default"].createElement(Component, componentProps);
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
      if (schemaProp.type === "text" && findComponentDefinition.isLocalTextReference(propValue, "text")) {
        resultsProps[propName] = propValue.value;
      } else if (
      // FIXME: this is a mess
      !findComponentDefinition.isTrulyResponsiveValue(propValue) && typeof propValue === "object" && "id" in propValue && "widgetId" in propValue && !("value" in propValue) || findComponentDefinition.isTrulyResponsiveValue(propValue) && responsiveValueValues(propValue).every(v => typeof v === "object" && v && "id" in v && "widgetId" in v && !("value" in v))) {
        resultsProps[propName] = findComponentDefinition.resolveExternalValue(propValue, configId, schemaProp, externalData);
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

exports.Box = Box;
exports.ComponentBuilder = ComponentBuilder;
exports.EasyblocksExternalDataProvider = EasyblocksExternalDataProvider;
exports.EasyblocksMetadataProvider = EasyblocksMetadataProvider;
exports.RichTextPartClient = RichTextPartClient;
exports.cleanString = cleanString;
exports.componentPickerClosed = componentPickerClosed;
exports.componentPickerOpened = componentPickerOpened;
exports.createEasyblocksStitches = createEasyblocksStitches;
exports.easyblocksGetCssText = easyblocksGetCssText;
exports.easyblocksGetStyleTag = easyblocksGetStyleTag;
exports.itemInserted = itemInserted;
exports.itemMoved = itemMoved;
exports.responsiveValueValues = responsiveValueValues;
exports.richTextChangedEvent = richTextChangedEvent;
exports.selectionFramePositionChanged = selectionFramePositionChanged;
exports.useEasyblocksMetadata = useEasyblocksMetadata;
