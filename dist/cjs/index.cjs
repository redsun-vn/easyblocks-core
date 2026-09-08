/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var buildDocument = require('./buildDocument-656c321f.js');
var findComponentDefinition = require('./findComponentDefinition-13d8e05b.js');
var configTraverse = require('./configTraverse-70f5135e.js');
var LazyEasyblocks = require('./LazyEasyblocks-d2554623.js');
var ComponentBuilder = require('./ComponentBuilder-e6478cea.js');
require('zod');
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
exports.responsiveValueReduce = responsiveValueReduce;
exports.responsiveValueSet = responsiveValueSet;
