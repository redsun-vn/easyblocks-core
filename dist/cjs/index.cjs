/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var buildDocument = require('./buildDocument-d8cba1e2.js');
var configTraverse = require('./configTraverse-503722f4.js');
var React = require('react');
var _extends = require('@babel/runtime/helpers/extends');
var ComponentBuilder = require('./ComponentBuilder-da745f2e.js');
require('js-xxhash');
require('zod');
require('postcss-value-parser');
require('@stitches/core');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);
var _extends__default = /*#__PURE__*/_interopDefaultLegacy(_extends);

const pxKeys = {
  margin: true,
  marginTop: true,
  marginBottom: true,
  marginLeft: true,
  marginRight: true,
  m: true,
  mt: true,
  mb: true,
  ml: true,
  mr: true,
  mx: true,
  my: true,
  padding: true,
  paddingTop: true,
  paddingBottom: true,
  paddingLeft: true,
  paddingRight: true,
  p: true,
  pt: true,
  pb: true,
  pl: true,
  pr: true,
  px: true,
  py: true,
  top: true,
  bottom: true,
  left: true,
  right: true,
  flexBasis: true,
  gridColumnGap: true,
  gridRowGap: true
};
function numericToPx(input) {
  const ret = {};
  for (const key in input) {
    if (pxKeys[key] && typeof input[key] === "number") {
      ret[key] = input[key] + "px";
    } else {
      ret[key] = input[key];
    }
  }
  return ret;
}
const box = (styles, tag) => {
  const ret = numericToPx(styles);
  ret.__isBox = true;
  if (tag) {
    ret.__as = tag;
  }
  return ret;
};

function responsiveValueSet(responsiveValue, deviceId, value, devices) {
  let trulyResponsive;
  if (configTraverse.isTrulyResponsiveValue(responsiveValue)) {
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

function responsiveValueReduce(resVal, reducer, initialValue, devices) {
  if (!configTraverse.isTrulyResponsiveValue(resVal)) {
    return reducer(initialValue, resVal);
  }
  let result = initialValue;
  for (let i = 0; i < devices.length; i++) {
    const key = devices[i].id;
    if (resVal[key] === undefined) {
      continue;
    }
    result = reducer(result, resVal[key], key);
  }
  return result;
}

function RichTextClient(props) {
  const {
    elements: Elements,
    Root
  } = props;
  return /*#__PURE__*/React__default["default"].createElement(Root.type, Root.props, Elements.map((Element, index) => {
    return /*#__PURE__*/React__default["default"].createElement(Element.type, _extends__default["default"]({}, Element.props, {
      key: index
    }));
  }));
}

function RichTextBlockElementClient(props) {
  const {
    type,
    BulletedList,
    elements: Elements,
    NumberedList,
    Paragraph
  } = props;
  const elements = Elements.map((Element, index) => /*#__PURE__*/React__default["default"].createElement(Element.type, _extends__default["default"]({}, Element.props, {
    key: index
  })));
  if (type === "paragraph") {
    return /*#__PURE__*/React__default["default"].createElement(Paragraph.type, Paragraph.props, elements);
  }
  if (type === "bulleted-list") {
    return /*#__PURE__*/React__default["default"].createElement(BulletedList.type, BulletedList.props, elements);
  }
  if (type === "numbered-list") {
    return /*#__PURE__*/React__default["default"].createElement(NumberedList.type, NumberedList.props, elements);
  }
  if (process.env.NODE_ENV === "development") {
    console.warn(`Unknown @easyblocks/rich-text-block-element type "${type}"`);
  }
  return /*#__PURE__*/React__default["default"].createElement("div", null, elements);
}

function RichTextLineElementClient(props) {
  const {
    blockType,
    elements: Elements,
    ListItem,
    TextLine
  } = props;
  const elements = Elements.map((Element, index) => /*#__PURE__*/React__default["default"].createElement(Element.type, _extends__default["default"]({}, Element.props, {
    key: index
  })));
  if (blockType === "paragraph") {
    return /*#__PURE__*/React__default["default"].createElement(TextLine.type, TextLine.props, elements);
  }
  if (blockType === "bulleted-list" || blockType === "numbered-list") {
    return /*#__PURE__*/React__default["default"].createElement(ListItem.type, ListItem.props, /*#__PURE__*/React__default["default"].createElement("div", null, elements));
  }
  if (process.env.NODE_ENV === "development") {
    console.warn(`Unknown @easyblocks/rich-text-line-element blockType "${blockType}"`);
  }
  return /*#__PURE__*/React__default["default"].createElement("div", null, elements);
}

function TextClient(props) {
  const {
    value,
    Text
  } = props;

  // We need to transform new lines into <br />
  const lines = ComponentBuilder.cleanString(value || "").split(/(?:\r\n|\r|\n)/g);
  const elements = [];
  lines.forEach((line, index) => {
    elements.push(/*#__PURE__*/React__default["default"].createElement(React__default["default"].Fragment, {
      key: index
    }, line));
    if (index !== lines.length - 1) {
      elements.push(/*#__PURE__*/React__default["default"].createElement("br", {
        key: "br" + index
      }));
    }
  });
  return /*#__PURE__*/React__default["default"].createElement(Text.type, Text.props, elements);
}

const rootStyles = {
  position: "relative",
  width: "100%"
};
const ratioStyles = _ref => {
  let {
    type
  } = _ref;
  return {
    paddingBottom: (() => {
      if (type === "SECTION") {
        return "50%";
      }
      if (type === "CARD") {
        return "133%";
      }
      return "auto";
    })(),
    display: type === "BUTTON" ? "none" : "block",
    height: type === "BUTTON" ? "50px" : "auto"
  };
};
const contentStyles = _ref2 => {
  let {
    type,
    error
  } = _ref2;
  return {
    position: type === "CARD" || type === "SECTION" ? "absolute" : "static",
    boxSizing: "border-box",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#fafafa",
    color: error ? "red" : "grey",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "sans-serif",
    textAlign: "center",
    fontSize: "14px",
    minHeight: "40px",
    padding: type === "CARD" || type === "SECTION" ? "32px" : "0.5em 0.5em"
  };
};
function MissingComponent(_ref3) {
  let {
    component,
    children,
    error
  } = _ref3;
  const isButton = component?.type === "button" || Array.isArray(component?.type) && component?.type.includes("button");
  const isSection = component?.type === "section" || Array.isArray(component?.type) && component?.type.includes("section");
  const isCard = component?.type === "card" || Array.isArray(component?.type) && component?.type.includes("card");
  let type;
  if (isSection) {
    type = "SECTION";
  } else if (isCard) {
    type = "CARD";
  } else if (isButton) {
    type = "BUTTON";
  }
  return /*#__PURE__*/React__default["default"].createElement("div", {
    style: rootStyles
  }, /*#__PURE__*/React__default["default"].createElement("div", {
    style: ratioStyles({
      type
    })
  }), /*#__PURE__*/React__default["default"].createElement("div", {
    style: contentStyles({
      type,
      error
    })
  }, children));
}

const builtinComponents = {
  "@easyblocks/missing-component": MissingComponent,
  "@easyblocks/rich-text.client": RichTextClient,
  "@easyblocks/rich-text-block-element": RichTextBlockElementClient,
  "@easyblocks/rich-text-line-element": RichTextLineElementClient,
  "@easyblocks/rich-text-part": ComponentBuilder.RichTextPartClient,
  "@easyblocks/text.client": TextClient,
  "EditableComponentBuilder.client": ComponentBuilder.ComponentBuilder
};
function Easyblocks(_ref) {
  let {
    renderableDocument,
    externalData,
    componentOverrides,
    components
  } = _ref;
  React.useEffect(() => {
    document.documentElement.style.setProperty("--shopstory-viewport-width", `calc(100vw - ${window.innerWidth - document.documentElement.clientWidth}px)`);
  });
  const renderableContent = renderableDocument.renderableContent;
  if (renderableContent === null) {
    return null;
  }
  if (componentOverrides) {
    const overridesEntries = Object.entries(componentOverrides);
    overridesEntries.forEach(_ref2 => {
      let [componentProp, componentOverride] = _ref2;
      renderableContent.components[componentProp] = [componentOverride];
    });
  }
  return /*#__PURE__*/React__default["default"].createElement(ComponentBuilder.EasyblocksMetadataProvider, {
    meta: renderableDocument.meta
  }, /*#__PURE__*/React__default["default"].createElement(ComponentBuilder.EasyblocksExternalDataProvider, {
    externalData: externalData ?? {}
  }, /*#__PURE__*/React__default["default"].createElement(ComponentBuilder.ComponentBuilder, {
    compiled: renderableContent,
    path: "",
    components: {
      ...components,
      ...builtinComponents
    }
  })));
}

/**
 * Pure helpers backing {@link LazyEasyblocks}. Kept DOM-free so they can be
 * unit-tested in the repo's node-environment jest setup.
 */

/**
 * Pick the collection slot with the most children on the root compiled node.
 * Only array-valued entries are considered. Returns `undefined` when there is
 * no non-empty collection to lazy-mount.
 */
function autoDetectSlot(components) {
  if (!components) {
    return undefined;
  }
  let bestSlot;
  let bestLength = 0;
  for (const key in components) {
    const value = components[key];
    if (Array.isArray(value) && value.length > bestLength) {
      bestSlot = key;
      bestLength = value.length;
    }
  }
  return bestSlot;
}

/**
 * Build a document whose target collection slot is sliced to `visibleCount`
 * children. Child config objects are reused by reference so children already
 * mounted (keyed by `_id` in the renderer) never remount.
 *
 * Shallow-clones the document, root node, and its `components` map so the
 * caller's original `renderableContent` stays untouched by Easyblocks' own
 * `componentOverrides` mutation. Returns the original document unchanged when
 * there is no non-empty slot to slice.
 */
function buildSlicedDocument(renderableDocument, slot, visibleCount) {
  const renderableContent = renderableDocument.renderableContent;
  if (!renderableContent || !slot || !Array.isArray(renderableContent.components?.[slot]) || renderableContent.components[slot].length === 0) {
    return renderableDocument;
  }
  const slicedContent = {
    ...renderableContent,
    components: {
      ...renderableContent.components,
      [slot]: renderableContent.components[slot].slice(0, visibleCount)
    }
  };
  return {
    ...renderableDocument,
    renderableContent: slicedContent
  };
}

/**
 * Drop-in wrapper around {@link Easyblocks} that progressively mounts the
 * children of one collection slot on scroll (append-only infinite scroll).
 *
 * Children config objects are reused by reference when slicing, so children
 * already mounted (keyed by `_id` inside the renderer) never remount — each
 * scroll batch only mounts the newly revealed children.
 */
function LazyEasyblocks(_ref) {
  let {
    renderableDocument,
    initialCount = 3,
    batchSize = 3,
    slot,
    scrollRoot = null,
    rootMargin = "200px",
    ...easyblocksProps
  } = _ref;
  const renderableContent = renderableDocument.renderableContent;

  // Resolve which collection slot to lazy-mount. `components` is keyed by slot
  // name; each value is an array of compiled child configs (or ReactElements).
  const resolvedSlot = slot ?? autoDetectSlot(renderableContent?.components);
  const children = renderableContent && resolvedSlot ? renderableContent.components[resolvedSlot] : undefined;
  const total = children?.length ?? 0;
  const [visibleCount, setVisibleCount] = React.useState(() => Math.min(initialCount, total));
  const hasMore = visibleCount < total;
  const sentinelRef = React.useRef(null);

  // Reset visible count when the document, slot, or initial count changes so a
  // new document does not inherit the previous scroll position.
  React.useEffect(() => {
    setVisibleCount(Math.min(initialCount, total));
  }, [renderableDocument, resolvedSlot, initialCount, total]);

  // Reveal more children when the sentinel scrolls into view. `visibleCount` is
  // in the deps on purpose: after a batch the effect re-runs and re-`observe`s,
  // which delivers a fresh intersection callback. If the sentinel is still in
  // view (short items / tall viewport), the next batch loads immediately and
  // loops until the viewport is filled — IntersectionObserver otherwise only
  // fires on threshold *crossings*, so a stationary sentinel would stall.
  React.useEffect(() => {
    if (!hasMore || typeof IntersectionObserver === "undefined") {
      return;
    }
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }
    const step = Math.max(1, batchSize);
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisibleCount(current => Math.min(current + step, total));
      }
    }, {
      root: scrollRoot,
      rootMargin
    });
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [hasMore, batchSize, total, scrollRoot, rootMargin, visibleCount]);

  // Build a sliced document that reuses child references. Falls back to the
  // original document when there is no non-empty collection to lazy-mount.
  const slicedDocument = React.useMemo(() => buildSlicedDocument(renderableDocument, resolvedSlot, visibleCount), [renderableDocument, resolvedSlot, visibleCount]);

  // No collection to lazy-mount: behave exactly like a plain <Easyblocks />
  // (including its `componentOverrides` mutation behavior — the clone-based
  // protection only applies when there is a slot to slice).
  if (total === 0) {
    return /*#__PURE__*/React__default["default"].createElement(Easyblocks, _extends__default["default"]({}, easyblocksProps, {
      renderableDocument: renderableDocument
    }));
  }
  return /*#__PURE__*/React__default["default"].createElement(React__default["default"].Fragment, null, /*#__PURE__*/React__default["default"].createElement(Easyblocks, _extends__default["default"]({}, easyblocksProps, {
    renderableDocument: slicedDocument
  })), hasMore ? /*#__PURE__*/React__default["default"].createElement("div", {
    ref: sentinelRef,
    "aria-hidden": "true",
    style: {
      width: "100%"
    }
  }) : null);
}

function isNoCodeComponentOfType(definition, type) {
  if (!definition.type) {
    return false;
  }
  if (typeof definition.type === "string") {
    return type === definition.type;
  }
  return definition.type.includes(type);
}

const getBrightnessColor = hex => {
  // remove "#"
  hex = hex.replace("#", "");

  // convert hex to r g b
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128 ? "#ffffff" : "#000000";
};

const globalSectionGroups = [{
  id: "group-headers",
  name: "Headers"
}, {
  id: "group-footers",
  name: "Footers"
}];

exports.buildDocument = buildDocument.buildDocument;
exports.buildEntry = buildDocument.buildEntry;
exports.compile = buildDocument.compile;
exports.defaultFontFamily = buildDocument.defaultFontFamily;
exports.defaultFontSize = buildDocument.defaultFontSize;
exports.defaultFontWeight = buildDocument.defaultFontWeight;
exports.defaultLineHeight = buildDocument.defaultLineHeight;
exports.findExternals = buildDocument.findExternals;
exports.fontFamilies = buildDocument.fontFamilies;
exports.getFontFamilies = buildDocument.getFontFamilies;
exports.getFontSizes = buildDocument.getFontSizes;
exports.getFontWeights = buildDocument.getFontWeights;
exports.getLineHeights = buildDocument.getLineHeights;
exports.loadGoogleFonts = buildDocument.loadGoogleFonts;
exports.mergeCompilationMeta = buildDocument.mergeCompilationMeta;
exports.normalizeInput = buildDocument.normalizeInput;
exports.validate = buildDocument.validate;
exports.CompilationCache = configTraverse.CompilationCache;
exports.buildRichTextNoCodeEntry = configTraverse.buildRichTextNoCodeEntry;
exports.compileInternal = configTraverse.compileInternal;
exports.createCompilationContext = configTraverse.createCompilationContext;
exports.getDefaultLocale = configTraverse.getDefaultLocale;
exports.getDevicesWidths = configTraverse.getDevicesWidths;
exports.getExternalReferenceLocationKey = configTraverse.getExternalReferenceLocationKey;
exports.getExternalValue = configTraverse.getExternalValue;
exports.getFallbackForLocale = configTraverse.getFallbackForLocale;
exports.getFallbackLocaleForLocale = configTraverse.getFallbackLocaleForLocale;
exports.getResolvedExternalDataValue = configTraverse.getResolvedExternalDataValue;
exports.getSchemaDefinition = configTraverse.getSchemaDefinition;
exports.isComponentConfig = configTraverse.isComponentConfig;
exports.isCompoundExternalDataValue = configTraverse.isCompoundExternalDataValue;
exports.isDocument = configTraverse.isDocument;
exports.isEmptyExternalReference = configTraverse.isEmptyExternalReference;
exports.isEmptyRenderableContent = configTraverse.isEmptyRenderableContent;
exports.isIdReferenceToDocumentExternalValue = configTraverse.isIdReferenceToDocumentExternalValue;
exports.isLocalTextReference = configTraverse.isLocalTextReference;
exports.isLocalValue = configTraverse.isLocalValue;
exports.isNonEmptyRenderableContent = configTraverse.isNonEmptyRenderableContent;
exports.isRenderableContent = configTraverse.isRenderableContent;
exports.isResolvedCompoundExternalDataValue = configTraverse.isResolvedCompoundExternalDataValue;
exports.isTrulyResponsiveValue = configTraverse.isTrulyResponsiveValue;
exports.normalize = configTraverse.normalize;
exports.parseSpacing = configTraverse.parseSpacing;
exports.resolveExternalValue = configTraverse.resolveExternalValue;
exports.resolveLocalisedValue = configTraverse.resolveLocalisedValue;
exports.responsiveValueAt = configTraverse.responsiveValueAt;
exports.responsiveValueEntries = configTraverse.responsiveValueEntries;
exports.responsiveValueFill = configTraverse.responsiveValueFill;
exports.responsiveValueFindDeviceWithDefinedValue = configTraverse.responsiveValueFindDeviceWithDefinedValue;
exports.responsiveValueFindHigherDeviceWithDefinedValue = configTraverse.responsiveValueFindHigherDeviceWithDefinedValue;
exports.responsiveValueFindLowerDeviceWithDefinedValue = configTraverse.responsiveValueFindLowerDeviceWithDefinedValue;
exports.responsiveValueFlatten = configTraverse.responsiveValueFlatten;
exports.responsiveValueForceGet = configTraverse.responsiveValueForceGet;
exports.responsiveValueGet = configTraverse.responsiveValueGet;
exports.responsiveValueGetDefinedValue = configTraverse.responsiveValueGetDefinedValue;
exports.responsiveValueGetFirstHigherValue = configTraverse.responsiveValueGetFirstHigherValue;
exports.responsiveValueGetFirstLowerValue = configTraverse.responsiveValueGetFirstLowerValue;
exports.responsiveValueGetHighestDefinedDevice = configTraverse.responsiveValueGetHighestDefinedDevice;
exports.responsiveValueMap = configTraverse.responsiveValueMap;
exports.responsiveValueNormalize = configTraverse.responsiveValueNormalize;
exports.spacingToPx = configTraverse.spacingToPx;
exports.validateColor = configTraverse.validateColor;
exports.easyblocksGetCssText = ComponentBuilder.easyblocksGetCssText;
exports.easyblocksGetStyleTag = ComponentBuilder.easyblocksGetStyleTag;
exports.responsiveValueValues = ComponentBuilder.responsiveValueValues;
exports.Easyblocks = Easyblocks;
exports.LazyEasyblocks = LazyEasyblocks;
exports.box = box;
exports.getBrightnessColor = getBrightnessColor;
exports.globalSectionGroups = globalSectionGroups;
exports.isNoCodeComponentOfType = isNoCodeComponentOfType;
exports.responsiveValueReduce = responsiveValueReduce;
exports.responsiveValueSet = responsiveValueSet;
