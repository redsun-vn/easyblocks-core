/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var buildDocument = require('./buildDocument-5a0858e0.js');
var findComponentDefinition = require('./findComponentDefinition-33ee6a8d.js');
var configTraverse = require('./configTraverse-99893ab3.js');
var LazyEasyblocks = require('./LazyEasyblocks-994215fc.js');
var ComponentBuilder = require('./ComponentBuilder-8cc05724.js');
require('js-xxhash');
require('postcss-value-parser');
require('@babel/runtime/helpers/extends');
require('react');
require('@stitches/core');

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
  if (findComponentDefinition.isTrulyResponsiveValue(responsiveValue)) {
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
  if (!findComponentDefinition.isTrulyResponsiveValue(resVal)) {
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

/**
 * Class names for every Box of a compiled tree, worked out before the tree is sent.
 *
 * A compiled document carries a style object per Box, and the browser turns each one into a
 * class through Stitches while it hydrates. On a large page those objects are a third of the
 * payload, and the work is done again by every visitor for a result that never changes.
 * Doing it once, where the compiled tree is cached, removes both.
 *
 * Each Box object is replaced by `{ __isBox, __as, __className }`, the class string `Box`
 * would have produced itself, and `css` holds the rules for those classes. Stitches names a
 * class by hashing its styles, so the names are the same ones the browser would compute.
 *
 * Only Boxes under a `styled` key are touched: that is what `ComponentBuilder` hands to
 * `buildBoxes`, so anything else keeps the shape its readers expect.
 *
 * The walk is the one `buildBoxes` does (arrays by index, objects by key), and it is
 * synchronous on purpose: `createEasyblocksStitches()` hands back the one shared instance
 * and empties its sheet, so no other render may touch that sheet before `getCssText()` has
 * been read.
 *
 * The input is not changed; objects on the path to a Box are copied, everything else is
 * shared.
 */
function precomputeBoxClassNames(renderableContent, devices) {
  const {
    stitches,
    getCssText
  } = ComponentBuilder.createEasyblocksStitches();
  const walk = (value, inStyled) => {
    if (Array.isArray(value)) {
      let changed = false;
      const next = value.map(item => {
        const result = walk(item, inStyled);
        changed ||= result !== item;
        return result;
      });
      return changed ? next : value;
    }
    if (typeof value !== "object" || value === null) {
      return value;
    }
    if (inStyled && value.__isBox) {
      const {
        __as,
        ...styles
      } = value;
      const {
        boxClassName,
        componentClassName
      } = ComponentBuilder.getBoxClassNames(stitches, devices, styles);
      const precomputed = {
        __isBox: true,
        __className: [boxClassName, componentClassName].filter(Boolean).join(" ")
      };
      if (__as !== undefined) {
        precomputed.__as = __as;
      }
      return precomputed;
    }
    let next;
    for (const key in value) {
      const result = walk(value[key], inStyled || key === "styled");
      if (result !== value[key]) {
        next ??= {
          ...value
        };
        next[key] = result;
      }
    }
    return next ?? value;
  };
  const result = walk(renderableContent, false);
  return {
    renderableContent: result,
    css: getCssText()
  };
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
exports.findExternals = buildDocument.findExternals;
exports.mergeCompilationMeta = buildDocument.mergeCompilationMeta;
exports.normalizeInput = buildDocument.normalizeInput;
exports.validate = buildDocument.validate;
exports.getExternalReferenceLocationKey = findComponentDefinition.getExternalReferenceLocationKey;
exports.getExternalValue = findComponentDefinition.getExternalValue;
exports.getResolvedExternalDataValue = findComponentDefinition.getResolvedExternalDataValue;
exports.isComponentConfig = findComponentDefinition.isComponentConfig;
exports.isCompoundExternalDataValue = findComponentDefinition.isCompoundExternalDataValue;
exports.isDocument = findComponentDefinition.isDocument;
exports.isEmptyExternalReference = findComponentDefinition.isEmptyExternalReference;
exports.isEmptyRenderableContent = findComponentDefinition.isEmptyRenderableContent;
exports.isIdReferenceToDocumentExternalValue = findComponentDefinition.isIdReferenceToDocumentExternalValue;
exports.isLocalTextReference = findComponentDefinition.isLocalTextReference;
exports.isLocalValue = findComponentDefinition.isLocalValue;
exports.isNonEmptyRenderableContent = findComponentDefinition.isNonEmptyRenderableContent;
exports.isRenderableContent = findComponentDefinition.isRenderableContent;
exports.isResolvedCompoundExternalDataValue = findComponentDefinition.isResolvedCompoundExternalDataValue;
exports.isTrulyResponsiveValue = findComponentDefinition.isTrulyResponsiveValue;
exports.resolveExternalValue = findComponentDefinition.resolveExternalValue;
exports.responsiveValueEntries = findComponentDefinition.responsiveValueEntries;
exports.responsiveValueMap = findComponentDefinition.responsiveValueMap;
exports.CompilationCache = configTraverse.CompilationCache;
exports.buildRichTextNoCodeEntry = configTraverse.buildRichTextNoCodeEntry;
exports.compileInternal = configTraverse.compileInternal;
exports.createCompilationContext = configTraverse.createCompilationContext;
exports.getDefaultLocale = configTraverse.getDefaultLocale;
exports.getDevicesWidths = configTraverse.getDevicesWidths;
exports.getFallbackForLocale = configTraverse.getFallbackForLocale;
exports.getFallbackLocaleForLocale = configTraverse.getFallbackLocaleForLocale;
exports.getSchemaDefinition = configTraverse.getSchemaDefinition;
exports.normalize = configTraverse.normalize;
exports.parseSpacing = configTraverse.parseSpacing;
exports.resolveLocalisedValue = configTraverse.resolveLocalisedValue;
exports.responsiveValueAt = configTraverse.responsiveValueAt;
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
exports.responsiveValueNormalize = configTraverse.responsiveValueNormalize;
exports.spacingToPx = configTraverse.spacingToPx;
exports.validateColor = configTraverse.validateColor;
exports.Easyblocks = LazyEasyblocks.Easyblocks;
exports.LazyEasyblocks = LazyEasyblocks.LazyEasyblocks;
exports.defaultFontFamily = LazyEasyblocks.defaultFontFamily;
exports.defaultFontSize = LazyEasyblocks.defaultFontSize;
exports.defaultFontWeight = LazyEasyblocks.defaultFontWeight;
exports.defaultLineHeight = LazyEasyblocks.defaultLineHeight;
exports.fontFamilies = LazyEasyblocks.fontFamilies;
exports.getFontFamilies = LazyEasyblocks.getFontFamilies;
exports.getFontSizes = LazyEasyblocks.getFontSizes;
exports.getFontWeights = LazyEasyblocks.getFontWeights;
exports.getLineHeights = LazyEasyblocks.getLineHeights;
exports.loadGoogleFonts = LazyEasyblocks.loadGoogleFonts;
exports.createEasyblocksStitches = ComponentBuilder.createEasyblocksStitches;
exports.easyblocksGetCssText = ComponentBuilder.easyblocksGetCssText;
exports.easyblocksGetStyleTag = ComponentBuilder.easyblocksGetStyleTag;
exports.responsiveValueValues = ComponentBuilder.responsiveValueValues;
exports.box = box;
exports.getBrightnessColor = getBrightnessColor;
exports.globalSectionGroups = globalSectionGroups;
exports.isNoCodeComponentOfType = isNoCodeComponentOfType;
exports.precomputeBoxClassNames = precomputeBoxClassNames;
exports.responsiveValueReduce = responsiveValueReduce;
exports.responsiveValueSet = responsiveValueSet;
