/* with love from shopstory */
export { b as buildDocument, a as buildEntry, c as compile, f as findExternals, m as mergeCompilationMeta, n as normalizeInput, v as validate } from './buildDocument-09b1b9a9.js';
import { i as isTrulyResponsiveValue } from './findComponentDefinition-2b190cc9.js';
export { k as getExternalReferenceLocationKey, l as getExternalValue, m as getResolvedExternalDataValue, a as isComponentConfig, n as isCompoundExternalDataValue, b as isDocument, c as isEmptyExternalReference, d as isEmptyRenderableContent, e as isIdReferenceToDocumentExternalValue, o as isLocalTextReference, f as isLocalValue, g as isNonEmptyRenderableContent, h as isRenderableContent, j as isResolvedCompoundExternalDataValue, i as isTrulyResponsiveValue, r as resolveExternalValue, p as responsiveValueEntries, q as responsiveValueMap } from './findComponentDefinition-2b190cc9.js';
export { C as CompilationCache, b as buildRichTextNoCodeEntry, c as compileInternal, a as createCompilationContext, e as getDefaultLocale, d as getDevicesWidths, f as getFallbackForLocale, h as getFallbackLocaleForLocale, g as getSchemaDefinition, n as normalize, y as parseSpacing, r as resolveLocalisedValue, i as responsiveValueAt, j as responsiveValueFill, k as responsiveValueFindDeviceWithDefinedValue, l as responsiveValueFindHigherDeviceWithDefinedValue, m as responsiveValueFindLowerDeviceWithDefinedValue, o as responsiveValueFlatten, p as responsiveValueForceGet, q as responsiveValueGet, s as responsiveValueGetDefinedValue, t as responsiveValueGetFirstHigherValue, u as responsiveValueGetFirstLowerValue, w as responsiveValueGetHighestDefinedDevice, x as responsiveValueNormalize, z as spacingToPx, v as validateColor } from './configTraverse-968b60b0.js';
export { E as Easyblocks, L as LazyEasyblocks, d as defaultFontFamily, a as defaultFontSize, b as defaultFontWeight, c as defaultLineHeight, f as fontFamilies, g as getFontFamilies, e as getFontSizes, h as getFontWeights, i as getLineHeights, l as loadGoogleFonts } from './LazyEasyblocks-0b02e8dc.js';
import { c as createEasyblocksStitches, g as getBoxClassNames } from './ComponentBuilder-06698931.js';
export { c as createEasyblocksStitches, e as easyblocksGetCssText, a as easyblocksGetStyleTag, r as responsiveValueValues } from './ComponentBuilder-06698931.js';
import 'zod';
import 'js-xxhash';
import 'postcss-value-parser';
import '@babel/runtime/helpers/extends';
import 'react';
import '@stitches/core';

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
  if (isTrulyResponsiveValue(responsiveValue)) {
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
  if (!isTrulyResponsiveValue(resVal)) {
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
  } = createEasyblocksStitches();
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
      } = getBoxClassNames(stitches, devices, styles);
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

export { box, getBrightnessColor, globalSectionGroups, isNoCodeComponentOfType, precomputeBoxClassNames, responsiveValueReduce, responsiveValueSet };
