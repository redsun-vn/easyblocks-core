/* with love from shopstory */
'use strict';

var jsXxhash = require('js-xxhash');
var valueParser = require('postcss-value-parser');
var React = require('react');
var zod = require('zod');
var core = require('@stitches/core');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var valueParser__default = /*#__PURE__*/_interopDefaultLegacy(valueParser);
var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

function isCompiledComponentConfig(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
arg) {
  return typeof arg === "object" && arg !== null && typeof arg._component === "string" && typeof arg._id === "string" && typeof arg.actions === "object" && typeof arg.components === "object";
}

function isRenderableContent(input) {
  return typeof input === "object" && input !== null && "renderableContent" in input && (isCompiledComponentConfig(input.renderableContent) || input.renderableContent === null);
}
function isNonEmptyRenderableContent(input) {
  return typeof input === "object" && input !== null && "renderableContent" in input && isCompiledComponentConfig(input.renderableContent);
}
function isEmptyRenderableContent(input) {
  return typeof input === "object" && input !== null && "renderableContent" in input && input.renderableContent === null;
}
const documentSchema = zod.z.object({
  documentId: zod.z.string(),
  projectId: zod.z.string(),
  rootContainer: zod.z.string().optional(),
  preview: zod.z.object({}).optional(),
  config: zod.z.optional(zod.z.object({}))
});
function isDocument(value) {
  return documentSchema.safeParse(value).success;
}
function isComponentConfig(value) {
  return typeof value === "object" && typeof value?._component === "string" && typeof value?._id === "string";
}
const localValueSchema = zod.z.object({
  value: zod.z.any(),
  widgetId: zod.z.string()
});
function isLocalValue(value) {
  return localValueSchema.safeParse(value).success;
}
function isResolvedCompoundExternalDataValue(value) {
  return "type" in value && value.type === "object" && "value" in value;
}
function isIdReferenceToDocumentExternalValue(id) {
  return typeof id === "string" && id.startsWith("$.");
}
function isEmptyExternalReference(externalDataConfigEntry) {
  return externalDataConfigEntry.id === null;
}

// Sorry for this name
function isTrulyResponsiveValue$1(x) {
  return typeof x === "object" && x !== null && !Array.isArray(x) && x.$res === true;
}

function responsiveValueGet(value, deviceId) {
  if (isTrulyResponsiveValue$1(value)) {
    return value[deviceId];
  }
  return value;
}
function responsiveValueForceGet$1(value, deviceId) {
  if (isTrulyResponsiveValue$1(value)) {
    if (value[deviceId] === undefined) {
      const error = `You called responsiveValueForceGet with value ${JSON.stringify(value)} and deviceId: ${deviceId}. Value undefined.`;
      throw new Error(error);
    }
    return value[deviceId];
  }
  return value;
}

function getDeviceWidthPairs(widths, devices) {
  const componentWidths = [];
  for (const key in widths) {
    if (key === "$res") {
      continue;
    }
    componentWidths.push({
      width: responsiveValueForceGet$1(widths, key),
      deviceId: key
    });
  }
  componentWidths.sort((x, y) => {
    if (x.width === y.width) {
      const xDevicesIndex = devices.findIndex(d => d.id === x.deviceId);
      const yDevicesIndex = devices.findIndex(d => d.id === y.deviceId);
      return xDevicesIndex > yDevicesIndex ? 1 : -1;
    }
    return x.width === y.width ? 0 : x.width > y.width ? 1 : -1;
  });
  return componentWidths;
}
function getDeviceWidthPairsFromDevices(devices) {
  return devices.map(d => ({
    width: d.w,
    deviceId: d.id
  }));
}

function responsiveValueFill(value, devices, widths) {
  if (!isTrulyResponsiveValue$1(value)) {
    return value;
  }
  const componentWidths = getDeviceWidthPairs(widths, devices);
  const result = {
    ...value
  };
  componentWidths.forEach((_ref, index) => {
    let {
      width,
      deviceId
    } = _ref;
    if (result[deviceId] === undefined) {
      // Let's look for a value up
      for (let i = index + 1; i < componentWidths.length; i++) {
        const valueForHigherWidth = result[componentWidths[i].deviceId];
        if (valueForHigherWidth !== undefined) {
          result[deviceId] = valueForHigherWidth;
          break;
        }
      }

      // If still undefined, let's look for a value down
      if (result[deviceId] === undefined) {
        for (let i = index - 1; i >= 0; i--) {
          const valueForLowerWidth = result[componentWidths[i].deviceId];
          if (valueForLowerWidth !== undefined) {
            result[deviceId] = valueForLowerWidth;
            break;
          }
        }
      }
      if (result[deviceId] === undefined) {
        throw new Error("Can't fill");
      }
    }
  });
  return result;
}

function responsiveValueFindHigherDeviceWithDefinedValue(value, breakpoint, devices, widths) {
  const componentWidths = widths ? getDeviceWidthPairs(widths, devices) : getDeviceWidthPairsFromDevices(devices);
  const componentWidthIndex = componentWidths.findIndex(x => x.deviceId === breakpoint);
  const componentWidth = devices[componentWidthIndex];
  if (!componentWidth) {
    throw new Error("undefined breakpoint");
  }

  //
  // if (device.breakpoint === null) {
  //   return;
  // }

  for (let i = componentWidthIndex + 1; i <= componentWidths.length - 1; i++) {
    const deviceId = componentWidths[i].deviceId;
    if (value[deviceId] !== undefined) {
      return devices.find(d => d.id === deviceId);
    }
  }
  return undefined;
}
function responsiveValueFindLowerDeviceWithDefinedValue(value, breakpoint, devices, widths) {
  const componentWidths = widths ? getDeviceWidthPairs(widths, devices) : getDeviceWidthPairsFromDevices(devices);
  const componentWidthIndex = componentWidths.findIndex(x => x.deviceId === breakpoint);
  const componentWidth = devices[componentWidthIndex];
  if (!componentWidth) {
    throw new Error("undefined breakpoint");
  }
  for (let i = componentWidthIndex - 1; i >= 0; i--) {
    const deviceId = componentWidths[i].deviceId;
    if (value[deviceId] !== undefined) {
      return devices.find(d => d.id === deviceId);
    }
  }
  return undefined;
}
function responsiveValueFindDeviceWithDefinedValue(value, breakpoint, devices, widths) {
  if (value[breakpoint] !== undefined) {
    return devices.find(x => x.id === breakpoint);
  }
  const higherDevice = responsiveValueFindHigherDeviceWithDefinedValue(value, breakpoint, devices, widths);
  if (higherDevice !== undefined) {
    return higherDevice;
  }
  const lowerDevice = responsiveValueFindLowerDeviceWithDefinedValue(value, breakpoint, devices, widths);
  if (lowerDevice !== undefined) {
    return lowerDevice;
  }
  return undefined;
}

function responsiveValueGetFirstHigherValue(value, breakpoint, devices, widths) {
  const higherDefinedDevice = responsiveValueFindHigherDeviceWithDefinedValue(value, breakpoint, devices, widths);
  if (!higherDefinedDevice) {
    return;
  }
  return value[higherDefinedDevice.id];
}
function responsiveValueGetFirstLowerValue(value, breakpoint, devices, widths) {
  const lowerDefinedDevice = responsiveValueFindLowerDeviceWithDefinedValue(value, breakpoint, devices, widths);
  if (!lowerDefinedDevice) {
    return;
  }
  return value[lowerDefinedDevice.id];
}
function responsiveValueGetDefinedValue(value, breakpoint, devices, widths) {
  if (!isTrulyResponsiveValue$1(value)) {
    return value;
  }
  const definedDevice = responsiveValueFindDeviceWithDefinedValue(value, breakpoint, devices, widths);
  if (!definedDevice) {
    return;
  }
  return value[definedDevice.id];
}

function bubbleDown(matcher, items) {
  const originalOrder = [];
  const bubbledDown = [];
  items.forEach(item => {
    if (matcher(item)) {
      bubbledDown.push(item);
    } else {
      originalOrder.push(item);
    }
  });
  return [...originalOrder, ...bubbledDown];
}

// eslint-disable-next-line @typescript-eslint/ban-types
function toArray(scalarOrCollection) {
  if (Array.isArray(scalarOrCollection)) {
    return scalarOrCollection;
  }
  return [scalarOrCollection];
}

function range(start, end) {
  const itemsCount = start === end ? 1 : end - start + 1;
  return Array.from({
    length: itemsCount
  }, (_, index) => {
    return start + index;
  });
}

/**
 * Returns a new function that filters nullable elements to be used as callback of `.filter` method.
 * It's useful because it has already defined guard which otherwise would be repeated in many places
 * and also it automatically changes the return value of filter function by extracting `null` and `undefined` types.
 *
 * Usage:
 * ```
 * const onlyNonNullable = nullableElements.filter<TypeOfCollectionItem>(nonNullable())
 * ```
 */
function nonNullable() {
  return function (value) {
    return value != null;
  };
}

function cleanString(value) {
  return value.replace(/\u2028/g, "");
}

function deepClone(source) {
  return JSON.parse(JSON.stringify(source));
}

function deepCompare() {
  for (let index = 0; index < arguments.length - 1; index++) {
    const currentObject = sortObject(index < 0 || arguments.length <= index ? undefined : arguments[index]);
    const nextObject = sortObject(index + 1 < 0 || arguments.length <= index + 1 ? undefined : arguments[index + 1]);
    const areObjectsHashesEqual = JSON.stringify(currentObject) === JSON.stringify(nextObject);
    if (!areObjectsHashesEqual) {
      return false;
    }
  }
  return true;
}
function sortObject(value) {
  if (typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return [...value].sort();
  }
  if (value === null) {
    return null;
  }
  const sortedObject = {};
  const objectKeys = Object.keys(value).sort();
  objectKeys.forEach(key => {
    sortedObject[key] = sortObject(value[key]);
  });
  return sortedObject;
}

function dotNotationGet(obj, path) {
  if (path === "") {
    return obj;
  }
  return path.split(".").reduce((acc, curVal) => acc && acc[curVal], obj);
}

function dotNotationSet(obj, path, value) {
  if (path === "") {
    throw new Error("Path can't be empty in dotNotationSetter");
  }
  if (typeof obj !== "object" || obj === null) {
    throw new Error("dotNotationSet - you're trying to set value for non-object");
  }
  const splitPath = typeof path === "string" ? path.split(".").map(x => {
    if (typeof x === "string" && !isNaN(parseInt(x))) {
      return parseInt(x);
    }
    return x;
  }) : path;
  if (splitPath.length === 1) {
    obj[splitPath[0]] = value;
  } else {
    if (!obj[splitPath[0]]) {
      if (typeof splitPath[1] === "number") {
        obj[splitPath[0]] = [];
      } else {
        obj[splitPath[0]] = {};
      }
    }
    dotNotationSet(obj[splitPath[0]], splitPath.slice(1), value);
  }
}

/**
 * `Object.entries` is badly typed for its reasons and this function just fixes it.
 * https://stackoverflow.com/questions/55012174/why-doesnt-object-keys-return-a-keyof-type-in-typescript
 */
function entries(o) {
  return Object.entries(o);
}

function serialize(value) {
  if (value instanceof Error) {
    return JSON.parse(JSON.stringify(value, Object.getOwnPropertyNames(value)));
  }
  return JSON.parse(JSON.stringify(value));
}

function uniqueId() {
  const id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0,
      v = c == "x" ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
  return id;
}

function assertDefined(value, message) {
  if (value === undefined) {
    throw new Error(message ?? "Value is undefined");
  }
  return value;
}

function raiseError(errorMessage) {
  throw new Error(errorMessage);
}

function responsiveValueEntries(value) {
  const values = [];
  entries(value).forEach(_ref => {
    let [key, v] = _ref;
    if (key === "$res") return;
    values.push([key, v]);
  });
  return values;
}

function responsiveValueMap(resVal, mapper) {
  if (!isTrulyResponsiveValue$1(resVal)) {
    return mapper(resVal);
  }
  const ret = {
    $res: true
  };
  responsiveValueEntries(resVal).forEach(_ref => {
    let [key, value] = _ref;
    ret[key] = mapper(value, key);
  });
  return ret;
}

function getDevicesWidths(devices) {
  const widths = {
    $res: true
  };
  devices.forEach(device => {
    widths[device.id] = device.w;
  });
  return widths;
}
const DEFAULT_DEVICES = [
// de facto all vertical phones have max 414px
// de facto all horizontal phones start with 620px (end with ~900, almost all below 915) -> vertical tablet resolutions
// most people don't use horizontal phones anyway
// no one uses such tiny resolutions on other devices
// we obviously need phone resolution
// we introduce "pro forma" resolution (568 - 767px) which is "some horizontal phones". It's here mostly because there is such resolution in bootstrap, tailwind etc.
// personally I think we could have one resolution that covers all horizontal phones and tablets (620 - 996). But it would break naming that is "commonly understood" by devs (xs phone, sm horizontal phone, md tablet). sm is mostly dead, should be covered by md
{
  id: "xs",
  w: 375,
  h: 667,
  breakpoint: 568,
  label: "Mobile"
}, {
  id: "sm",
  w: 667,
  h: 375,
  breakpoint: 768,
  label: "Mobile SM h",
  hidden: true
}, {
  id: "md",
  w: 768,
  h: 1024,
  breakpoint: 992,
  label: "Tablet"
}, {
  id: "lg",
  w: 1024,
  h: 768,
  breakpoint: 1280,
  label: "TabletH",
  hidden: true
}, {
  id: "xl",
  w: 1366,
  h: 768,
  breakpoint: 1600,
  label: "Desktop",
  isMain: true
}, {
  id: "2xl",
  w: 1920,
  h: 920,
  label: "Large desktop",
  breakpoint: null
  // hidden: true,
}];

function responsiveValueGetHighestDefinedDevice(input, devices) {
  let highestDefinedDevice;
  for (let i = devices.length - 1; i >= 0; i--) {
    const device = devices[i];
    if (input[device.id] !== undefined) {
      highestDefinedDevice = device;
      break;
    }
  }
  if (highestDefinedDevice === undefined) {
    throw new Error("highest defined value doesn't exist");
  }
  return highestDefinedDevice;
}

// Flattens recursively (max 2 levels)
function responsiveValueFlatten(resVal, devices) {
  if (!isTrulyResponsiveValue$1(resVal)) {
    return resVal;
  }
  const result = {
    $res: true
  };
  let activeNestedValue = undefined;

  // resValCopy has maximum breakpoint always set correctly, otherwise if we have b1, ..., b5 and responsive value is set to b4, then values ABOVE b4 won't be set.
  const resValCopy = {
    ...resVal
  };
  const maxDeviceInValue = responsiveValueGetHighestDefinedDevice(resValCopy, devices);
  const maxBreakpoint = devices[devices.length - 1].id;

  // Important condition. Sometimes if b5 is missing, b3 can be responsive and have b5 inside. Then b5 is defined.
  if (!resValCopy[maxBreakpoint] && isTrulyResponsiveValue$1(resValCopy[maxDeviceInValue.id])) {
    activeNestedValue = resValCopy[maxDeviceInValue.id];
  }
  for (let i = devices.length - 1; i >= 0; i--) {
    const breakpoint = devices[i].id;
    const value = resValCopy[breakpoint];
    if (value === undefined) {
      // If active nested value, we take from nested value;
      if (activeNestedValue !== undefined && activeNestedValue[breakpoint] !== undefined) {
        result[breakpoint] = responsiveValueGetDefinedValue(activeNestedValue, breakpoint, devices, getDevicesWidths(devices) /** FOR NOW TOKENS ARE ALWAYS RELATIVE TO SCREEN WIDTH */);
      }
      continue;
    } else if (!isTrulyResponsiveValue$1(value)) {
      activeNestedValue = undefined;
      result[breakpoint] = value;
    } else {
      activeNestedValue = value;
      result[breakpoint] = responsiveValueGetDefinedValue(activeNestedValue, breakpoint, devices, getDevicesWidths(devices) /** FOR NOW TOKENS ARE ALWAYS RELATIVE TO SCREEN WIDTH */);
    }
  }
  return result;
}

/**
 * Because of how `TrulyResponsiveValue` is typed, if we try to access value at the current breakpoint it would return `true | T | undefined`.
 * The literal type `true` in this type shouldn't be included, because it makes no sense.
 * This comes from definition of `$res` property which is a special property that marks given object as responsive value instead of normal object.
 */
function responsiveValueAt(responsiveValue, breakpointIndex) {
  if (breakpointIndex === "$res") {
    throw new Error("This situation isn't possible! Value of responsive value must be accessed by valid breakpoint name");
  }
  const breakpointValue = responsiveValue[breakpointIndex];
  return breakpointValue;
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

function responsiveValueReduce(resVal, reducer, initialValue, devices) {
  if (!isTrulyResponsiveValue$1(resVal)) {
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

function responsiveValueNormalize$1(arg, devices) {
  if (!isTrulyResponsiveValue$1(arg)) {
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

function getExternalValue(externalDataValue) {
  if ("error" in externalDataValue) {
    return;
  }
  return externalDataValue.value;
}
function isLocalTextReference(resource, type) {
  if (resource.id === null) {
    return false;
  }
  return type === "text" && resource.id.startsWith("local.");
}
function getExternalReferenceLocationKey(configId, fieldName, deviceId) {
  let resourceId = `${configId}.${fieldName}`;
  if (deviceId) {
    resourceId += `.${deviceId}`;
  }
  return resourceId;
}
function getResolvedExternalDataValue(externalData, configId, fieldName, value) {
  const externalReferenceLocationKey = typeof value.id === "string" && value.id.startsWith("$.") ? value.id : getExternalReferenceLocationKey(configId, fieldName);
  const externalValue = externalData[externalReferenceLocationKey];
  if (externalValue === undefined || "error" in externalValue) {
    return;
  }
  return externalValue;
}
function resolveExternalValue(responsiveResource, configId, schemaProp, externalData) {
  return responsiveValueMap(responsiveResource, (r, breakpointIndex) => {
    if (r.id) {
      // If resource field has `key` defined and its `id` starts with "$.", it means that it's a reference to the
      // root resource and we need to look for the resource with the same id as the root resource.
      const locationKey = r.key && typeof r.id === "string" && r.id.startsWith("$.") ? r.id : getExternalReferenceLocationKey(configId, schemaProp.prop, breakpointIndex);
      const externalDataValue = externalData[locationKey];
      let resourceValue;
      if (externalDataValue) {
        resourceValue = getExternalValue(externalDataValue);
      }
      if (externalDataValue === undefined || isEmptyRenderableContent(resourceValue)) {
        return;
      }
      if ("error" in externalDataValue) {
        return;
      }
      if (isCompoundExternalDataValue(externalDataValue)) {
        if (!r.key) {
          return;
        }
        const resolvedResourceValue = externalDataValue.value[r.key].value;
        if (!resolvedResourceValue) {
          return;
        }
        return resolvedResourceValue;
      }
      return resourceValue;
    }
    return;
  });
}
function isCompoundExternalDataValue(value) {
  return "type" in value && value.type === "object" && "value" in value || "error" in value;
}

class CompilationCache {
  constructor(initialEntries) {
    this.cache = initialEntries ? new Map(initialEntries) : new Map();
  }
  get(key) {
    return this.cache.get(key);
  }
  set(key, entry) {
    this.cache.set(key, entry);
  }
  get count() {
    return this.cache.size;
  }
  remove(path) {
    this.cache.delete(path);
  }
  clear() {
    this.cache.clear();
  }
}

function getDefaultLocale(locales) {
  const defaultLocale = locales.find(locale => locale.isDefault);
  if (!defaultLocale) {
    throw new Error("No default locale found");
  }
  return defaultLocale;
}
function getFallbackLocaleForLocale(locale, locales) {
  do {
    const fallbackId = locales.find(l => l.code === locale)?.fallback ?? getDefaultLocale(locales).code;

    // Default locale, no fallback
    if (fallbackId === locale) {
      return;
    }
    return fallbackId;
  } while (true);
}
function getFallbackForLocale(translatedValues, locale, locales) {
  while (true) {
    const fallbackLocale = getFallbackLocaleForLocale(locale, locales);
    if (!fallbackLocale) {
      return;
    }
    const fallbackValue = translatedValues[fallbackLocale];
    if (fallbackValue !== undefined && fallbackValue !== null) {
      return fallbackValue;
    }
    locale = fallbackLocale;
  }
}

function buildRichTextNoCodeEntry(options) {
  const {
    accessibilityRole,
    font,
    color,
    text,
    locale = "en"
  } = options ?? {};
  const colorTokenValue = {
    value: "#000000",
    widgetId: "@easyblocks/color"
  };
  if (color) {
    colorTokenValue.tokenId = color;
  }
  const fontTokenValue = {
    value: {
      fontFamily: "sans-serif",
      fontSize: "16px"
    }
  };
  if (font) {
    fontTokenValue.tokenId = font;
  }
  return {
    _id: uniqueId(),
    _component: "@easyblocks/rich-text",
    accessibilityRole: accessibilityRole ?? "div",
    elements: {
      [locale ?? "en"]: [buildRichTextBlockElementComponentConfig("paragraph", [buildRichTextLineElementComponentConfig({
        elements: [buildRichTextPartComponentConfig({
          color: colorTokenValue,
          font: fontTokenValue,
          value: text ?? "Lorem ipsum",
          TextWrapper: []
        })]
      })])]
    },
    isListStyleAuto: true,
    mainColor: colorTokenValue,
    mainFont: fontTokenValue
  };
}
function buildRichTextComponentConfig(_ref) {
  let {
    accessibilityRole,
    locale,
    elements,
    isListStyleAuto,
    mainColor,
    mainFont
  } = _ref;
  return {
    _id: uniqueId(),
    _component: "@easyblocks/rich-text",
    accessibilityRole: accessibilityRole ?? "div",
    elements: {
      [locale]: elements
    },
    isListStyleAuto: isListStyleAuto ?? true,
    mainColor,
    mainFont
  };
}
function buildRichTextBlockElementComponentConfig(type, elements) {
  return {
    _component: "@easyblocks/rich-text-block-element",
    elements,
    type,
    _id: uniqueId()
  };
}
function buildRichTextParagraphBlockElementComponentConfig(_ref2) {
  let {
    elements
  } = _ref2;
  return {
    _component: "@easyblocks/rich-text-block-element",
    elements,
    type: "paragraph",
    _id: uniqueId()
  };
}
function buildRichTextBulletedListBlockElementComponentConfig(_ref3) {
  let {
    elements
  } = _ref3;
  return {
    _component: "@easyblocks/rich-text-block-element",
    elements,
    type: "bulleted-list",
    _id: uniqueId()
  };
}
function buildRichTextLineElementComponentConfig(_ref4) {
  let {
    elements
  } = _ref4;
  return {
    _component: "@easyblocks/rich-text-line-element",
    elements,
    _id: uniqueId()
  };
}
function buildRichTextPartComponentConfig(_ref5) {
  let {
    color,
    font,
    value,
    id,
    TextWrapper
  } = _ref5;
  return {
    _id: id ?? uniqueId(),
    _component: "@easyblocks/rich-text-part",
    color,
    font,
    value,
    TextWrapper: TextWrapper ?? []
  };
}

function applyAutoUsingResponsiveTokens(input, compilationContext) {
  if (!isTrulyResponsiveValue$1(input)) {
    return input;
  }
  const highestDefinedDevice = responsiveValueGetHighestDefinedDevice(input, compilationContext.devices);
  let highestDefinedValue = responsiveValueForceGet$1(input, highestDefinedDevice.id);
  const inputAfterAuto = {
    $res: true
  };
  for (let i = compilationContext.devices.length - 1; i >= 0; i--) {
    const device = compilationContext.devices[i];
    const value = responsiveValueGet(input, device.id);
    if (value === undefined && isTrulyResponsiveValue$1(highestDefinedValue.value)) {
      inputAfterAuto[device.id] = highestDefinedValue;
    }
    if (value !== undefined) {
      inputAfterAuto[device.id] = value;
      highestDefinedValue = input[device.id];
    }
  }
  return inputAfterAuto;
}

/**
 * This function is necessary because if we have Stitches styles object, its breakpoint values should be only on the top level.
 * We can have them nested so we need to transform styles object so that responsive styles goes to the top level.
 */

function flattenResponsiveStyles(styles) {
  const result = {};
  for (const key in styles) {
    const value = styles[key];
    if (key.startsWith("@")) {
      if (!result[key]) {
        result[key] = {};
      }
      result[key] = {
        ...result[key],
        ...value
      };
      continue;
    }
    if (typeof value === "object" && value !== null) {
      const flattenedValue = flattenResponsiveStyles(value);

      // MERGE

      const nonResponsiveValues = {};
      const responsiveValues = {};
      for (const key2 in flattenedValue) {
        const value2 = flattenedValue[key2];
        if (key2.startsWith("@")) {
          responsiveValues[key2] = value2;
        } else {
          nonResponsiveValues[key2] = value2;
        }
      }
      result[key] = nonResponsiveValues;
      for (const breakpoint in responsiveValues) {
        if (!result[breakpoint]) {
          result[breakpoint] = {};
        }
        result[breakpoint] = {
          ...result[breakpoint],
          [key]: responsiveValues[breakpoint]
        };
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

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

function compileFromSchema(value, schemaProp, compilationContext, cache, contextProps, meta, editingInfoComponent, configPrefix) {
  return getSchemaDefinition(schemaProp, compilationContext).compile(value, contextProps, meta, editingInfoComponent, configPrefix, cache);
}

function isSchemaPropComponentCollectionLocalised(schemaProp) {
  return schemaProp.type === "component-collection-localised";
}
function isSchemaPropCollection(schemaProp) {
  return schemaProp.type === "component-collection" || schemaProp.type === "component-collection-localised";
}
function isSchemaPropComponent(schemaProp) {
  return schemaProp.type === "component";
}
function isSchemaPropComponentOrComponentCollection(schemaProp) {
  return isSchemaPropCollection(schemaProp) || isSchemaPropComponent(schemaProp);
}
function isSchemaPropActionTextModifier(schemaProp) {
  return schemaProp.type === "component" && schemaProp.accepts.includes("actionTextModifier");
}
function isSchemaPropTextModifier(schemaProp) {
  return schemaProp.type === "component" && schemaProp.accepts.includes("textModifier");
}
const internalTypes = new Set(["string", "number", "boolean", "select", "radio-group", "color", "space", "font", "icon", "text", "component", "component-collection", "position", "component$$$", "component-collection-localised", "aspectRatio", "containerWidth", "boxShadow"]);
function isCustomSchemaProp(schemaProp) {
  return !internalTypes.has(schemaProp.type);
}
function isExternalSchemaProp(schemaProp, types) {
  return types[schemaProp.type] && types[schemaProp.type].type === "external";
}
function textModifierSchemaProp(options) {
  return {
    type: "component",
    accepts: ["textModifier"],
    // Schema props of type "component" are hidden by default
    visible: true,
    ...options
  };
}

/**
 * This compilation function doesn't take schema. It means that it assumes couple of things:
 * 1. That input is NoCodeComponentEntry or 1-item array of. NoCodeComponentEntry. Basically it's a single component.
 * 2. Return format
 */
function compileComponentValues(inputValues, componentDefinition, compilationContext, cache) {
  const values = {};
  componentDefinition.schema.forEach(schemaProp => {
    if (!isSchemaPropComponentOrComponentCollection(schemaProp)) {
      values[schemaProp.prop] = compileFromSchema(inputValues[schemaProp.prop], schemaProp, compilationContext, cache);
    }
  });
  return values;
}

function allDefs(context) {
  return context?.definitions.components || [];
}

/**
 * Versions with context and custom components sweep
 */

function findComponentDefinition(config, context) {
  return $findComponentDefinition(config, context);
}
function findComponentDefinitionById(id, context) {
  return $findComponentDefinitionById(id, context);
}
function findComponentDefinitionsByType(tag, context) {
  return allDefs(context).filter(def => toArray(def.type ?? []).includes(tag));
}

/**
 * Generic
 */

function $findComponentDefinition(config, context) {
  if (!config) {
    return undefined;
  }
  return $findComponentDefinitionById(config._component, context);
}
function $findComponentDefinitionById(id, context) {
  return allDefs(context).find(component => component.id === id);
}

/**
 * When selecting text within $richText, we keep information about which text parts are selected
 * within focused fields. If the text part is partially selected, we add information about the selection.
 * This selection has format: ".{textPartCharacterSelectionStartIndex,textPartCharacterSelectionEndIndex}".
 * We often want to query related to selection text part component config and to do that correctly we need to
 * strip information about selection.
 */
function stripRichTextPartSelection(value) {
  return value.replace(/\.\{\d+,\d+\}$/g, "");
}
function parsePath(path, form) {
  const values = form.values;
  const pathSplit = path === "" ? [] : stripRichTextPartSelection(path).split(".");
  let pathInfo = undefined;

  // We're going from current path down the path to find current template and parent template
  for (let i = pathSplit.length; i >= 0; i--) {
    const testedPath = pathSplit.slice(0, i).join(".");
    const value = dotNotationGet(values, testedPath);
    if (typeof value === "object" && typeof value._component === "string") {
      if (pathInfo === undefined) {
        pathInfo = {
          templateId: value._component
        };

        // fieldName
        const fieldPath = pathSplit.slice(i);
        if (fieldPath.length > 0) {
          pathInfo.fieldName = fieldPath.join(".");
        }
        const potentialIndex = parseInt(pathSplit[i - 1]);
        if (!isNaN(potentialIndex)) {
          pathInfo.index = potentialIndex;
        }
      } else {
        pathInfo.parent = {
          templateId: value._component,
          fieldName: pathSplit[i],
          path: testedPath
        };
        break;
      }
    }
  }
  if (!pathInfo) {
    throw new Error(`incorrect path: ${path}`);
  }
  return pathInfo;
}
function findPathOfFirstAncestorOfType(path, templateId, form) {
  while (true) {
    const parseResult = parsePath(path, form);
    if (!parseResult.parent) {
      throw new Error(`couldn't find ancestor of type ${templateId}`);
    }
    if (parseResult.parent.templateId === templateId) {
      return parseResult.parent.path;
    }
    path = parseResult.parent.path;
  }
}

const DEFAULT_FONT_VALUES = {
  fontWeight: "initial",
  fontStyle: "initial"
};
function richTextPartStyles(_ref) {
  let {
    values: {
      color,
      font,
      TextWrapper
    },
    isEditing
  } = _ref;
  const fontWithDefaults = {
    ...DEFAULT_FONT_VALUES,
    ...font
  };
  const hasTextWrapper = TextWrapper.length > 0;
  const textStyles = {
    __as: "span",
    color,
    ...fontWithDefaults
  };
  if (hasTextWrapper && !isEditing) {
    // Force pointer events to be enabled on the text when text wrapper is attached and we're not editing
    textStyles.pointerEvents = "auto";
  }
  if (isEditing) {
    // When editing, we're going to have nested spans rendered by Slate so we need to make sure they inherit the font
    // styles defined on Text component
    textStyles['& [data-slate-string="true"]'] = {
      fontFamily: "inherit",
      fontStyle: "inherit",
      color: "inherit"
    };
  }
  return {
    styled: {
      Text: textStyles
    }
  };
}

const editing$1 = _ref => {
  let {
    editingInfo,
    __SECRET_INTERNALS__
  } = _ref;
  if (!__SECRET_INTERNALS__) {
    throw new Error("Missing __SECRET_INTERNALS__");
  }
  const {
    pathPrefix,
    editorContext
  } = __SECRET_INTERNALS__;
  const resultFields = [];
  const richTextPath = findPathOfFirstAncestorOfType(pathPrefix, "@easyblocks/rich-text", editorContext.form);
  const richTextBlockPath = findPathOfFirstAncestorOfType(pathPrefix, "@easyblocks/rich-text-block-element", editorContext.form);
  resultFields.push({
    type: "fields",
    path: richTextPath,
    filters: {
      group: ["Size", "Margins"]
    }
  }, {
    type: "field",
    path: `${richTextPath}.align`
  }, ...editingInfo.fields, {
    type: "field",
    path: `${richTextBlockPath}.type`
  }, {
    type: "field",
    path: `${richTextPath}.isListStyleAuto`
  }, {
    type: "field",
    path: `${richTextPath}.mainFont`
  }, {
    type: "field",
    path: `${richTextPath}.mainColor`
  }, {
    type: "fields",
    path: richTextPath,
    filters: {
      group: ["Accessibility and SEO"]
    }
  });
  return {
    fields: resultFields
  };
};
const richTextPartEditableComponent = {
  id: "@easyblocks/rich-text-part",
  label: "Text",
  schema: [{
    prop: "value",
    type: "string",
    visible: false,
    group: "Text"
  }, {
    prop: "font",
    label: "Style",
    type: "font",
    group: "Text"
  }, {
    prop: "color",
    label: "Color",
    type: "color",
    group: "Text"
  }, {
    prop: "TextWrapper",
    label: "Text Wrapper",
    type: "component",
    noInline: true,
    accepts: ["@easyblocks/text-wrapper"],
    visible: true,
    group: "Text Wrapper",
    isLabelHidden: true
  }],
  editing: editing$1,
  styles: richTextPartStyles
};

/**
 * Returns the most common value for given `prop` parameter among all @easyblocks/rich-text-part components from `richTextComponentConfig`.
 */
function getMostCommonValueFromRichTextParts(richTextComponentConfig, prop, compilationContext, cache) {
  const richTextBlockElements = richTextComponentConfig.elements[compilationContext.contextParams.locale] ?? getFallbackForLocale(richTextComponentConfig.elements, compilationContext.contextParams.locale, compilationContext.locales);
  if (!richTextBlockElements) {
    return;
  }
  const richTextParts = richTextBlockElements.flatMap(blockElement => {
    return blockElement.elements.flatMap(lineElement => {
      return lineElement.elements;
    });
  });
  const richTextPartComponentDefinition = findComponentDefinitionById(richTextPartEditableComponent.id, compilationContext);
  const deviceIdToRichTextPartValuesGroupedByPropValue = Object.fromEntries(compilationContext.devices.map(device => {
    const richTextPartsCompiledPropValues = richTextParts.flatMap(richTextPart => {
      return mapRichTextPartToCompiledPropValue(richTextPart, richTextPartComponentDefinition, compilationContext, prop, cache);
    });
    const richTextPartValuesLengthGroupedByPropValue = richTextPartsCompiledPropValues.reduce((acc, current) => groupTotalValueLengthByCompiledPropValue(prop, device)(acc, current), {});
    return [device.id, richTextPartValuesLengthGroupedByPropValue];
  }).filter(entry => Object.keys(entry[1]).length > 0).map(entry => {
    return [entry[0], getCompiledValueFromEntryWithMaxTotalValueLength(entry)];
  }));
  if (Object.keys(deviceIdToRichTextPartValuesGroupedByPropValue).length === 0) {
    return;
  }
  return {
    $res: true,
    ...deviceIdToRichTextPartValuesGroupedByPropValue
  };
}
function getCompiledValueFromEntryWithMaxTotalValueLength(entry) {
  const compiledPropValue = entries(entry[1]).reduce((maxEntry, currentEntry) => currentEntry[1] > maxEntry[1] ? currentEntry : maxEntry)[0];
  try {
    return JSON.parse(compiledPropValue);
  } catch {
    return compiledPropValue;
  }
}
function groupTotalValueLengthByCompiledPropValue(prop, device) {
  return (acc, current) => {
    const key = JSON.stringify(current[prop][device.id]);
    if (key === undefined) {
      return acc;
    }
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += current.value.length;
    return acc;
  };
}
function mapRichTextPartToCompiledPropValue(richTextPart, richTextPartComponentDefinition, compilationContext, prop, cache) {
  const compiledValues = compileComponentValues(richTextPart, richTextPartComponentDefinition, compilationContext, cache);
  return {
    value: richTextPart.value,
    [prop]: compiledValues[prop]
  };
}

/* parser generated by jison 0.6.1-215 */

/*
 * Returns a Parser object of the following structure:
 *
 *  Parser: {
 *    yy: {}     The so-called "shared state" or rather the *source* of it;
 *               the real "shared state" `yy` passed around to
 *               the rule actions, etc. is a derivative/copy of this one,
 *               not a direct reference!
 *  }
 *
 *  Parser.prototype: {
 *    yy: {},
 *    EOF: 1,
 *    TERROR: 2,
 *
 *    trace: function(errorMessage, ...),
 *
 *    JisonParserError: function(msg, hash),
 *
 *    quoteName: function(name),
 *               Helper function which can be overridden by user code later on: put suitable
 *               quotes around literal IDs in a description string.
 *
 *    originalQuoteName: function(name),
 *               The basic quoteName handler provided by JISON.
 *               `cleanupAfterParse()` will clean up and reset `quoteName()` to reference this function
 *               at the end of the `parse()`.
 *
 *    describeSymbol: function(symbol),
 *               Return a more-or-less human-readable description of the given symbol, when
 *               available, or the symbol itself, serving as its own 'description' for lack
 *               of something better to serve up.
 *
 *               Return NULL when the symbol is unknown to the parser.
 *
 *    symbols_: {associative list: name ==> number},
 *    terminals_: {associative list: number ==> name},
 *    nonterminals: {associative list: rule-name ==> {associative list: number ==> rule-alt}},
 *    terminal_descriptions_: (if there are any) {associative list: number ==> description},
 *    productions_: [...],
 *
 *    performAction: function parser__performAction(yytext, yyleng, yylineno, yyloc, yystate, yysp, yyvstack, yylstack, yystack, yysstack),
 *
 *               The function parameters and `this` have the following value/meaning:
 *               - `this`    : reference to the `yyval` internal object, which has members (`$` and `_$`)
 *                             to store/reference the rule value `$$` and location info `@$`.
 *
 *                 One important thing to note about `this` a.k.a. `yyval`: every *reduce* action gets
 *                 to see the same object via the `this` reference, i.e. if you wish to carry custom
 *                 data from one reduce action through to the next within a single parse run, then you
 *                 may get nasty and use `yyval` a.k.a. `this` for storing you own semi-permanent data.
 *
 *                 `this.yy` is a direct reference to the `yy` shared state object.
 *
 *                 `%parse-param`-specified additional `parse()` arguments have been added to this `yy`
 *                 object at `parse()` start and are therefore available to the action code via the
 *                 same named `yy.xxxx` attributes (where `xxxx` represents a identifier name from
 *                 the %parse-param` list.
 *
 *               - `yytext`  : reference to the lexer value which belongs to the last lexer token used
 *                             to match this rule. This is *not* the look-ahead token, but the last token
 *                             that's actually part of this rule.
 *
 *                 Formulated another way, `yytext` is the value of the token immediately preceeding
 *                 the current look-ahead token.
 *                 Caveats apply for rules which don't require look-ahead, such as epsilon rules.
 *
 *               - `yyleng`  : ditto as `yytext`, only now for the lexer.yyleng value.
 *
 *               - `yylineno`: ditto as `yytext`, only now for the lexer.yylineno value.
 *
 *               - `yyloc`   : ditto as `yytext`, only now for the lexer.yylloc lexer token location info.
 *
 *                               WARNING: since jison 0.4.18-186 this entry may be NULL/UNDEFINED instead
 *                               of an empty object when no suitable location info can be provided.
 *
 *               - `yystate` : the current parser state number, used internally for dispatching and
 *                               executing the action code chunk matching the rule currently being reduced.
 *
 *               - `yysp`    : the current state stack position (a.k.a. 'stack pointer')
 *
 *                 This one comes in handy when you are going to do advanced things to the parser
 *                 stacks, all of which are accessible from your action code (see the next entries below).
 *
 *                 Also note that you can access this and other stack index values using the new double-hash
 *                 syntax, i.e. `##$ === ##0 === yysp`, while `##1` is the stack index for all things
 *                 related to the first rule term, just like you have `$1`, `@1` and `#1`.
 *                 This is made available to write very advanced grammar action rules, e.g. when you want
 *                 to investigate the parse state stack in your action code, which would, for example,
 *                 be relevant when you wish to implement error diagnostics and reporting schemes similar
 *                 to the work described here:
 *
 *                 + Pottier, F., 2016. Reachability and error diagnosis in LR(1) automata.
 *                   In Journées Francophones des Languages Applicatifs.
 *
 *                 + Jeffery, C.L., 2003. Generating LR syntax error messages from examples.
 *                   ACM Transactions on Programming Languages and Systems (TOPLAS), 25(5), pp.631–640.
 *
 *               - `yyrulelength`: the current rule's term count, i.e. the number of entries occupied on the stack.
 *
 *                 This one comes in handy when you are going to do advanced things to the parser
 *                 stacks, all of which are accessible from your action code (see the next entries below).
 *
 *               - `yyvstack`: reference to the parser value stack. Also accessed via the `$1` etc.
 *                             constructs.
 *
 *               - `yylstack`: reference to the parser token location stack. Also accessed via
 *                             the `@1` etc. constructs.
 *
 *                             WARNING: since jison 0.4.18-186 this array MAY contain slots which are
 *                             UNDEFINED rather than an empty (location) object, when the lexer/parser
 *                             action code did not provide a suitable location info object when such a
 *                             slot was filled!
 *
 *               - `yystack` : reference to the parser token id stack. Also accessed via the
 *                             `#1` etc. constructs.
 *
 *                 Note: this is a bit of a **white lie** as we can statically decode any `#n` reference to
 *                 its numeric token id value, hence that code wouldn't need the `yystack` but *you* might
 *                 want access this array for your own purposes, such as error analysis as mentioned above!
 *
 *                 Note that this stack stores the current stack of *tokens*, that is the sequence of
 *                 already parsed=reduced *nonterminals* (tokens representing rules) and *terminals*
 *                 (lexer tokens *shifted* onto the stack until the rule they belong to is found and
 *                 *reduced*.
 *
 *               - `yysstack`: reference to the parser state stack. This one carries the internal parser
 *                             *states* such as the one in `yystate`, which are used to represent
 *                             the parser state machine in the *parse table*. *Very* *internal* stuff,
 *                             what can I say? If you access this one, you're clearly doing wicked things
 *
 *               - `...`     : the extra arguments you specified in the `%parse-param` statement in your
 *                             grammar definition file.
 *
 *    table: [...],
 *               State transition table
 *               ----------------------
 *
 *               index levels are:
 *               - `state`  --> hash table
 *               - `symbol` --> action (number or array)
 *
 *                 If the `action` is an array, these are the elements' meaning:
 *                 - index [0]: 1 = shift, 2 = reduce, 3 = accept
 *                 - index [1]: GOTO `state`
 *
 *                 If the `action` is a number, it is the GOTO `state`
 *
 *    defaultActions: {...},
 *
 *    parseError: function(str, hash, ExceptionClass),
 *    yyError: function(str, ...),
 *    yyRecovering: function(),
 *    yyErrOk: function(),
 *    yyClearIn: function(),
 *
 *    constructParseErrorInfo: function(error_message, exception_object, expected_token_set, is_recoverable),
 *               Helper function **which will be set up during the first invocation of the `parse()` method**.
 *               Produces a new errorInfo 'hash object' which can be passed into `parseError()`.
 *               See it's use in this parser kernel in many places; example usage:
 *
 *                   var infoObj = parser.constructParseErrorInfo('fail!', null,
 *                                     parser.collect_expected_token_set(state), true);
 *                   var retVal = parser.parseError(infoObj.errStr, infoObj, parser.JisonParserError);
 *
 *    originalParseError: function(str, hash, ExceptionClass),
 *               The basic `parseError` handler provided by JISON.
 *               `cleanupAfterParse()` will clean up and reset `parseError()` to reference this function
 *               at the end of the `parse()`.
 *
 *    options: { ... parser %options ... },
 *
 *    parse: function(input[, args...]),
 *               Parse the given `input` and return the parsed value (or `true` when none was provided by
 *               the root action, in which case the parser is acting as a *matcher*).
 *               You MAY use the additional `args...` parameters as per `%parse-param` spec of this grammar:
 *               these extra `args...` are added verbatim to the `yy` object reference as member variables.
 *
 *               WARNING:
 *               Parser's additional `args...` parameters (via `%parse-param`) MAY conflict with
 *               any attributes already added to `yy` by the jison run-time;
 *               when such a collision is detected an exception is thrown to prevent the generated run-time
 *               from silently accepting this confusing and potentially hazardous situation!
 *
 *               The lexer MAY add its own set of additional parameters (via the `%parse-param` line in
 *               the lexer section of the grammar spec): these will be inserted in the `yy` shared state
 *               object and any collision with those will be reported by the lexer via a thrown exception.
 *
 *    cleanupAfterParse: function(resultValue, invoke_post_methods, do_not_nuke_errorinfos),
 *               Helper function **which will be set up during the first invocation of the `parse()` method**.
 *               This helper API is invoked at the end of the `parse()` call, unless an exception was thrown
 *               and `%options no-try-catch` has been defined for this grammar: in that case this helper MAY
 *               be invoked by calling user code to ensure the `post_parse` callbacks are invoked and
 *               the internal parser gets properly garbage collected under these particular circumstances.
 *
 *    yyMergeLocationInfo: function(first_index, last_index, first_yylloc, last_yylloc, dont_look_back),
 *               Helper function **which will be set up during the first invocation of the `parse()` method**.
 *               This helper API can be invoked to calculate a spanning `yylloc` location info object.
 *
 *               Note: %epsilon rules MAY specify no `first_index` and `first_yylloc`, in which case
 *               this function will attempt to obtain a suitable location marker by inspecting the location stack
 *               backwards.
 *
 *               For more info see the documentation comment further below, immediately above this function's
 *               implementation.
 *
 *    lexer: {
 *        yy: {...},           A reference to the so-called "shared state" `yy` once
 *                             received via a call to the `.setInput(input, yy)` lexer API.
 *        EOF: 1,
 *        ERROR: 2,
 *        JisonLexerError: function(msg, hash),
 *        parseError: function(str, hash, ExceptionClass),
 *        setInput: function(input, [yy]),
 *        input: function(),
 *        unput: function(str),
 *        more: function(),
 *        reject: function(),
 *        less: function(n),
 *        pastInput: function(n),
 *        upcomingInput: function(n),
 *        showPosition: function(),
 *        test_match: function(regex_match_array, rule_index, ...),
 *        next: function(...),
 *        lex: function(...),
 *        begin: function(condition),
 *        pushState: function(condition),
 *        popState: function(),
 *        topState: function(),
 *        _currentRules: function(),
 *        stateStackSize: function(),
 *        cleanupAfterLex: function()
 *
 *        options: { ... lexer %options ... },
 *
 *        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START, ...),
 *        rules: [...],
 *        conditions: {associative list: name ==> set},
 *    }
 *  }
 *
 *
 *  token location info (@$, _$, etc.): {
 *    first_line: n,
 *    last_line: n,
 *    first_column: n,
 *    last_column: n,
 *    range: [start_number, end_number]
 *               (where the numbers are indexes into the input string, zero-based)
 *  }
 *
 * ---
 *
 * The `parseError` function receives a 'hash' object with these members for lexer and
 * parser errors:
 *
 *  {
 *    text:        (matched text)
 *    token:       (the produced terminal token, if any)
 *    token_id:    (the produced terminal token numeric ID, if any)
 *    line:        (yylineno)
 *    loc:         (yylloc)
 *  }
 *
 * parser (grammar) errors will also provide these additional members:
 *
 *  {
 *    expected:    (array describing the set of expected tokens;
 *                  may be UNDEFINED when we cannot easily produce such a set)
 *    state:       (integer (or array when the table includes grammar collisions);
 *                  represents the current internal state of the parser kernel.
 *                  can, for example, be used to pass to the `collect_expected_token_set()`
 *                  API to obtain the expected token set)
 *    action:      (integer; represents the current internal action which will be executed)
 *    new_state:   (integer; represents the next/planned internal state, once the current
 *                  action has executed)
 *    recoverable: (boolean: TRUE when the parser MAY have an error recovery rule
 *                  available for this particular error)
 *    state_stack: (array: the current parser LALR/LR internal state stack; this can be used,
 *                  for instance, for advanced error analysis and reporting)
 *    value_stack: (array: the current parser LALR/LR internal `$$` value stack; this can be used,
 *                  for instance, for advanced error analysis and reporting)
 *    location_stack: (array: the current parser LALR/LR internal location stack; this can be used,
 *                  for instance, for advanced error analysis and reporting)
 *    yy:          (object: the current parser internal "shared state" `yy`
 *                  as is also available in the rule actions; this can be used,
 *                  for instance, for advanced error analysis and reporting)
 *    lexer:       (reference to the current lexer instance used by the parser)
 *    parser:      (reference to the current parser instance)
 *  }
 *
 * while `this` will reference the current parser instance.
 *
 * When `parseError` is invoked by the lexer, `this` will still reference the related *parser*
 * instance, while these additional `hash` fields will also be provided:
 *
 *  {
 *    lexer:       (reference to the current lexer instance which reported the error)
 *  }
 *
 * When `parseError` is invoked by the parser due to a **JavaScript exception** being fired
 * from either the parser or lexer, `this` will still reference the related *parser*
 * instance, while these additional `hash` fields will also be provided:
 *
 *  {
 *    exception:   (reference to the exception thrown)
 *  }
 *
 * Please do note that in the latter situation, the `expected` field will be omitted as
 * this type of failure is assumed not to be due to *parse errors* but rather due to user
 * action code in either parser or lexer failing unexpectedly.
 *
 * ---
 *
 * You can specify parser options by setting / modifying the `.yy` object of your Parser instance.
 * These options are available:
 *
 * ### options which are global for all parser instances
 *
 *  Parser.pre_parse: function(yy)
 *                 optional: you can specify a pre_parse() function in the chunk following
 *                 the grammar, i.e. after the last `%%`.
 *  Parser.post_parse: function(yy, retval, parseInfo) { return retval; }
 *                 optional: you can specify a post_parse() function in the chunk following
 *                 the grammar, i.e. after the last `%%`. When it does not return any value,
 *                 the parser will return the original `retval`.
 *
 * ### options which can be set up per parser instance
 *
 *  yy: {
 *      pre_parse:  function(yy)
 *                 optional: is invoked before the parse cycle starts (and before the first
 *                 invocation of `lex()`) but immediately after the invocation of
 *                 `parser.pre_parse()`).
 *      post_parse: function(yy, retval, parseInfo) { return retval; }
 *                 optional: is invoked when the parse terminates due to success ('accept')
 *                 or failure (even when exceptions are thrown).
 *                 `retval` contains the return value to be produced by `Parser.parse()`;
 *                 this function can override the return value by returning another.
 *                 When it does not return any value, the parser will return the original
 *                 `retval`.
 *                 This function is invoked immediately before `parser.post_parse()`.
 *
 *      parseError: function(str, hash, ExceptionClass)
 *                 optional: overrides the default `parseError` function.
 *      quoteName: function(name),
 *                 optional: overrides the default `quoteName` function.
 *  }
 *
 *  parser.lexer.options: {
 *      pre_lex:  function()
 *                 optional: is invoked before the lexer is invoked to produce another token.
 *                 `this` refers to the Lexer object.
 *      post_lex: function(token) { return token; }
 *                 optional: is invoked when the lexer has produced a token `token`;
 *                 this function can override the returned token value by returning another.
 *                 When it does not return any (truthy) value, the lexer will return
 *                 the original `token`.
 *                 `this` refers to the Lexer object.
 *
 *      ranges: boolean
 *                 optional: `true` ==> token location info will include a .range[] member.
 *      flex: boolean
 *                 optional: `true` ==> flex-like lexing behaviour where the rules are tested
 *                 exhaustively to find the longest match.
 *      backtrack_lexer: boolean
 *                 optional: `true` ==> lexer regexes are tested in order and for invoked;
 *                 the lexer terminates the scan when a token is returned by the action code.
 *      xregexp: boolean
 *                 optional: `true` ==> lexer rule regexes are "extended regex format" requiring the
 *                 `XRegExp` library. When this `%option` has not been specified at compile time, all lexer
 *                 rule regexes have been written as standard JavaScript RegExp expressions.
 *  }
 */

/** @type {Parser} */
var parser = function () {
  // See also:
  // http://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript/#35881508
  // but we keep the prototype.constructor and prototype.name assignment lines too for compatibility
  // with userland code which might access the derived class in a 'classic' way.
  function JisonParserError(msg, hash) {
    Object.defineProperty(this, "name", {
      enumerable: false,
      writable: false,
      value: "JisonParserError"
    });
    if (msg == null) msg = "???";
    Object.defineProperty(this, "message", {
      enumerable: false,
      writable: true,
      value: msg
    });
    this.hash = hash;
    var stacktrace;
    if (hash && hash.exception instanceof Error) {
      var ex2 = hash.exception;
      this.message = ex2.message || msg;
      stacktrace = ex2.stack;
    }
    if (!stacktrace) {
      if (Error.hasOwnProperty("captureStackTrace")) {
        // V8/Chrome engine
        Error.captureStackTrace(this, this.constructor);
      } else {
        stacktrace = new Error(msg).stack;
      }
    }
    if (stacktrace) {
      Object.defineProperty(this, "stack", {
        enumerable: false,
        writable: false,
        value: stacktrace
      });
    }
  }
  if (typeof Object.setPrototypeOf === "function") {
    Object.setPrototypeOf(JisonParserError.prototype, Error.prototype);
  } else {
    JisonParserError.prototype = Object.create(Error.prototype);
  }
  JisonParserError.prototype.constructor = JisonParserError;
  JisonParserError.prototype.name = "JisonParserError";

  // helper: reconstruct the productions[] table
  function bp(s) {
    var rv = [];
    var p = s.pop;
    var r = s.rule;
    for (var i = 0, l = p.length; i < l; i++) {
      rv.push([p[i], r[i]]);
    }
    return rv;
  }

  // helper: reconstruct the defaultActions[] table
  function bda(s) {
    var rv = {};
    var d = s.idx;
    var g = s.goto;
    for (var i = 0, l = d.length; i < l; i++) {
      var j = d[i];
      rv[j] = g[i];
    }
    return rv;
  }

  // helper: reconstruct the 'goto' table
  function bt(s) {
    var rv = [];
    var d = s.len;
    var y = s.symbol;
    var t = s.type;
    var a = s.state;
    var m = s.mode;
    var g = s.goto;
    for (var i = 0, l = d.length; i < l; i++) {
      var n = d[i];
      var q = {};
      for (var j = 0; j < n; j++) {
        var z = y.shift();
        switch (t.shift()) {
          case 2:
            q[z] = [m.shift(), g.shift()];
            break;
          case 0:
            q[z] = a.shift();
            break;
          default:
            // type === 1: accept
            q[z] = [3];
        }
      }
      rv.push(q);
    }
    return rv;
  }

  // helper: runlength encoding with increment step: code, length: step (default step = 0)
  // `this` references an array
  function s(c, l, a) {
    a = a || 0;
    for (var i = 0; i < l; i++) {
      this.push(c);
      c += a;
    }
  }

  // helper: duplicate sequence from *relative* offset and length.
  // `this` references an array
  function c(i, l) {
    i = this.length - i;
    for (l += i; i < l; i++) {
      this.push(this[i]);
    }
  }

  // helper: unpack an array using helpers and data, all passed in an array argument 'a'.
  function u(a) {
    var rv = [];
    for (var i = 0, l = a.length; i < l; i++) {
      var e = a[i];
      // Is this entry a helper function?
      if (typeof e === "function") {
        i++;
        e.apply(rv, a[i]);
      } else {
        rv.push(e);
      }
    }
    return rv;
  }
  var parser = {
    // Code Generator Information Report
    // ---------------------------------
    //
    // Options:
    //
    //   default action mode: ............. ["classic","merge"]
    //   test-compile action mode: ........ "parser:*,lexer:*"
    //   try..catch: ...................... true
    //   default resolve on conflict: ..... true
    //   on-demand look-ahead: ............ false
    //   error recovery token skip maximum: 3
    //   yyerror in parse actions is: ..... NOT recoverable,
    //   yyerror in lexer actions and other non-fatal lexer are:
    //   .................................. NOT recoverable,
    //   debug grammar/output: ............ false
    //   has partial LR conflict upgrade:   true
    //   rudimentary token-stack support:   false
    //   parser table compression mode: ... 2
    //   export debug tables: ............. false
    //   export *all* tables: ............. false
    //   module type: ..................... commonjs
    //   parser engine type: .............. lalr
    //   output main() in the module: ..... true
    //   has user-specified main(): ....... false
    //   has user-specified require()/import modules for main():
    //   .................................. false
    //   number of expected conflicts: .... 0
    //
    //
    // Parser Analysis flags:
    //
    //   no significant actions (parser is a language matcher only):
    //   .................................. false
    //   uses yyleng: ..................... false
    //   uses yylineno: ................... false
    //   uses yytext: ..................... false
    //   uses yylloc: ..................... false
    //   uses ParseError API: ............. false
    //   uses YYERROR: .................... false
    //   uses YYRECOVERING: ............... false
    //   uses YYERROK: .................... false
    //   uses YYCLEARIN: .................. false
    //   tracks rule values: .............. true
    //   assigns rule values: ............. true
    //   uses location tracking: .......... false
    //   assigns location: ................ false
    //   uses yystack: .................... false
    //   uses yysstack: ................... false
    //   uses yysp: ....................... true
    //   uses yyrulelength: ............... false
    //   uses yyMergeLocationInfo API: .... false
    //   has error recovery: .............. false
    //   has error reporting: ............. false
    //
    // --------- END OF REPORT -----------

    trace: function no_op_trace() {},
    JisonParserError: JisonParserError,
    yy: {},
    options: {
      type: "lalr",
      hasPartialLrUpgradeOnConflict: true,
      errorRecoveryTokenDiscardCount: 3
    },
    symbols_: {
      $accept: 0,
      $end: 1,
      ADD: 3,
      ANGLE: 18,
      CHS: 24,
      COMMA: 11,
      CSS_CPROP: 16,
      CSS_VAR: 15,
      DIV: 6,
      EMS: 22,
      EOF: 1,
      EXS: 23,
      FREQ: 20,
      LENGTH: 17,
      LPAREN: 7,
      MAX: 10,
      MIN: 12,
      MUL: 5,
      NESTED_CALC: 9,
      NUMBER: 14,
      PERCENTAGE: 30,
      PREFIX: 13,
      REMS: 25,
      RES: 21,
      RPAREN: 8,
      SUB: 4,
      TIME: 19,
      VHS: 26,
      VMAXS: 29,
      VMINS: 28,
      VWS: 27,
      css_value: 35,
      css_variable: 34,
      error: 2,
      expression: 31,
      math_expression: 32,
      value: 33
    },
    terminals_: {
      1: "EOF",
      2: "error",
      3: "ADD",
      4: "SUB",
      5: "MUL",
      6: "DIV",
      7: "LPAREN",
      8: "RPAREN",
      9: "NESTED_CALC",
      10: "MAX",
      11: "COMMA",
      12: "MIN",
      13: "PREFIX",
      14: "NUMBER",
      15: "CSS_VAR",
      16: "CSS_CPROP",
      17: "LENGTH",
      18: "ANGLE",
      19: "TIME",
      20: "FREQ",
      21: "RES",
      22: "EMS",
      23: "EXS",
      24: "CHS",
      25: "REMS",
      26: "VHS",
      27: "VWS",
      28: "VMINS",
      29: "VMAXS",
      30: "PERCENTAGE"
    },
    TERROR: 2,
    EOF: 1,
    // internals: defined here so the object *structure* doesn't get modified by parse() et al,
    // thus helping JIT compilers like Chrome V8.
    originalQuoteName: null,
    originalParseError: null,
    cleanupAfterParse: null,
    constructParseErrorInfo: null,
    yyMergeLocationInfo: null,
    __reentrant_call_depth: 0,
    // INTERNAL USE ONLY
    __error_infos: [],
    // INTERNAL USE ONLY: the set of parseErrorInfo objects created since the last cleanup
    __error_recovery_infos: [],
    // INTERNAL USE ONLY: the set of parseErrorInfo objects created since the last cleanup

    // APIs which will be set up depending on user action code analysis:
    //yyRecovering: 0,
    //yyErrOk: 0,
    //yyClearIn: 0,

    // Helper APIs
    // -----------

    // Helper function which can be overridden by user code later on: put suitable quotes around
    // literal IDs in a description string.
    quoteName: function parser_quoteName(id_str) {
      return '"' + id_str + '"';
    },
    // Return the name of the given symbol (terminal or non-terminal) as a string, when available.
    //
    // Return NULL when the symbol is unknown to the parser.
    getSymbolName: function parser_getSymbolName(symbol) {
      if (this.terminals_[symbol]) {
        return this.terminals_[symbol];
      }

      // Otherwise... this might refer to a RULE token i.e. a non-terminal: see if we can dig that one up.
      //
      // An example of this may be where a rule's action code contains a call like this:
      //
      //      parser.getSymbolName(#$)
      //
      // to obtain a human-readable name of the current grammar rule.
      var s = this.symbols_;
      for (var key in s) {
        if (s[key] === symbol) {
          return key;
        }
      }
      return null;
    },
    // Return a more-or-less human-readable description of the given symbol, when available,
    // or the symbol itself, serving as its own 'description' for lack of something better to serve up.
    //
    // Return NULL when the symbol is unknown to the parser.
    describeSymbol: function parser_describeSymbol(symbol) {
      if (symbol !== this.EOF && this.terminal_descriptions_ && this.terminal_descriptions_[symbol]) {
        return this.terminal_descriptions_[symbol];
      } else if (symbol === this.EOF) {
        return "end of input";
      }
      var id = this.getSymbolName(symbol);
      if (id) {
        return this.quoteName(id);
      }
      return null;
    },
    // Produce a (more or less) human-readable list of expected tokens at the point of failure.
    //
    // The produced list may contain token or token set descriptions instead of the tokens
    // themselves to help turning this output into something that easier to read by humans
    // unless `do_not_describe` parameter is set, in which case a list of the raw, *numeric*,
    // expected terminals and nonterminals is produced.
    //
    // The returned list (array) will not contain any duplicate entries.
    collect_expected_token_set: function parser_collect_expected_token_set(state, do_not_describe) {
      var TERROR = this.TERROR;
      var tokenset = [];
      var check = {};
      // Has this (error?) state been outfitted with a custom expectations description text for human consumption?
      // If so, use that one instead of the less palatable token set.
      if (!do_not_describe && this.state_descriptions_ && this.state_descriptions_[state]) {
        return [this.state_descriptions_[state]];
      }
      for (var p in this.table[state]) {
        p = +p;
        if (p !== TERROR) {
          var d = do_not_describe ? p : this.describeSymbol(p);
          if (d && !check[d]) {
            tokenset.push(d);
            check[d] = true; // Mark this token description as already mentioned to prevent outputting duplicate entries.
          }
        }
      }
      return tokenset;
    },
    productions_: bp({
      pop: u([31, s, [32, 12], 33, 33, 34, 34, s, [35, 15]]),
      rule: u([2, s, [3, 5], 4, 6, 6, 7, s, [1, 4], 2, 4, 6, s, [1, 14], 2])
    }),
    performAction: function parser__PerformAction(yystate /* action[1] */, yysp, yyvstack) {
      /* this == yyval */

      // the JS engine itself can go and remove these statements when `yy` turns out to be unused in any action code!
      var yy = this.yy;
      yy.parser;
      yy.lexer;
      switch (yystate) {
        case 0:
          /*! Production::    $accept : expression $end */

          // default action (generated by JISON mode classic/merge :: 1,VT,VA,-,-,-,-,-,-):
          this.$ = yyvstack[yysp - 1];
          // END of default action (generated by JISON mode classic/merge :: 1,VT,VA,-,-,-,-,-,-)
          break;
        case 1:
          /*! Production::    expression : math_expression EOF */

          // default action (generated by JISON mode classic/merge :: 2,VT,VA,-,-,-,-,-,-):
          this.$ = yyvstack[yysp - 1];
          // END of default action (generated by JISON mode classic/merge :: 2,VT,VA,-,-,-,-,-,-)

          return yyvstack[yysp - 1];
        case 2:
        /*! Production::    math_expression : math_expression ADD math_expression */
        case 3:
        /*! Production::    math_expression : math_expression SUB math_expression */
        case 4:
        /*! Production::    math_expression : math_expression MUL math_expression */
        case 5:
          /*! Production::    math_expression : math_expression DIV math_expression */

          this.$ = {
            type: "MathExpression",
            operator: yyvstack[yysp - 1],
            left: yyvstack[yysp - 2],
            right: yyvstack[yysp]
          };
          break;
        case 6:
          /*! Production::    math_expression : LPAREN math_expression RPAREN */

          this.$ = yyvstack[yysp - 1];
          break;
        case 7:
          /*! Production::    math_expression : NESTED_CALC LPAREN math_expression RPAREN */

          this.$ = {
            type: "Calc",
            value: yyvstack[yysp - 1]
          };
          break;
        case 8:
          /*! Production::    math_expression : MAX LPAREN math_expression COMMA math_expression RPAREN */

          this.$ = {
            type: "MathExpression",
            operator: "max",
            left: yyvstack[yysp - 3],
            right: yyvstack[yysp - 1]
          };
          break;
        case 9:
          /*! Production::    math_expression : MIN LPAREN math_expression COMMA math_expression RPAREN */

          this.$ = {
            type: "MathExpression",
            operator: "min",
            left: yyvstack[yysp - 3],
            right: yyvstack[yysp - 1]
          };
          break;
        case 10:
          /*! Production::    math_expression : SUB PREFIX SUB NESTED_CALC LPAREN math_expression RPAREN */

          this.$ = {
            type: "Calc",
            value: yyvstack[yysp - 1],
            prefix: yyvstack[yysp - 5]
          };
          break;
        case 11:
        /*! Production::    math_expression : css_variable */
        case 12:
        /*! Production::    math_expression : css_value */
        case 13:
          /*! Production::    math_expression : value */

          this.$ = yyvstack[yysp];
          break;
        case 14:
          /*! Production::    value : NUMBER */

          this.$ = {
            type: "Value",
            value: parseFloat(yyvstack[yysp])
          };
          break;
        case 15:
          /*! Production::    value : SUB NUMBER */

          this.$ = {
            type: "Value",
            value: parseFloat(yyvstack[yysp]) * -1
          };
          break;
        case 16:
          /*! Production::    css_variable : CSS_VAR LPAREN CSS_CPROP RPAREN */

          this.$ = {
            type: "CssVariable",
            value: yyvstack[yysp - 1]
          };
          break;
        case 17:
          /*! Production::    css_variable : CSS_VAR LPAREN CSS_CPROP COMMA math_expression RPAREN */

          this.$ = {
            type: "CssVariable",
            value: yyvstack[yysp - 3],
            fallback: yyvstack[yysp - 1]
          };
          break;
        case 18:
          /*! Production::    css_value : LENGTH */

          this.$ = {
            type: "LengthValue",
            value: parseFloat(yyvstack[yysp]),
            unit: /[a-z]+/.exec(yyvstack[yysp])[0]
          };
          break;
        case 19:
          /*! Production::    css_value : ANGLE */

          this.$ = {
            type: "AngleValue",
            value: parseFloat(yyvstack[yysp]),
            unit: /[a-z]+/.exec(yyvstack[yysp])[0]
          };
          break;
        case 20:
          /*! Production::    css_value : TIME */

          this.$ = {
            type: "TimeValue",
            value: parseFloat(yyvstack[yysp]),
            unit: /[a-z]+/.exec(yyvstack[yysp])[0]
          };
          break;
        case 21:
          /*! Production::    css_value : FREQ */

          this.$ = {
            type: "FrequencyValue",
            value: parseFloat(yyvstack[yysp]),
            unit: /[a-z]+/.exec(yyvstack[yysp])[0]
          };
          break;
        case 22:
          /*! Production::    css_value : RES */

          this.$ = {
            type: "ResolutionValue",
            value: parseFloat(yyvstack[yysp]),
            unit: /[a-z]+/.exec(yyvstack[yysp])[0]
          };
          break;
        case 23:
          /*! Production::    css_value : EMS */

          this.$ = {
            type: "EmValue",
            value: parseFloat(yyvstack[yysp]),
            unit: "em"
          };
          break;
        case 24:
          /*! Production::    css_value : EXS */

          this.$ = {
            type: "ExValue",
            value: parseFloat(yyvstack[yysp]),
            unit: "ex"
          };
          break;
        case 25:
          /*! Production::    css_value : CHS */

          this.$ = {
            type: "ChValue",
            value: parseFloat(yyvstack[yysp]),
            unit: "ch"
          };
          break;
        case 26:
          /*! Production::    css_value : REMS */

          this.$ = {
            type: "RemValue",
            value: parseFloat(yyvstack[yysp]),
            unit: "rem"
          };
          break;
        case 27:
          /*! Production::    css_value : VHS */

          this.$ = {
            type: "VhValue",
            value: parseFloat(yyvstack[yysp]),
            unit: "vh"
          };
          break;
        case 28:
          /*! Production::    css_value : VWS */

          this.$ = {
            type: "VwValue",
            value: parseFloat(yyvstack[yysp]),
            unit: "vw"
          };
          break;
        case 29:
          /*! Production::    css_value : VMINS */

          this.$ = {
            type: "VminValue",
            value: parseFloat(yyvstack[yysp]),
            unit: "vmin"
          };
          break;
        case 30:
          /*! Production::    css_value : VMAXS */

          this.$ = {
            type: "VmaxValue",
            value: parseFloat(yyvstack[yysp]),
            unit: "vmax"
          };
          break;
        case 31:
          /*! Production::    css_value : PERCENTAGE */

          this.$ = {
            type: "PercentageValue",
            value: parseFloat(yyvstack[yysp]),
            unit: "%"
          };
          break;
        case 32:
          /*! Production::    css_value : SUB css_value */

          var prev = yyvstack[yysp];
          prev.value *= -1;
          this.$ = prev;
          break;
      }
    },
    table: bt({
      len: u([26, 1, 5, 25, s, [1, 3], 18, s, [0, 3], 1, s, [0, 16], s, [25, 4], 5, s, [25, 3], c, [25, 3], 16, 1, 7, 7, s, [0, 3], s, [5, 3], 1, 2, c, [24, 3], 1, 0, 25, 5, 5, 25, 5, c, [17, 3], 0, 0]),
      symbol: u([4, 7, 9, 10, 12, 14, 15, s, [17, 19, 1], 1, 1, s, [3, 4, 1], c, [32, 21], c, [31, 4], s, [7, 3], 4, 13, 14, c, [24, 14], 35, 7, c, [47, 25], c, [25, 75], c, [151, 4], 8, c, [105, 76], 4, c, [198, 15], 16, c, [250, 5], 8, 11, c, [7, 7], c, [6, 5], c, [5, 4], c, [10, 5], 11, 9, 8, 11, c, [100, 50], c, [281, 26], c, [94, 9], c, [211, 26], c, [35, 10]]),
      type: u([s, [2, 21], s, [0, 5], 1, s, [2, 26], s, [0, 4], c, [24, 21], c, [47, 46], c, [25, 76], c, [80, 75], c, [97, 27], s, [2, 28], c, [180, 51], c, [206, 30], c, [35, 19]]),
      state: u([1, 2, 10, 8, 9, 32, c, [4, 3], 37, 41, c, [5, 3], 42, c, [4, 3], 43, c, [4, 3], 44, c, [4, 3], 46, c, [4, 3], 47, c, [4, 3], 48, c, [29, 4], 57, c, [5, 3], 58, c, [4, 3], 60, c, [4, 3], 63, c, [4, 3]]),
      mode: u([s, [1, 237], s, [2, 3], c, [5, 5], c, [7, 6], s, [1, 123]]),
      goto: u([7, s, [3, 4, 1], 26, s, [11, 15, 1], s, [27, 5, 1], c, [26, 21], 33, 34, 35, 39, 36, 38, c, [20, 14], 40, c, [42, 21], c, [21, 63], c, [130, 4], 45, c, [68, 63], 49, 39, c, [16, 14], 50, s, [2, 3], 30, 31, 2, 2, s, [3, 3], 30, 31, 3, 3, c, [99, 4], 51, c, [5, 4], 52, c, [5, 4], s, [53, 4, 1], c, [91, 42], 59, c, [181, 25], 61, c, [5, 4], 62, c, [31, 25], 64, c, [5, 4], 65])
    }),
    defaultActions: bda({
      idx: u([8, 9, 10, s, [12, 16, 1], 37, 38, 43, 44, 45, 51, 55, 61, 62, 64, 65]),
      goto: u([11, 12, 13, s, [18, 14, 1], 14, 1, 32, 15, s, [4, 4, 1], 16, 8, 9, 17, 10])
    }),
    parseError: function parseError(str, hash, ExceptionClass) {
      if (hash.recoverable) {
        if (typeof this.trace === "function") {
          this.trace(str);
        }
        hash.destroy(); // destroy... well, *almost*!
      } else {
        if (typeof this.trace === "function") {
          this.trace(str);
        }
        if (!ExceptionClass) {
          ExceptionClass = this.JisonParserError;
        }
        throw new ExceptionClass(str, hash);
      }
    },
    parse: function parse(input) {
      var self = this;
      var stack = new Array(128); // token stack: stores token which leads to state at the same index (column storage)
      var sstack = new Array(128); // state stack: stores states (column storage)

      var vstack = new Array(128); // semantic value stack

      var table = this.table;
      var sp = 0; // 'stack pointer': index into the stacks

      var symbol = 0;
      this.TERROR;
      var EOF = this.EOF;
      this.options.errorRecoveryTokenDiscardCount | 0 || 3;
      var NO_ACTION = [0, 66 /* === table.length :: ensures that anyone using this new state will fail dramatically! */];
      var lexer;
      if (this.__lexer__) {
        lexer = this.__lexer__;
      } else {
        lexer = this.__lexer__ = Object.create(this.lexer);
      }
      var sharedState_yy = {
        parseError: undefined,
        quoteName: undefined,
        lexer: undefined,
        parser: undefined,
        pre_parse: undefined,
        post_parse: undefined,
        pre_lex: undefined,
        post_lex: undefined // WARNING: must be written this way for the code expanders to work correctly in both ES5 and ES6 modes!
      };
      if (typeof assert !== "function") ; else {
        assert;
      }
      this.yyGetSharedState = function yyGetSharedState() {
        return sharedState_yy;
      };
      function shallow_copy_noclobber(dst, src) {
        for (var k in src) {
          if (typeof dst[k] === "undefined" && Object.prototype.hasOwnProperty.call(src, k)) {
            dst[k] = src[k];
          }
        }
      }

      // copy state
      shallow_copy_noclobber(sharedState_yy, this.yy);
      sharedState_yy.lexer = lexer;
      sharedState_yy.parser = this;

      // Does the shared state override the default `parseError` that already comes with this instance?
      if (typeof sharedState_yy.parseError === "function") {
        this.parseError = function parseErrorAlt(str, hash, ExceptionClass) {
          if (!ExceptionClass) {
            ExceptionClass = this.JisonParserError;
          }
          return sharedState_yy.parseError.call(this, str, hash, ExceptionClass);
        };
      } else {
        this.parseError = this.originalParseError;
      }

      // Does the shared state override the default `quoteName` that already comes with this instance?
      if (typeof sharedState_yy.quoteName === "function") {
        this.quoteName = function quoteNameAlt(id_str) {
          return sharedState_yy.quoteName.call(this, id_str);
        };
      } else {
        this.quoteName = this.originalQuoteName;
      }

      // set up the cleanup function; make it an API so that external code can re-use this one in case of
      // calamities or when the `%options no-try-catch` option has been specified for the grammar, in which
      // case this parse() API method doesn't come with a `finally { ... }` block any more!
      //
      // NOTE: as this API uses parse() as a closure, it MUST be set again on every parse() invocation,
      //       or else your `sharedState`, etc. references will be *wrong*!
      this.cleanupAfterParse = function parser_cleanupAfterParse(resultValue, invoke_post_methods, do_not_nuke_errorinfos) {
        var rv;
        if (invoke_post_methods) {
          var hash;
          if (sharedState_yy.post_parse || this.post_parse) {
            // create an error hash info instance: we re-use this API in a **non-error situation**
            // as this one delivers all parser internals ready for access by userland code.
            hash = this.constructParseErrorInfo(null /* no error! */, null /* no exception! */, null, false);
          }
          if (sharedState_yy.post_parse) {
            rv = sharedState_yy.post_parse.call(this, sharedState_yy, resultValue, hash);
            if (typeof rv !== "undefined") resultValue = rv;
          }
          if (this.post_parse) {
            rv = this.post_parse.call(this, sharedState_yy, resultValue, hash);
            if (typeof rv !== "undefined") resultValue = rv;
          }

          // cleanup:
          if (hash && hash.destroy) {
            hash.destroy();
          }
        }
        if (this.__reentrant_call_depth > 1) return resultValue; // do not (yet) kill the sharedState when this is a reentrant run.

        // clean up the lingering lexer structures as well:
        if (lexer.cleanupAfterLex) {
          lexer.cleanupAfterLex(do_not_nuke_errorinfos);
        }

        // prevent lingering circular references from causing memory leaks:
        if (sharedState_yy) {
          sharedState_yy.lexer = undefined;
          sharedState_yy.parser = undefined;
          if (lexer.yy === sharedState_yy) {
            lexer.yy = undefined;
          }
        }
        sharedState_yy = undefined;
        this.parseError = this.originalParseError;
        this.quoteName = this.originalQuoteName;

        // nuke the vstack[] array at least as that one will still reference obsoleted user values.
        // To be safe, we nuke the other internal stack columns as well...
        stack.length = 0; // fastest way to nuke an array without overly bothering the GC
        sstack.length = 0;
        vstack.length = 0;
        sp = 0;

        // nuke the error hash info instances created during this run.
        // Userland code must COPY any data/references
        // in the error hash instance(s) it is more permanently interested in.
        if (!do_not_nuke_errorinfos) {
          for (var i = this.__error_infos.length - 1; i >= 0; i--) {
            var el = this.__error_infos[i];
            if (el && typeof el.destroy === "function") {
              el.destroy();
            }
          }
          this.__error_infos.length = 0;
        }
        return resultValue;
      };

      // NOTE: as this API uses parse() as a closure, it MUST be set again on every parse() invocation,
      //       or else your `lexer`, `sharedState`, etc. references will be *wrong*!
      this.constructParseErrorInfo = function parser_constructParseErrorInfo(msg, ex, expected, recoverable) {
        var pei = {
          errStr: msg,
          exception: ex,
          text: lexer.match,
          value: lexer.yytext,
          token: this.describeSymbol(symbol) || symbol,
          token_id: symbol,
          line: lexer.yylineno,
          expected: expected,
          recoverable: recoverable,
          state: state,
          action: action,
          new_state: newState,
          symbol_stack: stack,
          state_stack: sstack,
          value_stack: vstack,
          stack_pointer: sp,
          yy: sharedState_yy,
          lexer: lexer,
          parser: this,
          // and make sure the error info doesn't stay due to potential
          // ref cycle via userland code manipulations.
          // These would otherwise all be memory leak opportunities!
          //
          // Note that only array and object references are nuked as those
          // constitute the set of elements which can produce a cyclic ref.
          // The rest of the members is kept intact as they are harmless.
          destroy: function destructParseErrorInfo() {
            // remove cyclic references added to error info:
            // info.yy = null;
            // info.lexer = null;
            // info.value = null;
            // info.value_stack = null;
            // ...
            var rec = !!this.recoverable;
            for (var key in this) {
              if (this.hasOwnProperty(key) && typeof key === "object") {
                this[key] = undefined;
              }
            }
            this.recoverable = rec;
          }
        };
        // track this instance so we can `destroy()` it once we deem it superfluous and ready for garbage collection!
        this.__error_infos.push(pei);
        return pei;
      };
      function stdLex() {
        var token = lexer.lex();
        // if token isn't its numeric value, convert
        if (typeof token !== "number") {
          token = self.symbols_[token] || token;
        }
        return token || EOF;
      }
      function fastLex() {
        var token = lexer.fastLex();
        // if token isn't its numeric value, convert
        if (typeof token !== "number") {
          token = self.symbols_[token] || token;
        }
        return token || EOF;
      }
      var lex = stdLex;
      var state, action, r, t;
      var yyval = {
        $: true,
        _$: undefined,
        yy: sharedState_yy
      };
      var p;
      var yyrulelen;
      var this_production;
      var newState;
      var retval = false;
      try {
        this.__reentrant_call_depth++;
        lexer.setInput(input, sharedState_yy);

        // NOTE: we *assume* no lexer pre/post handlers are set up *after*
        // this initial `setInput()` call: hence we can now check and decide
        // whether we'll go with the standard, slower, lex() API or the
        // `fast_lex()` one:
        if (typeof lexer.canIUse === "function") {
          var lexerInfo = lexer.canIUse();
          if (lexerInfo.fastLex && typeof fastLex === "function") {
            lex = fastLex;
          }
        }
        vstack[sp] = null;
        sstack[sp] = 0;
        stack[sp] = 0;
        ++sp;
        if (this.pre_parse) {
          this.pre_parse.call(this, sharedState_yy);
        }
        if (sharedState_yy.pre_parse) {
          sharedState_yy.pre_parse.call(this, sharedState_yy);
        }
        newState = sstack[sp - 1];
        for (;;) {
          // retrieve state number from top of stack
          state = newState; // sstack[sp - 1];

          // use default actions if available
          if (this.defaultActions[state]) {
            action = 2;
            newState = this.defaultActions[state];
          } else {
            // The single `==` condition below covers both these `===` comparisons in a single
            // operation:
            //
            //     if (symbol === null || typeof symbol === 'undefined') ...
            if (!symbol) {
              symbol = lex();
            }
            // read action for current state and first input
            t = table[state] && table[state][symbol] || NO_ACTION;
            newState = t[1];
            action = t[0];

            // handle parse error
            if (!action) {
              var errStr;
              var errSymbolDescr = this.describeSymbol(symbol) || symbol;
              var expected = this.collect_expected_token_set(state);

              // Report error
              if (typeof lexer.yylineno === "number") {
                errStr = "Parse error on line " + (lexer.yylineno + 1) + ": ";
              } else {
                errStr = "Parse error: ";
              }
              if (typeof lexer.showPosition === "function") {
                errStr += "\n" + lexer.showPosition(79 - 10, 10) + "\n";
              }
              if (expected.length) {
                errStr += "Expecting " + expected.join(", ") + ", got unexpected " + errSymbolDescr;
              } else {
                errStr += "Unexpected " + errSymbolDescr;
              }
              // we cannot recover from the error!
              p = this.constructParseErrorInfo(errStr, null, expected, false);
              r = this.parseError(p.errStr, p, this.JisonParserError);
              if (typeof r !== "undefined") {
                retval = r;
              }
              break;
            }
          }
          switch (action) {
            // catch misc. parse failures:
            default:
              // this shouldn't happen, unless resolve defaults are off
              if (action instanceof Array) {
                p = this.constructParseErrorInfo("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol, null, null, false);
                r = this.parseError(p.errStr, p, this.JisonParserError);
                if (typeof r !== "undefined") {
                  retval = r;
                }
                break;
              }
              // Another case of better safe than sorry: in case state transitions come out of another error recovery process
              // or a buggy LUT (LookUp Table):
              p = this.constructParseErrorInfo("Parsing halted. No viable error recovery approach available due to internal system failure.", null, null, false);
              r = this.parseError(p.errStr, p, this.JisonParserError);
              if (typeof r !== "undefined") {
                retval = r;
              }
              break;

            // shift:
            case 1:
              stack[sp] = symbol;
              vstack[sp] = lexer.yytext;
              sstack[sp] = newState; // push state

              ++sp;
              symbol = 0;

              // Pick up the lexer details for the current symbol as that one is not 'look-ahead' any more:

              continue;

            // reduce:
            case 2:
              this_production = this.productions_[newState - 1]; // `this.productions_[]` is zero-based indexed while states start from 1 upwards...
              yyrulelen = this_production[1];
              r = this.performAction.call(yyval, newState, sp - 1, vstack);
              if (typeof r !== "undefined") {
                retval = r;
                break;
              }

              // pop off stack
              sp -= yyrulelen;

              // don't overwrite the `symbol` variable: use a local var to speed things up:
              var ntsymbol = this_production[0]; // push nonterminal (reduce)
              stack[sp] = ntsymbol;
              vstack[sp] = yyval.$;

              // goto new state = table[STATE][NONTERMINAL]
              newState = table[sstack[sp - 1]][ntsymbol];
              sstack[sp] = newState;
              ++sp;
              continue;

            // accept:
            case 3:
              if (sp !== -2) {
                retval = true;
                // Return the `$accept` rule's `$$` result, if available.
                //
                // Also note that JISON always adds this top-most `$accept` rule (with implicit,
                // default, action):
                //
                //     $accept: <startSymbol> $end
                //                  %{ $$ = $1; @$ = @1; %}
                //
                // which, combined with the parse kernel's `$accept` state behaviour coded below,
                // will produce the `$$` value output of the <startSymbol> rule as the parse result,
                // IFF that result is *not* `undefined`. (See also the parser kernel code.)
                //
                // In code:
                //
                //                  %{
                //                      @$ = @1;            // if location tracking support is included
                //                      if (typeof $1 !== 'undefined')
                //                          return $1;
                //                      else
                //                          return true;           // the default parse result if the rule actions don't produce anything
                //                  %}
                sp--;
                if (typeof vstack[sp] !== "undefined") {
                  retval = vstack[sp];
                }
              }
              break;
          }

          // break out of loop: we accept or fail with error
          break;
        }
      } catch (ex) {
        // report exceptions through the parseError callback too, but keep the exception intact
        // if it is a known parser or lexer error which has been thrown by parseError() already:
        if (ex instanceof this.JisonParserError) {
          throw ex;
        } else if (lexer && typeof lexer.JisonLexerError === "function" && ex instanceof lexer.JisonLexerError) {
          throw ex;
        }
        p = this.constructParseErrorInfo("Parsing aborted due to exception.", ex, null, false);
        retval = false;
        r = this.parseError(p.errStr, p, this.JisonParserError);
        if (typeof r !== "undefined") {
          retval = r;
        }
      } finally {
        retval = this.cleanupAfterParse(retval, true, true);
        this.__reentrant_call_depth--;
      } // /finally

      return retval;
    }
  };
  parser.originalParseError = parser.parseError;
  parser.originalQuoteName = parser.quoteName;
  /* lexer generated by jison-lex 0.6.1-215 */

  /*
   * Returns a Lexer object of the following structure:
   *
   *  Lexer: {
   *    yy: {}     The so-called "shared state" or rather the *source* of it;
   *               the real "shared state" `yy` passed around to
   *               the rule actions, etc. is a direct reference!
   *
   *               This "shared context" object was passed to the lexer by way of
   *               the `lexer.setInput(str, yy)` API before you may use it.
   *
   *               This "shared context" object is passed to the lexer action code in `performAction()`
   *               so userland code in the lexer actions may communicate with the outside world
   *               and/or other lexer rules' actions in more or less complex ways.
   *
   *  }
   *
   *  Lexer.prototype: {
   *    EOF: 1,
   *    ERROR: 2,
   *
   *    yy:        The overall "shared context" object reference.
   *
   *    JisonLexerError: function(msg, hash),
   *
   *    performAction: function lexer__performAction(yy, yyrulenumber, YY_START),
   *
   *               The function parameters and `this` have the following value/meaning:
   *               - `this`    : reference to the `lexer` instance.
   *                               `yy_` is an alias for `this` lexer instance reference used internally.
   *
   *               - `yy`      : a reference to the `yy` "shared state" object which was passed to the lexer
   *                             by way of the `lexer.setInput(str, yy)` API before.
   *
   *                             Note:
   *                             The extra arguments you specified in the `%parse-param` statement in your
   *                             **parser** grammar definition file are passed to the lexer via this object
   *                             reference as member variables.
   *
   *               - `yyrulenumber`   : index of the matched lexer rule (regex), used internally.
   *
   *               - `YY_START`: the current lexer "start condition" state.
   *
   *    parseError: function(str, hash, ExceptionClass),
   *
   *    constructLexErrorInfo: function(error_message, is_recoverable),
   *               Helper function.
   *               Produces a new errorInfo 'hash object' which can be passed into `parseError()`.
   *               See it's use in this lexer kernel in many places; example usage:
   *
   *                   var infoObj = lexer.constructParseErrorInfo('fail!', true);
   *                   var retVal = lexer.parseError(infoObj.errStr, infoObj, lexer.JisonLexerError);
   *
   *    options: { ... lexer %options ... },
   *
   *    lex: function(),
   *               Produce one token of lexed input, which was passed in earlier via the `lexer.setInput()` API.
   *               You MAY use the additional `args...` parameters as per `%parse-param` spec of the **lexer** grammar:
   *               these extra `args...` are added verbatim to the `yy` object reference as member variables.
   *
   *               WARNING:
   *               Lexer's additional `args...` parameters (via lexer's `%parse-param`) MAY conflict with
   *               any attributes already added to `yy` by the **parser** or the jison run-time;
   *               when such a collision is detected an exception is thrown to prevent the generated run-time
   *               from silently accepting this confusing and potentially hazardous situation!
   *
   *    cleanupAfterLex: function(do_not_nuke_errorinfos),
   *               Helper function.
   *
   *               This helper API is invoked when the **parse process** has completed: it is the responsibility
   *               of the **parser** (or the calling userland code) to invoke this method once cleanup is desired.
   *
   *               This helper may be invoked by user code to ensure the internal lexer gets properly garbage collected.
   *
   *    setInput: function(input, [yy]),
   *
   *
   *    input: function(),
   *
   *
   *    unput: function(str),
   *
   *
   *    more: function(),
   *
   *
   *    reject: function(),
   *
   *
   *    less: function(n),
   *
   *
   *    pastInput: function(n),
   *
   *
   *    upcomingInput: function(n),
   *
   *
   *    showPosition: function(),
   *
   *
   *    test_match: function(regex_match_array, rule_index),
   *
   *
   *    next: function(),
   *
   *
   *    begin: function(condition),
   *
   *
   *    pushState: function(condition),
   *
   *
   *    popState: function(),
   *
   *
   *    topState: function(),
   *
   *
   *    _currentRules: function(),
   *
   *
   *    stateStackSize: function(),
   *
   *
   *    performAction: function(yy, yy_, yyrulenumber, YY_START),
   *
   *
   *    rules: [...],
   *
   *
   *    conditions: {associative list: name ==> set},
   *  }
   *
   *
   *  token location info (`yylloc`): {
   *    first_line: n,
   *    last_line: n,
   *    first_column: n,
   *    last_column: n,
   *    range: [start_number, end_number]
   *               (where the numbers are indexes into the input string, zero-based)
   *  }
   *
   * ---
   *
   * The `parseError` function receives a 'hash' object with these members for lexer errors:
   *
   *  {
   *    text:        (matched text)
   *    token:       (the produced terminal token, if any)
   *    token_id:    (the produced terminal token numeric ID, if any)
   *    line:        (yylineno)
   *    loc:         (yylloc)
   *    recoverable: (boolean: TRUE when the parser MAY have an error recovery rule
   *                  available for this particular error)
   *    yy:          (object: the current parser internal "shared state" `yy`
   *                  as is also available in the rule actions; this can be used,
   *                  for instance, for advanced error analysis and reporting)
   *    lexer:       (reference to the current lexer instance used by the parser)
   *  }
   *
   * while `this` will reference the current lexer instance.
   *
   * When `parseError` is invoked by the lexer, the default implementation will
   * attempt to invoke `yy.parser.parseError()`; when this callback is not provided
   * it will try to invoke `yy.parseError()` instead. When that callback is also not
   * provided, a `JisonLexerError` exception will be thrown containing the error
   * message and `hash`, as constructed by the `constructLexErrorInfo()` API.
   *
   * Note that the lexer's `JisonLexerError` error class is passed via the
   * `ExceptionClass` argument, which is invoked to construct the exception
   * instance to be thrown, so technically `parseError` will throw the object
   * produced by the `new ExceptionClass(str, hash)` JavaScript expression.
   *
   * ---
   *
   * You can specify lexer options by setting / modifying the `.options` object of your Lexer instance.
   * These options are available:
   *
   * (Options are permanent.)
   *
   *  yy: {
   *      parseError: function(str, hash, ExceptionClass)
   *                 optional: overrides the default `parseError` function.
   *  }
   *
   *  lexer.options: {
   *      pre_lex:  function()
   *                 optional: is invoked before the lexer is invoked to produce another token.
   *                 `this` refers to the Lexer object.
   *      post_lex: function(token) { return token; }
   *                 optional: is invoked when the lexer has produced a token `token`;
   *                 this function can override the returned token value by returning another.
   *                 When it does not return any (truthy) value, the lexer will return
   *                 the original `token`.
   *                 `this` refers to the Lexer object.
   *
   * WARNING: the next set of options are not meant to be changed. They echo the abilities of
   * the lexer as per when it was compiled!
   *
   *      ranges: boolean
   *                 optional: `true` ==> token location info will include a .range[] member.
   *      flex: boolean
   *                 optional: `true` ==> flex-like lexing behaviour where the rules are tested
   *                 exhaustively to find the longest match.
   *      backtrack_lexer: boolean
   *                 optional: `true` ==> lexer regexes are tested in order and for invoked;
   *                 the lexer terminates the scan when a token is returned by the action code.
   *      xregexp: boolean
   *                 optional: `true` ==> lexer rule regexes are "extended regex format" requiring the
   *                 `XRegExp` library. When this %option has not been specified at compile time, all lexer
   *                 rule regexes have been written as standard JavaScript RegExp expressions.
   *  }
   */

  var lexer = function () {
    /**
     * See also:
     * http://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript/#35881508
     * but we keep the prototype.constructor and prototype.name assignment lines too for compatibility
     * with userland code which might access the derived class in a 'classic' way.
     *
     * @public
     * @constructor
     * @nocollapse
     */
    function JisonLexerError(msg, hash) {
      Object.defineProperty(this, "name", {
        enumerable: false,
        writable: false,
        value: "JisonLexerError"
      });
      if (msg == null) msg = "???";
      Object.defineProperty(this, "message", {
        enumerable: false,
        writable: true,
        value: msg
      });
      this.hash = hash;
      var stacktrace;
      if (hash && hash.exception instanceof Error) {
        var ex2 = hash.exception;
        this.message = ex2.message || msg;
        stacktrace = ex2.stack;
      }
      if (!stacktrace) {
        if (Error.hasOwnProperty("captureStackTrace")) {
          // V8
          Error.captureStackTrace(this, this.constructor);
        } else {
          stacktrace = new Error(msg).stack;
        }
      }
      if (stacktrace) {
        Object.defineProperty(this, "stack", {
          enumerable: false,
          writable: false,
          value: stacktrace
        });
      }
    }
    if (typeof Object.setPrototypeOf === "function") {
      Object.setPrototypeOf(JisonLexerError.prototype, Error.prototype);
    } else {
      JisonLexerError.prototype = Object.create(Error.prototype);
    }
    JisonLexerError.prototype.constructor = JisonLexerError;
    JisonLexerError.prototype.name = "JisonLexerError";
    var lexer = {
      // Code Generator Information Report
      // ---------------------------------
      //
      // Options:
      //
      //   backtracking: .................... false
      //   location.ranges: ................. false
      //   location line+column tracking: ... true
      //
      //
      // Forwarded Parser Analysis flags:
      //
      //   uses yyleng: ..................... false
      //   uses yylineno: ................... false
      //   uses yytext: ..................... false
      //   uses yylloc: ..................... false
      //   uses lexer values: ............... true / true
      //   location tracking: ............... false
      //   location assignment: ............. false
      //
      //
      // Lexer Analysis flags:
      //
      //   uses yyleng: ..................... ???
      //   uses yylineno: ................... ???
      //   uses yytext: ..................... ???
      //   uses yylloc: ..................... ???
      //   uses ParseError API: ............. ???
      //   uses yyerror: .................... ???
      //   uses location tracking & editing:  ???
      //   uses more() API: ................. ???
      //   uses unput() API: ................ ???
      //   uses reject() API: ............... ???
      //   uses less() API: ................. ???
      //   uses display APIs pastInput(), upcomingInput(), showPosition():
      //        ............................. ???
      //   uses describeYYLLOC() API: ....... ???
      //
      // --------- END OF REPORT -----------

      EOF: 1,
      ERROR: 2,
      // JisonLexerError: JisonLexerError,        /// <-- injected by the code generator

      // options: {},                             /// <-- injected by the code generator

      // yy: ...,                                 /// <-- injected by setInput()

      __currentRuleSet__: null,
      /// INTERNAL USE ONLY: internal rule set cache for the current lexer state

      __error_infos: [],
      /// INTERNAL USE ONLY: the set of lexErrorInfo objects created since the last cleanup
      __decompressed: false,
      /// INTERNAL USE ONLY: mark whether the lexer instance has been 'unfolded' completely and is now ready for use
      done: false,
      /// INTERNAL USE ONLY
      _backtrack: false,
      /// INTERNAL USE ONLY
      _input: "",
      /// INTERNAL USE ONLY
      _more: false,
      /// INTERNAL USE ONLY
      _signaled_error_token: false,
      /// INTERNAL USE ONLY
      conditionStack: [],
      /// INTERNAL USE ONLY; managed via `pushState()`, `popState()`, `topState()` and `stateStackSize()`
      match: "",
      /// READ-ONLY EXTERNAL ACCESS - ADVANCED USE ONLY: tracks input which has been matched so far for the lexer token under construction. `match` is identical to `yytext` except that this one still contains the matched input string after `lexer.performAction()` has been invoked, where userland code MAY have changed/replaced the `yytext` value entirely!
      matched: "",
      /// READ-ONLY EXTERNAL ACCESS - ADVANCED USE ONLY: tracks entire input which has been matched so far
      matches: false,
      /// READ-ONLY EXTERNAL ACCESS - ADVANCED USE ONLY: tracks RE match result for last (successful) match attempt
      yytext: "",
      /// ADVANCED USE ONLY: tracks input which has been matched so far for the lexer token under construction; this value is transferred to the parser as the 'token value' when the parser consumes the lexer token produced through a call to the `lex()` API.
      offset: 0,
      /// READ-ONLY EXTERNAL ACCESS - ADVANCED USE ONLY: tracks the 'cursor position' in the input string, i.e. the number of characters matched so far
      yyleng: 0,
      /// READ-ONLY EXTERNAL ACCESS - ADVANCED USE ONLY: length of matched input for the token under construction (`yytext`)
      yylineno: 0,
      /// READ-ONLY EXTERNAL ACCESS - ADVANCED USE ONLY: 'line number' at which the token under construction is located
      yylloc: null,
      /// READ-ONLY EXTERNAL ACCESS - ADVANCED USE ONLY: tracks location info (lines + columns) for the token under construction

      /**
       * INTERNAL USE: construct a suitable error info hash object instance for `parseError`.
       *
       * @public
       * @this {RegExpLexer}
       */
      constructLexErrorInfo: function lexer_constructLexErrorInfo(msg, recoverable, show_input_position) {
        msg = "" + msg;

        // heuristic to determine if the error message already contains a (partial) source code dump
        // as produced by either `showPosition()` or `prettyPrintRange()`:
        if (show_input_position == undefined) {
          show_input_position = !(msg.indexOf("\n") > 0 && msg.indexOf("^") > 0);
        }
        if (this.yylloc && show_input_position) {
          if (typeof this.prettyPrintRange === "function") {
            this.prettyPrintRange(this.yylloc);
            if (!/\n\s*$/.test(msg)) {
              msg += "\n";
            }
            msg += "\n  Erroneous area:\n" + this.prettyPrintRange(this.yylloc);
          } else if (typeof this.showPosition === "function") {
            var pos_str = this.showPosition();
            if (pos_str) {
              if (msg.length && msg[msg.length - 1] !== "\n" && pos_str[0] !== "\n") {
                msg += "\n" + pos_str;
              } else {
                msg += pos_str;
              }
            }
          }
        }

        /** @constructor */
        var pei = {
          errStr: msg,
          recoverable: !!recoverable,
          text: this.match,
          // This one MAY be empty; userland code should use the `upcomingInput` API to obtain more text which follows the 'lexer cursor position'...
          token: null,
          line: this.yylineno,
          loc: this.yylloc,
          yy: this.yy,
          lexer: this,
          /**
           * and make sure the error info doesn't stay due to potential
           * ref cycle via userland code manipulations.
           * These would otherwise all be memory leak opportunities!
           *
           * Note that only array and object references are nuked as those
           * constitute the set of elements which can produce a cyclic ref.
           * The rest of the members is kept intact as they are harmless.
           *
           * @public
           * @this {LexErrorInfo}
           */
          destroy: function destructLexErrorInfo() {
            // remove cyclic references added to error info:
            // info.yy = null;
            // info.lexer = null;
            // ...
            var rec = !!this.recoverable;
            for (var key in this) {
              if (this.hasOwnProperty(key) && typeof key === "object") {
                this[key] = undefined;
              }
            }
            this.recoverable = rec;
          }
        };

        // track this instance so we can `destroy()` it once we deem it superfluous and ready for garbage collection!
        this.__error_infos.push(pei);
        return pei;
      },
      /**
       * handler which is invoked when a lexer error occurs.
       *
       * @public
       * @this {RegExpLexer}
       */
      parseError: function lexer_parseError(str, hash, ExceptionClass) {
        if (!ExceptionClass) {
          ExceptionClass = this.JisonLexerError;
        }
        if (this.yy) {
          if (this.yy.parser && typeof this.yy.parser.parseError === "function") {
            return this.yy.parser.parseError.call(this, str, hash, ExceptionClass) || this.ERROR;
          } else if (typeof this.yy.parseError === "function") {
            return this.yy.parseError.call(this, str, hash, ExceptionClass) || this.ERROR;
          }
        }
        throw new ExceptionClass(str, hash);
      },
      /**
       * method which implements `yyerror(str, ...args)` functionality for use inside lexer actions.
       *
       * @public
       * @this {RegExpLexer}
       */
      yyerror: function yyError(str /*, ...args */) {
        var lineno_msg = "";
        if (this.yylloc) {
          lineno_msg = " on line " + (this.yylineno + 1);
        }
        var p = this.constructLexErrorInfo("Lexical error" + lineno_msg + ": " + str, this.options.lexerErrorsAreRecoverable);

        // Add any extra args to the hash under the name `extra_error_attributes`:
        var args = Array.prototype.slice.call(arguments, 1);
        if (args.length) {
          p.extra_error_attributes = args;
        }
        return this.parseError(p.errStr, p, this.JisonLexerError) || this.ERROR;
      },
      /**
       * final cleanup function for when we have completed lexing the input;
       * make it an API so that external code can use this one once userland
       * code has decided it's time to destroy any lingering lexer error
       * hash object instances and the like: this function helps to clean
       * up these constructs, which *may* carry cyclic references which would
       * otherwise prevent the instances from being properly and timely
       * garbage-collected, i.e. this function helps prevent memory leaks!
       *
       * @public
       * @this {RegExpLexer}
       */
      cleanupAfterLex: function lexer_cleanupAfterLex(do_not_nuke_errorinfos) {
        // prevent lingering circular references from causing memory leaks:
        this.setInput("", {});

        // nuke the error hash info instances created during this run.
        // Userland code must COPY any data/references
        // in the error hash instance(s) it is more permanently interested in.
        if (!do_not_nuke_errorinfos) {
          for (var i = this.__error_infos.length - 1; i >= 0; i--) {
            var el = this.__error_infos[i];
            if (el && typeof el.destroy === "function") {
              el.destroy();
            }
          }
          this.__error_infos.length = 0;
        }
        return this;
      },
      /**
       * clear the lexer token context; intended for internal use only
       *
       * @public
       * @this {RegExpLexer}
       */
      clear: function lexer_clear() {
        this.yytext = "";
        this.yyleng = 0;
        this.match = "";

        // - DO NOT reset `this.matched`
        this.matches = false;
        this._more = false;
        this._backtrack = false;
        var col = this.yylloc ? this.yylloc.last_column : 0;
        this.yylloc = {
          first_line: this.yylineno + 1,
          first_column: col,
          last_line: this.yylineno + 1,
          last_column: col,
          range: [this.offset, this.offset]
        };
      },
      /**
       * resets the lexer, sets new input
       *
       * @public
       * @this {RegExpLexer}
       */
      setInput: function lexer_setInput(input, yy) {
        this.yy = yy || this.yy || {};

        // also check if we've fully initialized the lexer instance,
        // including expansion work to be done to go from a loaded
        // lexer to a usable lexer:
        if (!this.__decompressed) {
          // step 1: decompress the regex list:
          var rules = this.rules;
          for (var i = 0, len = rules.length; i < len; i++) {
            var rule_re = rules[i];

            // compression: is the RE an xref to another RE slot in the rules[] table?
            if (typeof rule_re === "number") {
              rules[i] = rules[rule_re];
            }
          }

          // step 2: unfold the conditions[] set to make these ready for use:
          var conditions = this.conditions;
          for (var k in conditions) {
            var spec = conditions[k];
            var rule_ids = spec.rules;
            var len = rule_ids.length;
            var rule_regexes = new Array(len + 1); // slot 0 is unused; we use a 1-based index approach here to keep the hottest code in `lexer_next()` fast and simple!
            var rule_new_ids = new Array(len + 1);
            for (var i = 0; i < len; i++) {
              var idx = rule_ids[i];
              var rule_re = rules[idx];
              rule_regexes[i + 1] = rule_re;
              rule_new_ids[i + 1] = idx;
            }
            spec.rules = rule_new_ids;
            spec.__rule_regexes = rule_regexes;
            spec.__rule_count = len;
          }
          this.__decompressed = true;
        }
        this._input = input || "";
        this.clear();
        this._signaled_error_token = false;
        this.done = false;
        this.yylineno = 0;
        this.matched = "";
        this.conditionStack = ["INITIAL"];
        this.__currentRuleSet__ = null;
        this.yylloc = {
          first_line: 1,
          first_column: 0,
          last_line: 1,
          last_column: 0,
          range: [0, 0]
        };
        this.offset = 0;
        return this;
      },
      /**
       * edit the remaining input via user-specified callback.
       * This can be used to forward-adjust the input-to-parse,
       * e.g. inserting macro expansions and alike in the
       * input which has yet to be lexed.
       * The behaviour of this API contrasts the `unput()` et al
       * APIs as those act on the *consumed* input, while this
       * one allows one to manipulate the future, without impacting
       * the current `yyloc` cursor location or any history.
       *
       * Use this API to help implement C-preprocessor-like
       * `#include` statements, etc.
       *
       * The provided callback must be synchronous and is
       * expected to return the edited input (string).
       *
       * The `cpsArg` argument value is passed to the callback
       * as-is.
       *
       * `callback` interface:
       * `function callback(input, cpsArg)`
       *
       * - `input` will carry the remaining-input-to-lex string
       *   from the lexer.
       * - `cpsArg` is `cpsArg` passed into this API.
       *
       * The `this` reference for the callback will be set to
       * reference this lexer instance so that userland code
       * in the callback can easily and quickly access any lexer
       * API.
       *
       * When the callback returns a non-string-type falsey value,
       * we assume the callback did not edit the input and we
       * will using the input as-is.
       *
       * When the callback returns a non-string-type value, it
       * is converted to a string for lexing via the `"" + retval`
       * operation. (See also why: http://2ality.com/2012/03/converting-to-string.html
       * -- that way any returned object's `toValue()` and `toString()`
       * methods will be invoked in a proper/desirable order.)
       *
       * @public
       * @this {RegExpLexer}
       */
      editRemainingInput: function lexer_editRemainingInput(callback, cpsArg) {
        var rv = callback.call(this, this._input, cpsArg);
        if (typeof rv !== "string") {
          if (rv) {
            this._input = "" + rv;
          }
          // else: keep `this._input` as is.
        } else {
          this._input = rv;
        }
        return this;
      },
      /**
       * consumes and returns one char from the input
       *
       * @public
       * @this {RegExpLexer}
       */
      input: function lexer_input() {
        if (!this._input) {
          //this.done = true;    -- don't set `done` as we want the lex()/next() API to be able to produce one custom EOF token match after this anyhow. (lexer can match special <<EOF>> tokens and perform user action code for a <<EOF>> match, but only does so *once*)
          return null;
        }
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;

        // Count the linenumber up when we hit the LF (or a stand-alone CR).
        // On CRLF, the linenumber is incremented when you fetch the CR or the CRLF combo
        // and we advance immediately past the LF as well, returning both together as if
        // it was all a single 'character' only.
        var slice_len = 1;
        var lines = false;
        if (ch === "\n") {
          lines = true;
        } else if (ch === "\r") {
          lines = true;
          var ch2 = this._input[1];
          if (ch2 === "\n") {
            slice_len++;
            ch += ch2;
            this.yytext += ch2;
            this.yyleng++;
            this.offset++;
            this.match += ch2;
            this.matched += ch2;
            this.yylloc.range[1]++;
          }
        }
        if (lines) {
          this.yylineno++;
          this.yylloc.last_line++;
          this.yylloc.last_column = 0;
        } else {
          this.yylloc.last_column++;
        }
        this.yylloc.range[1]++;
        this._input = this._input.slice(slice_len);
        return ch;
      },
      /**
       * unshifts one char (or an entire string) into the input
       *
       * @public
       * @this {RegExpLexer}
       */
      unput: function lexer_unput(ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);
        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        this.yyleng = this.yytext.length;
        this.offset -= len;
        this.match = this.match.substr(0, this.match.length - len);
        this.matched = this.matched.substr(0, this.matched.length - len);
        if (lines.length > 1) {
          this.yylineno -= lines.length - 1;
          this.yylloc.last_line = this.yylineno + 1;

          // Get last entirely matched line into the `pre_lines[]` array's
          // last index slot; we don't mind when other previously
          // matched lines end up in the array too.
          var pre = this.match;
          var pre_lines = pre.split(/(?:\r\n?|\n)/g);
          if (pre_lines.length === 1) {
            pre = this.matched;
            pre_lines = pre.split(/(?:\r\n?|\n)/g);
          }
          this.yylloc.last_column = pre_lines[pre_lines.length - 1].length;
        } else {
          this.yylloc.last_column -= len;
        }
        this.yylloc.range[1] = this.yylloc.range[0] + this.yyleng;
        this.done = false;
        return this;
      },
      /**
       * cache matched text and append it on next action
       *
       * @public
       * @this {RegExpLexer}
       */
      more: function lexer_more() {
        this._more = true;
        return this;
      },
      /**
       * signal the lexer that this rule fails to match the input, so the
       * next matching rule (regex) should be tested instead.
       *
       * @public
       * @this {RegExpLexer}
       */
      reject: function lexer_reject() {
        if (this.options.backtrack_lexer) {
          this._backtrack = true;
        } else {
          // when the `parseError()` call returns, we MUST ensure that the error is registered.
          // We accomplish this by signaling an 'error' token to be produced for the current
          // `.lex()` run.
          var lineno_msg = "";
          if (this.yylloc) {
            lineno_msg = " on line " + (this.yylineno + 1);
          }
          var p = this.constructLexErrorInfo("Lexical error" + lineno_msg + ": You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).", false);
          this._signaled_error_token = this.parseError(p.errStr, p, this.JisonLexerError) || this.ERROR;
        }
        return this;
      },
      /**
       * retain first n characters of the match
       *
       * @public
       * @this {RegExpLexer}
       */
      less: function lexer_less(n) {
        return this.unput(this.match.slice(n));
      },
      /**
       * return (part of the) already matched input, i.e. for error
       * messages.
       *
       * Limit the returned string length to `maxSize` (default: 20).
       *
       * Limit the returned string to the `maxLines` number of lines of
       * input (default: 1).
       *
       * Negative limit values equal *unlimited*.
       *
       * @public
       * @this {RegExpLexer}
       */
      pastInput: function lexer_pastInput(maxSize, maxLines) {
        var past = this.matched.substring(0, this.matched.length - this.match.length);
        if (maxSize < 0) maxSize = past.length;else if (!maxSize) maxSize = 20;
        if (maxLines < 0) maxLines = past.length; // can't ever have more input lines than this!
        else if (!maxLines) maxLines = 1;

        // `substr` anticipation: treat \r\n as a single character and take a little
        // more than necessary so that we can still properly check against maxSize
        // after we've transformed and limited the newLines in here:
        past = past.substr(-maxSize * 2 - 2);

        // now that we have a significantly reduced string to process, transform the newlines
        // and chop them, then limit them:
        var a = past.replace(/\r\n|\r/g, "\n").split("\n");
        a = a.slice(-maxLines);
        past = a.join("\n");

        // When, after limiting to maxLines, we still have too much to return,
        // do add an ellipsis prefix...
        if (past.length > maxSize) {
          past = "..." + past.substr(-maxSize);
        }
        return past;
      },
      /**
       * return (part of the) upcoming input, i.e. for error messages.
       *
       * Limit the returned string length to `maxSize` (default: 20).
       *
       * Limit the returned string to the `maxLines` number of lines of input (default: 1).
       *
       * Negative limit values equal *unlimited*.
       *
       * > ### NOTE ###
       * >
       * > *"upcoming input"* is defined as the whole of the both
       * > the *currently lexed* input, together with any remaining input
       * > following that. *"currently lexed"* input is the input
       * > already recognized by the lexer but not yet returned with
       * > the lexer token. This happens when you are invoking this API
       * > from inside any lexer rule action code block.
       * >
       *
       * @public
       * @this {RegExpLexer}
       */
      upcomingInput: function lexer_upcomingInput(maxSize, maxLines) {
        var next = this.match;
        if (maxSize < 0) maxSize = next.length + this._input.length;else if (!maxSize) maxSize = 20;
        if (maxLines < 0) maxLines = maxSize; // can't ever have more input lines than this!
        else if (!maxLines) maxLines = 1;

        // `substring` anticipation: treat \r\n as a single character and take a little
        // more than necessary so that we can still properly check against maxSize
        // after we've transformed and limited the newLines in here:
        if (next.length < maxSize * 2 + 2) {
          next += this._input.substring(0, maxSize * 2 + 2); // substring is faster on Chrome/V8
        }

        // now that we have a significantly reduced string to process, transform the newlines
        // and chop them, then limit them:
        var a = next.replace(/\r\n|\r/g, "\n").split("\n");
        a = a.slice(0, maxLines);
        next = a.join("\n");

        // When, after limiting to maxLines, we still have too much to return,
        // do add an ellipsis postfix...
        if (next.length > maxSize) {
          next = next.substring(0, maxSize) + "...";
        }
        return next;
      },
      /**
       * return a string which displays the character position where the
       * lexing error occurred, i.e. for error messages
       *
       * @public
       * @this {RegExpLexer}
       */
      showPosition: function lexer_showPosition(maxPrefix, maxPostfix) {
        var pre = this.pastInput(maxPrefix).replace(/\s/g, " ");
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput(maxPostfix).replace(/\s/g, " ") + "\n" + c + "^";
      },
      /**
       * return an YYLLOC info object derived off the given context (actual, preceding, following, current).
       * Use this method when the given `actual` location is not guaranteed to exist (i.e. when
       * it MAY be NULL) and you MUST have a valid location info object anyway:
       * then we take the given context of the `preceding` and `following` locations, IFF those are available,
       * and reconstruct the `actual` location info from those.
       * If this fails, the heuristic is to take the `current` location, IFF available.
       * If this fails as well, we assume the sought location is at/around the current lexer position
       * and then produce that one as a response. DO NOTE that these heuristic/derived location info
       * values MAY be inaccurate!
       *
       * NOTE: `deriveLocationInfo()` ALWAYS produces a location info object *copy* of `actual`, not just
       * a *reference* hence all input location objects can be assumed to be 'constant' (function has no side-effects).
       *
       * @public
       * @this {RegExpLexer}
       */
      deriveLocationInfo: function lexer_deriveYYLLOC(actual, preceding, following, current) {
        var loc = {
          first_line: 1,
          first_column: 0,
          last_line: 1,
          last_column: 0,
          range: [0, 0]
        };
        if (actual) {
          loc.first_line = actual.first_line | 0;
          loc.last_line = actual.last_line | 0;
          loc.first_column = actual.first_column | 0;
          loc.last_column = actual.last_column | 0;
          if (actual.range) {
            loc.range[0] = actual.range[0] | 0;
            loc.range[1] = actual.range[1] | 0;
          }
        }
        if (loc.first_line <= 0 || loc.last_line < loc.first_line) {
          // plan B: heuristic using preceding and following:
          if (loc.first_line <= 0 && preceding) {
            loc.first_line = preceding.last_line | 0;
            loc.first_column = preceding.last_column | 0;
            if (preceding.range) {
              loc.range[0] = actual.range[1] | 0;
            }
          }
          if ((loc.last_line <= 0 || loc.last_line < loc.first_line) && following) {
            loc.last_line = following.first_line | 0;
            loc.last_column = following.first_column | 0;
            if (following.range) {
              loc.range[1] = actual.range[0] | 0;
            }
          }

          // plan C?: see if the 'current' location is useful/sane too:
          if (loc.first_line <= 0 && current && (loc.last_line <= 0 || current.last_line <= loc.last_line)) {
            loc.first_line = current.first_line | 0;
            loc.first_column = current.first_column | 0;
            if (current.range) {
              loc.range[0] = current.range[0] | 0;
            }
          }
          if (loc.last_line <= 0 && current && (loc.first_line <= 0 || current.first_line >= loc.first_line)) {
            loc.last_line = current.last_line | 0;
            loc.last_column = current.last_column | 0;
            if (current.range) {
              loc.range[1] = current.range[1] | 0;
            }
          }
        }

        // sanitize: fix last_line BEFORE we fix first_line as we use the 'raw' value of the latter
        // or plan D heuristics to produce a 'sensible' last_line value:
        if (loc.last_line <= 0) {
          if (loc.first_line <= 0) {
            loc.first_line = this.yylloc.first_line;
            loc.last_line = this.yylloc.last_line;
            loc.first_column = this.yylloc.first_column;
            loc.last_column = this.yylloc.last_column;
            loc.range[0] = this.yylloc.range[0];
            loc.range[1] = this.yylloc.range[1];
          } else {
            loc.last_line = this.yylloc.last_line;
            loc.last_column = this.yylloc.last_column;
            loc.range[1] = this.yylloc.range[1];
          }
        }
        if (loc.first_line <= 0) {
          loc.first_line = loc.last_line;
          loc.first_column = 0; // loc.last_column;
          loc.range[1] = loc.range[0];
        }
        if (loc.first_column < 0) {
          loc.first_column = 0;
        }
        if (loc.last_column < 0) {
          loc.last_column = loc.first_column > 0 ? loc.first_column : 80;
        }
        return loc;
      },
      /**
       * return a string which displays the lines & columns of input which are referenced
       * by the given location info range, plus a few lines of context.
       *
       * This function pretty-prints the indicated section of the input, with line numbers
       * and everything!
       *
       * This function is very useful to provide highly readable error reports, while
       * the location range may be specified in various flexible ways:
       *
       * - `loc` is the location info object which references the area which should be
       *   displayed and 'marked up': these lines & columns of text are marked up by `^`
       *   characters below each character in the entire input range.
       *
       * - `context_loc` is the *optional* location info object which instructs this
       *   pretty-printer how much *leading* context should be displayed alongside
       *   the area referenced by `loc`. This can help provide context for the displayed
       *   error, etc.
       *
       *   When this location info is not provided, a default context of 3 lines is
       *   used.
       *
       * - `context_loc2` is another *optional* location info object, which serves
       *   a similar purpose to `context_loc`: it specifies the amount of *trailing*
       *   context lines to display in the pretty-print output.
       *
       *   When this location info is not provided, a default context of 1 line only is
       *   used.
       *
       * Special Notes:
       *
       * - when the `loc`-indicated range is very large (about 5 lines or more), then
       *   only the first and last few lines of this block are printed while a
       *   `...continued...` message will be printed between them.
       *
       *   This serves the purpose of not printing a huge amount of text when the `loc`
       *   range happens to be huge: this way a manageable & readable output results
       *   for arbitrary large ranges.
       *
       * - this function can display lines of input which whave not yet been lexed.
       *   `prettyPrintRange()` can access the entire input!
       *
       * @public
       * @this {RegExpLexer}
       */
      prettyPrintRange: function lexer_prettyPrintRange(loc, context_loc, context_loc2) {
        loc = this.deriveLocationInfo(loc, context_loc, context_loc2);
        const CONTEXT = 3;
        const CONTEXT_TAIL = 1;
        const MINIMUM_VISIBLE_NONEMPTY_LINE_COUNT = 2;
        var input = this.matched + this._input;
        var lines = input.split("\n");
        var l0 = Math.max(1, context_loc ? context_loc.first_line : loc.first_line - CONTEXT);
        var l1 = Math.max(1, context_loc2 ? context_loc2.last_line : loc.last_line + CONTEXT_TAIL);
        var lineno_display_width = 1 + Math.log10(l1 | 1) | 0;
        var ws_prefix = new Array(lineno_display_width).join(" ");
        var nonempty_line_indexes = [];
        var rv = lines.slice(l0 - 1, l1 + 1).map(function injectLineNumber(line, index) {
          var lno = index + l0;
          var lno_pfx = (ws_prefix + lno).substr(-lineno_display_width);
          var rv = lno_pfx + ": " + line;
          var errpfx = new Array(lineno_display_width + 1).join("^");
          var offset = 2 + 1;
          var len = 0;
          if (lno === loc.first_line) {
            offset += loc.first_column;
            len = Math.max(2, (lno === loc.last_line ? loc.last_column : line.length) - loc.first_column + 1);
          } else if (lno === loc.last_line) {
            len = Math.max(2, loc.last_column + 1);
          } else if (lno > loc.first_line && lno < loc.last_line) {
            len = Math.max(2, line.length + 1);
          }
          if (len) {
            var lead = new Array(offset).join(".");
            var mark = new Array(len).join("^");
            rv += "\n" + errpfx + lead + mark;
            if (line.trim().length > 0) {
              nonempty_line_indexes.push(index);
            }
          }
          rv = rv.replace(/\t/g, " ");
          return rv;
        });

        // now make sure we don't print an overly large amount of error area: limit it
        // to the top and bottom line count:
        if (nonempty_line_indexes.length > 2 * MINIMUM_VISIBLE_NONEMPTY_LINE_COUNT) {
          var clip_start = nonempty_line_indexes[MINIMUM_VISIBLE_NONEMPTY_LINE_COUNT - 1] + 1;
          var clip_end = nonempty_line_indexes[nonempty_line_indexes.length - MINIMUM_VISIBLE_NONEMPTY_LINE_COUNT] - 1;
          var intermediate_line = new Array(lineno_display_width + 1).join(" ") + "  (...continued...)";
          intermediate_line += "\n" + new Array(lineno_display_width + 1).join("-") + "  (---------------)";
          rv.splice(clip_start, clip_end - clip_start + 1, intermediate_line);
        }
        return rv.join("\n");
      },
      /**
       * helper function, used to produce a human readable description as a string, given
       * the input `yylloc` location object.
       *
       * Set `display_range_too` to TRUE to include the string character index position(s)
       * in the description if the `yylloc.range` is available.
       *
       * @public
       * @this {RegExpLexer}
       */
      describeYYLLOC: function lexer_describe_yylloc(yylloc, display_range_too) {
        var l1 = yylloc.first_line;
        var l2 = yylloc.last_line;
        var c1 = yylloc.first_column;
        var c2 = yylloc.last_column;
        var dl = l2 - l1;
        var dc = c2 - c1;
        var rv;
        if (dl === 0) {
          rv = "line " + l1 + ", ";
          if (dc <= 1) {
            rv += "column " + c1;
          } else {
            rv += "columns " + c1 + " .. " + c2;
          }
        } else {
          rv = "lines " + l1 + "(column " + c1 + ") .. " + l2 + "(column " + c2 + ")";
        }
        if (yylloc.range && display_range_too) {
          var r1 = yylloc.range[0];
          var r2 = yylloc.range[1] - 1;
          if (r2 <= r1) {
            rv += " {String Offset: " + r1 + "}";
          } else {
            rv += " {String Offset range: " + r1 + " .. " + r2 + "}";
          }
        }
        return rv;
      },
      /**
       * test the lexed token: return FALSE when not a match, otherwise return token.
       *
       * `match` is supposed to be an array coming out of a regex match, i.e. `match[0]`
       * contains the actually matched text string.
       *
       * Also move the input cursor forward and update the match collectors:
       *
       * - `yytext`
       * - `yyleng`
       * - `match`
       * - `matches`
       * - `yylloc`
       * - `offset`
       *
       * @public
       * @this {RegExpLexer}
       */
      test_match: function lexer_test_match(match, indexed_rule) {
        var token, lines, backup, match_str, match_str_len;
        if (this.options.backtrack_lexer) {
          // save context
          backup = {
            yylineno: this.yylineno,
            yylloc: {
              first_line: this.yylloc.first_line,
              last_line: this.yylloc.last_line,
              first_column: this.yylloc.first_column,
              last_column: this.yylloc.last_column,
              range: this.yylloc.range.slice(0)
            },
            yytext: this.yytext,
            match: this.match,
            matches: this.matches,
            matched: this.matched,
            yyleng: this.yyleng,
            offset: this.offset,
            _more: this._more,
            _input: this._input,
            //_signaled_error_token: this._signaled_error_token,
            yy: this.yy,
            conditionStack: this.conditionStack.slice(0),
            done: this.done
          };
        }
        match_str = match[0];
        match_str_len = match_str.length;

        // if (match_str.indexOf('\n') !== -1 || match_str.indexOf('\r') !== -1) {
        lines = match_str.split(/(?:\r\n?|\n)/g);
        if (lines.length > 1) {
          this.yylineno += lines.length - 1;
          this.yylloc.last_line = this.yylineno + 1;
          this.yylloc.last_column = lines[lines.length - 1].length;
        } else {
          this.yylloc.last_column += match_str_len;
        }

        // }
        this.yytext += match_str;
        this.match += match_str;
        this.matched += match_str;
        this.matches = match;
        this.yyleng = this.yytext.length;
        this.yylloc.range[1] += match_str_len;

        // previous lex rules MAY have invoked the `more()` API rather than producing a token:
        // those rules will already have moved this `offset` forward matching their match lengths,
        // hence we must only add our own match length now:
        this.offset += match_str_len;
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match_str_len);

        // calling this method:
        //
        //   function lexer__performAction(yy, yyrulenumber, YY_START) {...}
        token = this.performAction.call(this, this.yy, indexed_rule, this.conditionStack[this.conditionStack.length - 1] /* = YY_START */);

        // otherwise, when the action codes are all simple return token statements:
        //token = this.simpleCaseActionClusters[indexed_rule];

        if (this.done && this._input) {
          this.done = false;
        }
        if (token) {
          return token;
        } else if (this._backtrack) {
          // recover context
          for (var k in backup) {
            this[k] = backup[k];
          }
          this.__currentRuleSet__ = null;
          return false; // rule action called reject() implying the next rule should be tested instead.
        } else if (this._signaled_error_token) {
          // produce one 'error' token as `.parseError()` in `reject()`
          // did not guarantee a failure signal by throwing an exception!
          token = this._signaled_error_token;
          this._signaled_error_token = false;
          return token;
        }
        return false;
      },
      /**
       * return next match in input
       *
       * @public
       * @this {RegExpLexer}
       */
      next: function lexer_next() {
        if (this.done) {
          this.clear();
          return this.EOF;
        }
        if (!this._input) {
          this.done = true;
        }
        var token, match, tempMatch, index;
        if (!this._more) {
          this.clear();
        }
        var spec = this.__currentRuleSet__;
        if (!spec) {
          // Update the ruleset cache as we apparently encountered a state change or just started lexing.
          // The cache is set up for fast lookup -- we assume a lexer will switch states much less often than it will
          // invoke the `lex()` token-producing API and related APIs, hence caching the set for direct access helps
          // speed up those activities a tiny bit.
          spec = this.__currentRuleSet__ = this._currentRules();

          // Check whether a *sane* condition has been pushed before: this makes the lexer robust against
          // user-programmer bugs such as https://github.com/zaach/jison-lex/issues/19
          if (!spec || !spec.rules) {
            var lineno_msg = "";
            if (this.options.trackPosition) {
              lineno_msg = " on line " + (this.yylineno + 1);
            }
            var p = this.constructLexErrorInfo("Internal lexer engine error" + lineno_msg + ': The lex grammar programmer pushed a non-existing condition name "' + this.topState() + '"; this is a fatal error and should be reported to the application programmer team!', false);

            // produce one 'error' token until this situation has been resolved, most probably by parse termination!
            return this.parseError(p.errStr, p, this.JisonLexerError) || this.ERROR;
          }
        }
        var rule_ids = spec.rules;
        var regexes = spec.__rule_regexes;
        var len = spec.__rule_count;

        // Note: the arrays are 1-based, while `len` itself is a valid index,
        // hence the non-standard less-or-equal check in the next loop condition!
        for (var i = 1; i <= len; i++) {
          tempMatch = this._input.match(regexes[i]);
          if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
            match = tempMatch;
            index = i;
            if (this.options.backtrack_lexer) {
              token = this.test_match(tempMatch, rule_ids[i]);
              if (token !== false) {
                return token;
              } else if (this._backtrack) {
                match = undefined;
                continue; // rule action called reject() implying a rule MISmatch.
              } else {
                // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                return false;
              }
            } else if (!this.options.flex) {
              break;
            }
          }
        }
        if (match) {
          token = this.test_match(match, rule_ids[index]);
          if (token !== false) {
            return token;
          }

          // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
          return false;
        }
        if (!this._input) {
          this.done = true;
          this.clear();
          return this.EOF;
        } else {
          var lineno_msg = "";
          if (this.options.trackPosition) {
            lineno_msg = " on line " + (this.yylineno + 1);
          }
          var p = this.constructLexErrorInfo("Lexical error" + lineno_msg + ": Unrecognized text.", this.options.lexerErrorsAreRecoverable);
          var pendingInput = this._input;
          var activeCondition = this.topState();
          var conditionStackDepth = this.conditionStack.length;
          token = this.parseError(p.errStr, p, this.JisonLexerError) || this.ERROR;
          if (token === this.ERROR) {
            // we can try to recover from a lexer error that `parseError()` did not 'recover' for us
            // by moving forward at least one character at a time IFF the (user-specified?) `parseError()`
            // has not consumed/modified any pending input or changed state in the error handler:
            if (!this.matches &&
            // and make sure the input has been modified/consumed ...
            pendingInput === this._input &&
            // ...or the lexer state has been modified significantly enough
            // to merit a non-consuming error handling action right now.
            activeCondition === this.topState() && conditionStackDepth === this.conditionStack.length) {
              this.input();
            }
          }
          return token;
        }
      },
      /**
       * return next match that has a token
       *
       * @public
       * @this {RegExpLexer}
       */
      lex: function lexer_lex() {
        var r;

        // allow the PRE/POST handlers set/modify the return token for maximum flexibility of the generated lexer:
        if (typeof this.pre_lex === "function") {
          r = this.pre_lex.call(this, 0);
        }
        if (typeof this.options.pre_lex === "function") {
          // (also account for a userdef function which does not return any value: keep the token as is)
          r = this.options.pre_lex.call(this, r) || r;
        }
        if (this.yy && typeof this.yy.pre_lex === "function") {
          // (also account for a userdef function which does not return any value: keep the token as is)
          r = this.yy.pre_lex.call(this, r) || r;
        }
        while (!r) {
          r = this.next();
        }
        if (this.yy && typeof this.yy.post_lex === "function") {
          // (also account for a userdef function which does not return any value: keep the token as is)
          r = this.yy.post_lex.call(this, r) || r;
        }
        if (typeof this.options.post_lex === "function") {
          // (also account for a userdef function which does not return any value: keep the token as is)
          r = this.options.post_lex.call(this, r) || r;
        }
        if (typeof this.post_lex === "function") {
          // (also account for a userdef function which does not return any value: keep the token as is)
          r = this.post_lex.call(this, r) || r;
        }
        return r;
      },
      /**
       * return next match that has a token. Identical to the `lex()` API but does not invoke any of the
       * `pre_lex()` nor any of the `post_lex()` callbacks.
       *
       * @public
       * @this {RegExpLexer}
       */
      fastLex: function lexer_fastLex() {
        var r;
        while (!r) {
          r = this.next();
        }
        return r;
      },
      /**
       * return info about the lexer state that can help a parser or other lexer API user to use the
       * most efficient means available. This API is provided to aid run-time performance for larger
       * systems which employ this lexer.
       *
       * @public
       * @this {RegExpLexer}
       */
      canIUse: function lexer_canIUse() {
        var rv = {
          fastLex: !(typeof this.pre_lex === "function" || typeof this.options.pre_lex === "function" || this.yy && typeof this.yy.pre_lex === "function" || this.yy && typeof this.yy.post_lex === "function" || typeof this.options.post_lex === "function" || typeof this.post_lex === "function") && typeof this.fastLex === "function"
        };
        return rv;
      },
      /**
       * backwards compatible alias for `pushState()`;
       * the latter is symmetrical with `popState()` and we advise to use
       * those APIs in any modern lexer code, rather than `begin()`.
       *
       * @public
       * @this {RegExpLexer}
       */
      begin: function lexer_begin(condition) {
        return this.pushState(condition);
      },
      /**
       * activates a new lexer condition state (pushes the new lexer
       * condition state onto the condition stack)
       *
       * @public
       * @this {RegExpLexer}
       */
      pushState: function lexer_pushState(condition) {
        this.conditionStack.push(condition);
        this.__currentRuleSet__ = null;
        return this;
      },
      /**
       * pop the previously active lexer condition state off the condition
       * stack
       *
       * @public
       * @this {RegExpLexer}
       */
      popState: function lexer_popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
          this.__currentRuleSet__ = null;
          return this.conditionStack.pop();
        } else {
          return this.conditionStack[0];
        }
      },
      /**
       * return the currently active lexer condition state; when an index
       * argument is provided it produces the N-th previous condition state,
       * if available
       *
       * @public
       * @this {RegExpLexer}
       */
      topState: function lexer_topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
          return this.conditionStack[n];
        } else {
          return "INITIAL";
        }
      },
      /**
       * (internal) determine the lexer rule set which is active for the
       * currently active lexer condition state
       *
       * @public
       * @this {RegExpLexer}
       */
      _currentRules: function lexer__currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
          return this.conditions[this.conditionStack[this.conditionStack.length - 1]];
        } else {
          return this.conditions["INITIAL"];
        }
      },
      /**
       * return the number of states currently on the stack
       *
       * @public
       * @this {RegExpLexer}
       */
      stateStackSize: function lexer_stateStackSize() {
        return this.conditionStack.length;
      },
      options: {
        trackPosition: true
      },
      JisonLexerError: JisonLexerError,
      performAction: function lexer__performAction(yy, yyrulenumber, YY_START) {
        switch (yyrulenumber) {
          case 1:
            /*! Conditions:: INITIAL */
            /*! Rule::       \s+ */
            /* skip whitespace */
            break;
          default:
            return this.simpleCaseActionClusters[yyrulenumber];
        }
      },
      simpleCaseActionClusters: {
        /*! Conditions:: INITIAL */
        /*! Rule::       (--[0-9a-z-A-Z-]*) */
        0: 16,
        /*! Conditions:: INITIAL */
        /*! Rule::       \* */
        2: 5,
        /*! Conditions:: INITIAL */
        /*! Rule::       \/ */
        3: 6,
        /*! Conditions:: INITIAL */
        /*! Rule::       \+ */
        4: 3,
        /*! Conditions:: INITIAL */
        /*! Rule::       - */
        5: 4,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)px\b */
        6: 17,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)cm\b */
        7: 17,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)mm\b */
        8: 17,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)in\b */
        9: 17,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)pt\b */
        10: 17,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)pc\b */
        11: 17,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)deg\b */
        12: 18,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)grad\b */
        13: 18,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)rad\b */
        14: 18,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)turn\b */
        15: 18,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)s\b */
        16: 19,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)ms\b */
        17: 19,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)Hz\b */
        18: 20,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)kHz\b */
        19: 20,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)dpi\b */
        20: 21,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)dpcm\b */
        21: 21,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)dppx\b */
        22: 21,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)em\b */
        23: 22,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)ex\b */
        24: 23,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)ch\b */
        25: 24,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)rem\b */
        26: 25,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)vw\b */
        27: 27,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)vh\b */
        28: 26,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)vmin\b */
        29: 28,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)vmax\b */
        30: 29,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)% */
        31: 30,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)\b */
        32: 14,
        /*! Conditions:: INITIAL */
        /*! Rule::       (calc) */
        33: 9,
        /*! Conditions:: INITIAL */
        /*! Rule::       (var) */
        34: 15,
        /*! Conditions:: INITIAL */
        /*! Rule::       (max) */
        35: 10,
        /*! Conditions:: INITIAL */
        /*! Rule::       (min) */
        36: 12,
        /*! Conditions:: INITIAL */
        /*! Rule::       ([a-z]+) */
        37: 13,
        /*! Conditions:: INITIAL */
        /*! Rule::       \( */
        38: 7,
        /*! Conditions:: INITIAL */
        /*! Rule::       \) */
        39: 8,
        /*! Conditions:: INITIAL */
        /*! Rule::       , */
        40: 11,
        /*! Conditions:: INITIAL */
        /*! Rule::       $ */
        41: 1
      },
      rules: [/*  0: *//^(?:(--[\d\-A-Za-z]*))/, /*  1: *//^(?:\s+)/, /*  2: *//^(?:\*)/, /*  3: *//^(?:\/)/, /*  4: *//^(?:\+)/, /*  5: *//^(?:-)/, /*  6: *//^(?:(\d+(\.\d*)?|\.\d+)px\b)/, /*  7: *//^(?:(\d+(\.\d*)?|\.\d+)cm\b)/, /*  8: *//^(?:(\d+(\.\d*)?|\.\d+)mm\b)/, /*  9: *//^(?:(\d+(\.\d*)?|\.\d+)in\b)/, /* 10: *//^(?:(\d+(\.\d*)?|\.\d+)pt\b)/, /* 11: *//^(?:(\d+(\.\d*)?|\.\d+)pc\b)/, /* 12: *//^(?:(\d+(\.\d*)?|\.\d+)deg\b)/, /* 13: *//^(?:(\d+(\.\d*)?|\.\d+)grad\b)/, /* 14: *//^(?:(\d+(\.\d*)?|\.\d+)rad\b)/, /* 15: *//^(?:(\d+(\.\d*)?|\.\d+)turn\b)/, /* 16: *//^(?:(\d+(\.\d*)?|\.\d+)s\b)/, /* 17: *//^(?:(\d+(\.\d*)?|\.\d+)ms\b)/, /* 18: *//^(?:(\d+(\.\d*)?|\.\d+)Hz\b)/, /* 19: *//^(?:(\d+(\.\d*)?|\.\d+)kHz\b)/, /* 20: *//^(?:(\d+(\.\d*)?|\.\d+)dpi\b)/, /* 21: *//^(?:(\d+(\.\d*)?|\.\d+)dpcm\b)/, /* 22: *//^(?:(\d+(\.\d*)?|\.\d+)dppx\b)/, /* 23: *//^(?:(\d+(\.\d*)?|\.\d+)em\b)/, /* 24: *//^(?:(\d+(\.\d*)?|\.\d+)ex\b)/, /* 25: *//^(?:(\d+(\.\d*)?|\.\d+)ch\b)/, /* 26: *//^(?:(\d+(\.\d*)?|\.\d+)rem\b)/, /* 27: *//^(?:(\d+(\.\d*)?|\.\d+)vw\b)/, /* 28: *//^(?:(\d+(\.\d*)?|\.\d+)vh\b)/, /* 29: *//^(?:(\d+(\.\d*)?|\.\d+)vmin\b)/, /* 30: *//^(?:(\d+(\.\d*)?|\.\d+)vmax\b)/, /* 31: *//^(?:(\d+(\.\d*)?|\.\d+)%)/, /* 32: *//^(?:(\d+(\.\d*)?|\.\d+)\b)/, /* 33: *//^(?:(calc))/, /* 34: *//^(?:(var))/, /* 35: *//^(?:(max))/, /* 36: *//^(?:(min))/, /* 37: *//^(?:([a-z]+))/, /* 38: *//^(?:\()/, /* 39: *//^(?:\))/, /* 40: *//^(?:,)/, /* 41: *//^(?:$)/],
      conditions: {
        INITIAL: {
          rules: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41],
          inclusive: true
        }
      }
    };
    return lexer;
  }();
  parser.lexer = lexer;
  function Parser() {
    this.yy = {};
  }
  Parser.prototype = parser;
  parser.Parser = Parser;
  return new Parser();
}();
var parser_1 = {
  parser
};

const conversions = {
  // length
  px: {
    px: 1,
    cm: 96.0 / 2.54,
    mm: 96.0 / 25.4,
    in: 96,
    pt: 96.0 / 72.0,
    pc: 16
  },
  cm: {
    px: 2.54 / 96.0,
    cm: 1,
    mm: 0.1,
    in: 2.54,
    pt: 2.54 / 72.0,
    pc: 2.54 / 6.0
  },
  mm: {
    px: 25.4 / 96.0,
    cm: 10,
    mm: 1,
    in: 25.4,
    pt: 25.4 / 72.0,
    pc: 25.4 / 6.0
  },
  in: {
    px: 1.0 / 96.0,
    cm: 1.0 / 2.54,
    mm: 1.0 / 25.4,
    in: 1,
    pt: 1.0 / 72.0,
    pc: 1.0 / 6.0
  },
  pt: {
    px: 0.75,
    cm: 72.0 / 2.54,
    mm: 72.0 / 25.4,
    in: 72,
    pt: 1,
    pc: 12
  },
  pc: {
    px: 6.0 / 96.0,
    cm: 6.0 / 2.54,
    mm: 6.0 / 25.4,
    in: 6,
    pt: 6.0 / 72.0,
    pc: 1
  },
  // angle
  deg: {
    deg: 1,
    grad: 0.9,
    rad: 180 / Math.PI,
    turn: 360
  },
  grad: {
    deg: 400 / 360,
    grad: 1,
    rad: 200 / Math.PI,
    turn: 400
  },
  rad: {
    deg: Math.PI / 180,
    grad: Math.PI / 200,
    rad: 1,
    turn: Math.PI * 2
  },
  turn: {
    deg: 1 / 360,
    grad: 1 / 400,
    rad: 0.5 / Math.PI,
    turn: 1
  },
  // time
  s: {
    s: 1,
    ms: 1 / 1000
  },
  ms: {
    s: 1000,
    ms: 1
  },
  // frequency
  Hz: {
    Hz: 1,
    kHz: 1000
  },
  kHz: {
    Hz: 1 / 1000,
    kHz: 1
  },
  // resolution
  dpi: {
    dpi: 1,
    dpcm: 1.0 / 2.54,
    dppx: 1 / 96
  },
  dpcm: {
    dpi: 2.54,
    dpcm: 1,
    dppx: 2.54 / 96.0
  },
  dppx: {
    dpi: 96,
    dpcm: 96.0 / 2.54,
    dppx: 1
  }
};
function convertUnits(value, sourceUnit, targetUnit, precision) {
  if (!conversions.hasOwnProperty(targetUnit)) throw new Error("Cannot convert to " + targetUnit);
  if (!conversions[targetUnit].hasOwnProperty(sourceUnit)) throw new Error("Cannot convert from " + sourceUnit + " to " + targetUnit);
  var converted = conversions[targetUnit][sourceUnit] * value;
  if (precision !== false) {
    precision = Math.pow(10, parseInt(precision) || 5);
    return Math.round(converted * precision) / precision;
  }
  return converted;
}

function convertNodes(left, right, precision) {
  switch (left.type) {
    case "LengthValue":
    case "AngleValue":
    case "TimeValue":
    case "FrequencyValue":
    case "ResolutionValue":
      return convertAbsoluteLength(left, right, precision);
    default:
      return {
        left,
        right
      };
  }
}
function convertAbsoluteLength(left, right, precision) {
  if (right.type === left.type) {
    right = {
      type: left.type,
      value: convertUnits(right.value, right.unit, left.unit, precision),
      unit: left.unit
    };
  }
  return {
    left,
    right
  };
}

function reduce(node, precision) {
  if (node.type === "MathExpression") return reduceMathExpression(node, precision);
  if (node.type === "Calc") return reduce(node.value, precision);
  return node;
}
function isEqual(left, right) {
  return left.type === right.type && left.value === right.value;
}
function isValueType(type) {
  switch (type) {
    case "LengthValue":
    case "AngleValue":
    case "TimeValue":
    case "FrequencyValue":
    case "ResolutionValue":
    case "EmValue":
    case "ExValue":
    case "ChValue":
    case "RemValue":
    case "VhValue":
    case "VwValue":
    case "VminValue":
    case "VmaxValue":
    case "PercentageValue":
    case "Value":
      return true;
  }
  return false;
}
function convertMathExpression(node, precision) {
  let nodes = convertNodes(node.left, node.right, precision);
  let left = reduce(nodes.left, precision);
  let right = reduce(nodes.right, precision);
  if (left.type === "MathExpression" && right.type === "MathExpression") {
    if (left.operator === "/" && right.operator === "*" || left.operator === "-" && right.operator === "+" || left.operator === "*" && right.operator === "/" || left.operator === "+" && right.operator === "-") {
      if (isEqual(left.right, right.right)) nodes = convertNodes(left.left, right.left, precision);else if (isEqual(left.right, right.left)) nodes = convertNodes(left.left, right.right, precision);
      left = reduce(nodes.left, precision);
      right = reduce(nodes.right, precision);
    }
  }
  node.left = left;
  node.right = right;
  return node;
}
function flip(operator) {
  return operator === "+" ? "-" : "+";
}
function flipValue(node) {
  if (isValueType(node.type)) node.value = -node.value;else if (node.type == "MathExpression") {
    node.left = flipValue(node.left);
    node.right = flipValue(node.right);
  }
  return node;
}
function reduceAddSubExpression(node, precision) {
  const {
    left,
    right,
    operator: op
  } = node;
  if (left.type === "CssVariable" || right.type === "CssVariable") return node;

  // something + 0 => something
  // something - 0 => something
  if (right.value === 0) return left;

  // 0 + something => something
  if (left.value === 0 && op === "+") return right;

  // 0 - something => -something
  if (left.value === 0 && op === "-") return flipValue(right);

  // value + value
  // value - value
  if (left.type === right.type && isValueType(left.type)) {
    node = Object.assign({}, left);
    if (op === "+") node.value = left.value + right.value;else node.value = left.value - right.value;
  }

  // value <op> (expr)
  if (isValueType(left.type) && (right.operator === "+" || right.operator === "-") && right.type === "MathExpression") {
    // value + (value + something) => (value + value) + something
    // value + (value - something) => (value + value) - something
    // value - (value + something) => (value - value) - something
    // value - (value - something) => (value - value) + something
    if (left.type === right.left.type) {
      node = Object.assign({}, node);
      node.left = reduce({
        type: "MathExpression",
        operator: op,
        left: left,
        right: right.left
      }, precision);
      node.right = right.right;
      node.operator = op === "-" ? flip(right.operator) : right.operator;
      return reduce(node, precision);
    }
    // value + (something + value) => (value + value) + something
    // value + (something - value) => (value - value) + something
    // value - (something + value) => (value - value) - something
    // value - (something - value) => (value + value) - something
    else if (left.type === right.right.type) {
      node = Object.assign({}, node);
      node.left = reduce({
        type: "MathExpression",
        operator: op === "-" ? flip(right.operator) : right.operator,
        left: left,
        right: right.right
      }, precision);
      node.right = right.left;
      return reduce(node, precision);
    }
  }

  // (expr) <op> value
  if (left.type === "MathExpression" && (left.operator === "+" || left.operator === "-") && isValueType(right.type)) {
    // (value + something) + value => (value + value) + something
    // (value - something) + value => (value + value) - something
    // (value + something) - value => (value - value) + something
    // (value - something) - value => (value - value) - something
    if (right.type === left.left.type) {
      node = Object.assign({}, left);
      node.left = reduce({
        type: "MathExpression",
        operator: op,
        left: left.left,
        right: right
      }, precision);
      return reduce(node, precision);
    }
    // (something + value) + value => something + (value + value)
    // (something - value1) + value2 => something - (value2 - value1)
    // (something + value) - value => something + (value - value)
    // (something - value) - value => something - (value + value)
    else if (right.type === left.right.type) {
      node = Object.assign({}, left);
      if (left.operator === "-") {
        node.right = reduce({
          type: "MathExpression",
          operator: op === "-" ? "+" : "-",
          left: right,
          right: left.right
        }, precision);
        node.operator = op === "-" ? "-" : "+";
      } else {
        node.right = reduce({
          type: "MathExpression",
          operator: op,
          left: left.right,
          right: right
        }, precision);
      }
      if (node.right.value < 0) {
        node.right.value *= -1;
        node.operator = node.operator === "-" ? "+" : "-";
      }
      return reduce(node, precision);
    }
  }
  return node;
}
function reduceDivisionExpression(node, precision) {
  if (!isValueType(node.right.type)) return node;
  if (node.right.type !== "Value") throw new Error(`Cannot divide by "${node.right.unit}", number expected`);
  if (node.right.value === 0) throw new Error("Cannot divide by zero");

  // (expr) / value
  if (node.left.type === "MathExpression") {
    if (isValueType(node.left.left.type) && isValueType(node.left.right.type)) {
      node.left.left.value /= node.right.value;
      node.left.right.value /= node.right.value;
      return reduce(node.left, precision);
    }
    return node;
  }
  // something / value
  else if (isValueType(node.left.type)) {
    node.left.value /= node.right.value;
    return node.left;
  }
  return node;
}
function reduceMultiplicationExpression(node) {
  // (expr) * value
  if (node.left.type === "MathExpression" && node.right.type === "Value") {
    if (isValueType(node.left.left.type) && isValueType(node.left.right.type)) {
      node.left.left.value *= node.right.value;
      node.left.right.value *= node.right.value;
      return node.left;
    }
  }
  // something * value
  else if (isValueType(node.left.type) && node.right.type === "Value") {
    node.left.value *= node.right.value;
    return node.left;
  }
  // value * (expr)
  else if (node.left.type === "Value" && node.right.type === "MathExpression") {
    if (isValueType(node.right.left.type) && isValueType(node.right.right.type)) {
      node.right.left.value *= node.left.value;
      node.right.right.value *= node.left.value;
      return node.right;
    }
  }
  // value * something
  else if (node.left.type === "Value" && isValueType(node.right.type)) {
    node.right.value *= node.left.value;
    return node.right;
  }
  return node;
}
function reduceMaxExpression(node) {
  if (node.left.type !== "LengthValue" || node.right.type !== "LengthValue") {
    throw new Error("Max function can be reduced only if types are LengthValue");
  }
  node.left.value = Math.max(node.left.value, node.right.value);
  return node.left;
}
function reduceMinExpression(node) {
  if (node.left.type !== "LengthValue" || node.right.type !== "LengthValue") {
    throw new Error("Min function can be reduced only if types are LengthValue");
  }
  node.left.value = Math.min(node.left.value, node.right.value);
  return node.left;
}
function reduceMathExpression(node, precision) {
  node = convertMathExpression(node, precision);
  switch (node.operator) {
    case "+":
    case "-":
      return reduceAddSubExpression(node, precision);
    case "/":
      return reduceDivisionExpression(node, precision);
    case "*":
      return reduceMultiplicationExpression(node);
    case "max":
      return reduceMaxExpression(node);
    case "min":
      return reduceMinExpression(node);
  }
  return node;
}

const order = {
  "*": 0,
  "/": 0,
  "+": 1,
  "-": 1
};
function round(value, prec) {
  if (prec !== false) {
    const precision = Math.pow(10, prec);
    return Math.round(value * precision) / precision;
  }
  return value;
}
function stringify(node, prec) {
  switch (node.type) {
    case "MathExpression":
      {
        const {
          left,
          right,
          operator: op
        } = node;
        let str = "";
        if (left.type === "MathExpression" && order[op] < order[left.operator]) str += "(" + stringify(left, prec) + ")";else str += stringify(left, prec);
        str += " " + node.operator + " ";
        if (right.type === "MathExpression" && order[op] < order[right.operator]) {
          str += "(" + stringify(right, prec) + ")";
        } else if (right.type === "MathExpression" && op === "-" && ["+", "-"].includes(right.operator)) {
          // fix #52 : a-(b+c) = a-b-c
          right.operator = flip(right.operator);
          str += stringify(right, prec);
        } else {
          str += stringify(right, prec);
        }
        return str;
      }
    case "Value":
      return round(node.value, prec);
    case "CssVariable":
      if (node.fallback) {
        return `var(${node.value}, ${stringify(node.fallback, prec)})`;
      }
      return `var(${node.value})`;
    case "Calc":
      if (node.prefix) {
        return `-${node.prefix}-calc(${stringify(node.value, prec)})`;
      }
      return `calc(${stringify(node.value, prec)})`;
    default:
      return round(node.value, prec) + node.unit;
  }
}
function stringifier(calc, node, precision) {
  let str = stringify(node, precision);
  if (node.type === "MathExpression") {
    // if calc expression couldn't be resolved to a single value, re-wrap it as
    // a calc()
    str = calc + "(" + str + ")";
  }
  return str;
}

const MATCH_CALC = /((?:\-[a-z]+\-)?calc)/;
function calculateAllViewportValues(ast, map) {
  if (typeof ast === "object" && ast !== null) {
    if (ast.type === "VwValue" && ast.unit === "vw" && typeof map.vw === "number") {
      return {
        type: "LengthValue",
        unit: "px",
        value: ast.value / 100 * map.vw
      };
    } else if (ast.type === "PercentageValue" && ast.unit === "%" && typeof map.percent === "number") {
      return {
        type: "LengthValue",
        unit: "px",
        value: ast.value / 100 * map.percent
      };
    } else {
      for (const key in ast) {
        if (typeof ast[key] === "object" && ast[key] !== null) {
          ast[key] = calculateAllViewportValues(ast[key], map);
        }
      }
    }
  }
  return ast;
}
function reduceCSSCalc(value) {
  let precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
  let map = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return valueParser__default["default"](value).walk(node => {
    // skip anything which isn't a calc() function
    if (node.type !== "function" || !MATCH_CALC.test(node.value)) return;

    // stringify calc expression and produce an AST
    const contents = valueParser__default["default"].stringify(node.nodes);

    // skip constant() and env()
    if (contents.indexOf("constant") >= 0 || contents.indexOf("env") >= 0) return;
    const ast = calculateAllViewportValues(parser_1.parser.parse(contents), map);

    // reduce AST to its simplest form, that is, either to a single value
    // or a simplified calc expression
    const reducedAst = reduce(ast, precision);

    // stringify AST and write it back
    node.type = "word";
    node.value = stringifier(node.value, reducedAst, precision);
  }, true).toString();
}

function parseSpacing(spacing) {
  if (spacing.endsWith("px")) {
    const value = parseFloat(spacing);
    if (isNaN(value)) {
      throw new Error(`incorrect spacing: ${spacing}`);
    }
    return {
      unit: "px",
      value
    };
  }
  if (spacing.endsWith("vw")) {
    const value = parseFloat(spacing);
    if (isNaN(value)) {
      throw new Error(`incorrect spacing: ${spacing}`);
    }
    return {
      unit: "vw",
      value
    };
  }
  throw new Error(`incorrect spacing: ${spacing}.`);
}
function spacingToPx(spacing, width) {
  const reducedSpacing = reduceCSSCalc(`calc(${spacing})` /* wrapping calc is necessary, otherwise max(10px,20px) doesn't work */, 5, {
    vw: width,
    percent: width
  });
  const parsed = parseSpacing(reducedSpacing);
  if (parsed.unit === "px") {
    return parsed.value;
  }
  throw new Error(`Error while running spacingToPx for spacing: ${spacing} and width: ${width}`);
}

function areWidthsFullyDefined(widths, devices) {
  let areWidthsFullyDefined = true;
  devices.forEach(device => {
    if (widths[device.id] === -1) {
      areWidthsFullyDefined = false;
    }
  });
  return areWidthsFullyDefined;
}

function linearizeSpace(input, compilationContext, widths) {
  let constant = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  if (!isTrulyResponsiveValue$1(input)) {
    return input;
  }

  /**
   *
   * Important!
   *
   * Although linearizeSpace takes widths into account (it's obvious) we must still remember about responsive tokens.
   *
   * Responsive tokens will be quite rare (like a container margin or a font size).
   * But still we must remember that responsive tokens are defined relative to SCREEN WIDTH.
   * It means that even if our component has "width" that is not a screen width and is very irregular, then responsive tokens relative to screen width takes precedence!
   * So if our component has width 500px on XL and is wider on smaller breakpoint LG (800px), then if responsive token is bigger on XL than LG it will still hold.
   * It makes a total sense. If we broke this rule and somehow applied widths to responsive tokens, then user could see a font that she totally doesn't want for a specific breakpoint.
   * It usually won't hurt at all, because fonts and container margins are responsive by nature. Actually maybe other spacings shouldn't be possible to be responsive at all!
   * That's why first thing below is to fill undefined values with responsive tokens if possible and only then linearize the remaining ones (with widths taken into account).
   *
   */

  // If responsive value has some token that is responsive, then this token should be applied to all surrounding breakpoints.
  // Responsive token kind of "overrides auto".
  // If we want in the future auto for responsive tokens it's not the place for it. Linearizing tokens should happen in creating compilation context.
  const inputAfterResponsiveTokenAuto = applyAutoUsingResponsiveTokens(input, compilationContext);
  const inputWithScalarNonRefValues = {
    $res: true
  };
  compilationContext.devices.forEach(device => {
    if (inputAfterResponsiveTokenAuto[device.id] === undefined) {
      return;
    }
    const refValue = responsiveValueGetDefinedValue(inputAfterResponsiveTokenAuto, device.id, compilationContext.devices, getDevicesWidths(compilationContext.devices));
    if (isTrulyResponsiveValue$1(refValue.value)) {
      inputWithScalarNonRefValues[device.id] = spacingToPx(responsiveValueGetDefinedValue(refValue.value, device.id, compilationContext.devices, getDevicesWidths(compilationContext.devices)), device.w);
    } else {
      inputWithScalarNonRefValues[device.id] = spacingToPx(refValue.value, device.w);
    }
  });
  if (!areWidthsFullyDefined(widths, compilationContext.devices)) {
    return responsiveValueFill(inputAfterResponsiveTokenAuto, compilationContext.devices, getDevicesWidths(compilationContext.devices));
  }

  // Let's run linearize function
  const linearisedCompiledValues = linearizeSpaceWithoutNesting(inputWithScalarNonRefValues, compilationContext, widths, constant);
  compilationContext.devices.forEach(device => {
    if (inputAfterResponsiveTokenAuto[device.id] === undefined) {
      inputAfterResponsiveTokenAuto[device.id] = snapValueToToken(responsiveValueForceGet$1(linearisedCompiledValues, device.id), responsiveValueGetFirstLowerValue(inputWithScalarNonRefValues, device.id, compilationContext.devices, getDevicesWidths(compilationContext.devices)), responsiveValueGetFirstHigherValue(inputWithScalarNonRefValues, device.id, compilationContext.devices, getDevicesWidths(compilationContext.devices)), compilationContext.theme.space, constant);
    }
  });
  return inputAfterResponsiveTokenAuto;
}
function snapValueToToken(value, lowerDefinedValue, higherDefinedValue, spaces, constant) {
  let currentToken = undefined;
  let minDelta = Number.MAX_VALUE;
  for (const tokenId in spaces) {
    const tokenValue = spaces[tokenId].value;
    if (isTrulyResponsiveValue$1(tokenValue)) {
      // only non-responsive
      continue;
    }
    const parsedValue = parseSpacing(tokenValue);
    if (parsedValue.unit === "vw") {
      continue;
    }
    const tokenPxValue = parsedValue.value;

    // If value smaller than constant then the only possible token is the token equaling the value
    if (value <= constant && tokenPxValue !== value) {
      continue;
    }

    // token value must be within higher and lower limits
    if (higherDefinedValue !== undefined) {
      if (tokenPxValue > higherDefinedValue) {
        continue;
      }
    }
    if (lowerDefinedValue !== undefined) {
      if (tokenPxValue < lowerDefinedValue) {
        continue;
      }
    }
    if (tokenId.split(".").length > 1) {
      // only non-prefixed
      continue;
    }

    // snapped token can never be bigger than our constant
    if (tokenPxValue < constant) {
      continue;
    }
    const delta = Math.abs(value - tokenPxValue);
    if (delta < minDelta || (/* in case of equal deltas, let's take bigger token */currentToken && delta === minDelta && tokenValue > currentToken.value)) {
      minDelta = delta;
      currentToken = {
        tokenId,
        value: tokenValue,
        widgetId: "@easyblocks/space"
      };
    }
  }
  if (!currentToken) {
    return {
      value: `${value}px`
    };
  }
  return currentToken;
}
function linearizeSpaceWithoutNesting(input, compilationContext, widths) {
  let constant = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  if (!isTrulyResponsiveValue$1(input)) {
    return input;
  }

  // // If only 1 value is defined (2 keys, $res and value), then we return
  // if (Object.keys(input).length === 2) {
  //   return responsiveValueFill(input, compilationContext.devices);
  // }

  // Empty object returns 0
  if (Object.keys(input).length === 0) {
    console.warn("linearize Space - empty object input, that shouldn't happen, fallback to 0");
    return 0;
  }

  // For now we just use arrays (from previous implementation). Later they're mapped back to object
  const value = [];
  const referencePoints = [];
  const componentWidths = getDeviceWidthPairs(widths, compilationContext.devices);
  componentWidths.forEach((componentWidth, index) => {
    const breakpointValue = input[componentWidth.deviceId];
    value[index] = breakpointValue;
    if (breakpointValue === null || breakpointValue === undefined) {
      value[index] = null; // null padding and normalization

      let leftIndex;
      let rightIndex;

      // Let's find closest left index
      for (let i = index - 1; i >= 0; i--) {
        const val = input[componentWidths[i].deviceId];
        if (val !== undefined) {
          leftIndex = i;
          break;
        }
      }

      // Let's find closest right index
      for (let i = index + 1; i < componentWidths.length; i++) {
        const val = input[componentWidths[i].deviceId];
        if (val !== undefined) {
          rightIndex = i;
          break;
        }
      }
      if (leftIndex === undefined && rightIndex === undefined) {
        throw new Error("unreachable");
      }
      referencePoints[index] = {
        leftIndex,
        rightIndex
      };
      return;
    }
  });
  referencePoints.forEach((refPoint, index) => {
    if (!refPoint) {
      return;
    }
    const currentX = componentWidths[index].width;

    // Single point linearity
    if (refPoint.leftIndex !== undefined && refPoint.rightIndex === undefined || refPoint.leftIndex === undefined && refPoint.rightIndex !== undefined) {
      const currentRefPoint = refPoint.leftIndex ?? refPoint.rightIndex;
      const refY = value[currentRefPoint];
      const refX = componentWidths[currentRefPoint].width;
      const deltaY = refY - constant;
      if (deltaY <= 0) {
        value[index] = refY;
      } else {
        const a = (refY - constant) / refX;
        value[index] = a * currentX + constant;
      }
    } else if (refPoint.leftIndex !== undefined && refPoint.rightIndex !== undefined) {
      const p1_x = componentWidths[refPoint.leftIndex].width;
      const p1_y = value[refPoint.leftIndex];

      // default a, b (enabled when only p1 is defined)
      let a = 0,
        b = p1_y;
      const p2_x = componentWidths[refPoint.rightIndex].width;
      const p2_y = value[refPoint.rightIndex];
      const deltaX = p1_x - p2_x;
      if (deltaX === 0) {
        // if delta 0 then we take lower for left and higher for right
        value[index] = index < refPoint.leftIndex ? p1_y : p2_y;
      } else {
        a = (p1_y - p2_y) / deltaX;
        b = p2_y - a * p2_x;
        if (a >= 0) {
          // take into account 0 values!!!
          if (p1_y === 0 || p2_y === 0) {
            if (index < refPoint.leftIndex) {
              a = 0;
              b = p1_y;
            } else {
              a = 0;
              b = p2_y;
            }
          }
          value[index] = currentX * a + b;
        } else {
          // We don't linearize descending functions!
          value[index] = index < refPoint.leftIndex ? p1_y : p2_y;
        }
      }
    } else {
      throw new Error("unreachable");
    }
  });
  const output = {
    $res: true
  };
  value.forEach((scalarVal, index) => {
    if (scalarVal === undefined || scalarVal === null) {
      return;
    }
    output[componentWidths[index].deviceId] = scalarVal;
  });
  return output;
}

/**
 *  Input like: { breakpoint1: sth, breakpoint2: sth, breakpoint3: sth, ... }
 */
function squashCSSResults$1(scalarValues, devices, disableNesting) {
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
      ret[i] = squashCSSResults$1(newScalarValues, devices);
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
      ret[key] = squashCSSResults$1(newScalarValues, devices, key === "xfont");
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
  return responsiveValueNormalize$1({
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
    return responsiveValueForceGet$1(value, breakpoint);
  }

  // for context props we just treat them as responsive
  return responsiveValueForceGet$1(value, breakpoint);
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
function scalarizeConfig$1(config, breakpoint, devices, schema) {
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
      params: scalarizeConfig$1(input.params, device.id, devices, []),
      values: scalarizeConfig$1(input.values, device.id, devices, schema)
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
      output.props[propName] = responsiveValueNormalize$1(squashedValue, devices); // props should be normalized
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
  output.styled = squashCSSResults$1(styledOnlyScalarOutputs, devices);
  return output;
}

function getCommonFieldProps(schemaProp) {
  const label = schemaProp.label || schemaProp.prop;
  const group = schemaProp.group || "Properties";
  return {
    label,
    name: schemaProp.prop,
    group,
    schemaProp,
    description: schemaProp.description,
    isLabelHidden: schemaProp.isLabelHidden,
    layout: schemaProp.layout,
    params: "params" in schemaProp ? schemaProp.params : undefined
  };
}
const tinaFieldProviders = {
  text: (schemaProp, _, value) => {
    if (!isValueLocalTextReference(value) && typeof value !== "string") {
      return {
        ...getCommonFieldProps(schemaProp),
        component: "external"
      };
    }
    return {
      ...getCommonFieldProps(schemaProp),
      component: "text",
      name: schemaProp.prop,
      normalize: schemaProp.normalize
    };
  },
  number: schemaProp => {
    return {
      ...getCommonFieldProps(schemaProp),
      component: "number",
      step: 1,
      min: schemaProp.params?.min,
      max: schemaProp.params?.max
    };
  },
  string: schemaProp => {
    if (schemaProp.responsive) {
      return {
        ...getCommonFieldProps(schemaProp),
        component: "responsive2",
        subComponent: "text",
        normalize: schemaProp.params?.normalize
      };
    }
    return {
      ...getCommonFieldProps(schemaProp),
      component: "text",
      normalize: schemaProp.params?.normalize
    };
  },
  boolean: schemaProp => {
    if (schemaProp.responsive) {
      return {
        ...getCommonFieldProps(schemaProp),
        component: "responsive2",
        subComponent: "toggle"
      };
    }
    return {
      ...getCommonFieldProps(schemaProp),
      component: "toggle"
    };
  },
  select: schemaProp => {
    if (schemaProp.responsive) {
      return {
        ...getCommonFieldProps(schemaProp),
        component: "responsive2",
        subComponent: "select",
        options: schemaProp.params.options
      };
    }
    return {
      ...getCommonFieldProps(schemaProp),
      component: "select",
      options: schemaProp.params.options
    };
  },
  "radio-group": schemaProp => {
    if (schemaProp.responsive) {
      return {
        ...getCommonFieldProps(schemaProp),
        component: "responsive2",
        subComponent: "radio-group",
        options: schemaProp.params.options
      };
    }
    return {
      ...getCommonFieldProps(schemaProp),
      component: "radio-group",
      options: schemaProp.params.options
    };
  },
  component: schemaProp => {
    return {
      ...getCommonFieldProps(schemaProp),
      component: "block",
      schemaProp
    };
  },
  "component-collection": () => {
    throw new Error("component-collection is not yet supported in sidebar");
  },
  "component-collection-localised": () => {
    throw new Error("component-collection-localised is not yet supported in sidebar");
  },
  component$$$: schemaProp => {
    return {
      ...getCommonFieldProps(schemaProp),
      component: "identity",
      schemaProp
    };
  },
  external: (schemaProp, editorContext) => {
    const externalTypeDefinition = editorContext.types[schemaProp.type];
    if (!externalTypeDefinition) {
      throw new Error(`Can't find definition for type "${schemaProp.type}"`);
    }
    if (schemaProp.responsive) {
      return {
        ...getCommonFieldProps(schemaProp),
        component: "responsive2",
        subComponent: "external"
      };
    }
    return {
      ...getCommonFieldProps(schemaProp),
      component: "external"
    };
  },
  position: schemaProp => {
    return {
      ...getCommonFieldProps(schemaProp),
      component: "responsive2",
      subComponent: "position"
    };
  },
  custom: (schemaProp, editorContext, value) => {
    const customTypeDefinition = editorContext.types[schemaProp.type];
    if (!customTypeDefinition) {
      throw new Error(`Can't find definition for type "${schemaProp.type}"`);
    }
    if (customTypeDefinition.type === "external") {
      return tinaFieldProviders.external(schemaProp, editorContext, value);
    }
    if (customTypeDefinition.type === "token") {
      let tokens = assertDefined(editorContext.theme[customTypeDefinition.token], `Missing token values within the Easyblocks config for "${customTypeDefinition.token}"`);
      if ("params" in schemaProp && schemaProp.params && "prefix" in schemaProp.params && typeof schemaProp.params.prefix === "string") {
        // Copy tokens to prevent mutating original tokens
        tokens = {
          ...tokens
        };
        for (const key in tokens) {
          if (!key.startsWith(schemaProp.params.prefix + ".")) {
            delete tokens[key];
          } else {
            tokens[key] = {
              ...tokens[key],
              label: key.split(`${schemaProp.params.prefix}.`)[1]
            };
          }
        }
      }
      const commonTokenFieldProps = {
        tokens,
        allowCustom: !!customTypeDefinition.allowCustom,
        extraValues: "params" in schemaProp && schemaProp.params && "extraValues" in schemaProp.params ? schemaProp.params.extraValues : undefined
      };
      if (customTypeDefinition.responsiveness === "never") {
        return {
          ...getCommonFieldProps(schemaProp),
          component: "token",
          ...commonTokenFieldProps
        };
      }
      return {
        ...getCommonFieldProps(schemaProp),
        // Token fields are always responsive
        component: "responsive2",
        subComponent: "token",
        ...commonTokenFieldProps
      };
    }
    return {
      ...getCommonFieldProps(schemaProp),
      ...(customTypeDefinition.responsiveness === "always" || customTypeDefinition.responsiveness === "optional" && schemaProp.responsive ? {
        component: "responsive2",
        subComponent: "local"
      } : {
        component: "local"
      })
    };
  }
};
function getTinaField(schemaProp, editorContext, value) {
  const fieldProvider = editorContext.types[schemaProp.type] && schemaProp.type !== "text" ? tinaFieldProviders.custom : tinaFieldProviders[schemaProp.type];
  return fieldProvider(schemaProp, editorContext, value);
}
function isValueLocalTextReference(value) {
  if (!(typeof value === "object" && value !== null)) {
    return false;
  }
  if (!("id" in value && typeof value.id === "string" && value.id.startsWith("local."))) {
    return false;
  }
  if (!("value" in value)) {
    return false;
  }
  if (!("widgetId" in value && typeof value.widgetId === "string" && value.widgetId === "@easyblocks/local-text")) {
    return false;
  }
  return true;
}

function compileComponent(editableElement, compilationContext, contextProps,
// contextProps are already compiled! They're result of compilation function.
meta, cache, parentComponentEditingInfo) {
  let configPrefix = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : "";
  if (!isComponentConfig(editableElement)) {
    console.error("[compile] wrong input for compileComponent", editableElement);
    throw new Error("[compile] wrong input for compileComponent");
  }
  if (contextProps.$width === undefined || contextProps.$width === -1) {
    throw new Error(`assertion failed: incorrect $width in compileComponent: ${contextProps.$width}, component: ${editableElement._id}, ${editableElement._component}`);
  }
  const cachedResult = cache.get(editableElement._id);
  let componentDefinition = findComponentDefinitionById(editableElement._component, compilationContext);
  if (!componentDefinition) {
    componentDefinition = assertDefined(findComponentDefinitionById("@easyblocks/missing-component", compilationContext));
    const error = `Easyblocks can’t find definition for component "${editableElement._component}" in your config. Please contact your developers to resolve this issue.`;
    editableElement = {
      _component: componentDefinition.id,
      _id: uniqueId(),
      error
    };
    console.warn(error);
    parentComponentEditingInfo = undefined;
  }
  const ownProps = createOwnComponentProps({
    config: editableElement,
    contextProps,
    componentDefinition,
    compilationContext
  });
  let hasComponentConfigChanged = true;
  let ownPropsAfterAuto;
  let compiled = {
    _component: editableElement._component,
    _id: editableElement._id,
    props: {},
    components: {},
    styled: {}
  };
  let configAfterAuto;
  let editingInfo;
  let compiledValues = {};
  let subcomponentsContextProps = {};
  let editingContextProps;
  if (cachedResult) {
    hasComponentConfigChanged = !deepCompare(ownProps, cachedResult.values);
    if (!hasComponentConfigChanged) {
      ownPropsAfterAuto = cachedResult.valuesAfterAuto;
      compiledValues = cachedResult.compiledValues;
      compiled = cachedResult.compiledConfig;
      configAfterAuto = deepClone({
        ...cachedResult.valuesAfterAuto.values,
        ...cachedResult.valuesAfterAuto.params
      });
      subcomponentsContextProps = cachedResult.contextProps;
      editingContextProps = cachedResult.editingContextProps;
    }
  }
  addComponentToSerializedComponentDefinitions(editableElement, meta, "components", compilationContext);
  const {
    $width,
    $widthAuto
  } = calculateWidths(compilationContext, contextProps);
  if (hasComponentConfigChanged) {
    // We are going to mutate this object so let's disconnect it from its source object
    ownPropsAfterAuto = deepClone(ownProps);

    /**
     * APPLY AUTO
     */

    const DEFAULT_SPACE_AUTO_CONSTANT = 16;

    // linearize space
    componentDefinition.schema.forEach(schemaProp => {
      if (isSchemaPropTokenized(schemaProp)) {
        ownPropsAfterAuto.values[schemaProp.prop] = applyAutoUsingResponsiveTokens(ownPropsAfterAuto.values[schemaProp.prop], compilationContext);
      }
      if (schemaProp.type === "space") {
        ownPropsAfterAuto.values[schemaProp.prop] = linearizeSpace(ownPropsAfterAuto.values[schemaProp.prop], compilationContext, $width, schemaProp.params?.autoConstant ?? DEFAULT_SPACE_AUTO_CONSTANT);
      }
    });
    itemFieldsForEach(ownPropsAfterAuto.values, compilationContext, arg => {
      let value = arg.itemPropValue;
      if (isSchemaPropTokenized(arg.itemSchemaProp)) {
        value = applyAutoUsingResponsiveTokens(value, compilationContext);
      }
      if (arg.itemSchemaProp.type === "space") {
        value = linearizeSpace(value, compilationContext, $width, arg.itemSchemaProp.params?.autoConstant ?? DEFAULT_SPACE_AUTO_CONSTANT);
      }
      dotNotationSet(ownPropsAfterAuto.values, arg.itemPropPath, value);
    });
    const autoFunction = componentDefinition.auto;
    if (autoFunction) {
      const ownValuesAfterAuto = autoFunction({
        values: ownPropsAfterAuto.values,
        params: {
          ...ownPropsAfterAuto.params,
          $width,
          $widthAuto
        },
        devices: compilationContext.devices
      });
      ownPropsAfterAuto.values = ownValuesAfterAuto;
    }

    // Fill all responsive values. We can assume that values after auto for each breakpoint MUST be defined!!!
    // IMPORTANT: For now we make it realtive to device widths, so Webflow way
    for (const prop in ownPropsAfterAuto.values) {
      ownPropsAfterAuto.values[prop] = responsiveValueFill(ownPropsAfterAuto.values[prop], compilationContext.devices, getDevicesWidths(compilationContext.devices));
    }
    for (const prop in ownPropsAfterAuto.params) {
      ownPropsAfterAuto.params[prop] = responsiveValueFill(ownPropsAfterAuto.params[prop], compilationContext.devices, getDevicesWidths(compilationContext.devices));
    }
    itemFieldsForEach(ownPropsAfterAuto.values, compilationContext, arg => {
      dotNotationSet(ownPropsAfterAuto.values, arg.itemPropPath, responsiveValueFill(arg.itemPropValue, compilationContext.devices, getDevicesWidths(compilationContext.devices)));
    });

    // First we compile all the props and store them in compiledValues
    const _compiledValues = compileComponentValues(ownPropsAfterAuto.values, componentDefinition, compilationContext, cache);
    compiledValues = {
      ...deepClone(ownPropsAfterAuto.values),
      ..._compiledValues
    };

    // Compile item props
    itemFieldsForEach(ownPropsAfterAuto.values, compilationContext, _ref => {
      let {
        itemPropValue,
        itemIndex,
        itemSchemaProp,
        collectionSchemaProp
      } = _ref;
      const compiledValue = compileFromSchema(itemPropValue, itemSchemaProp, compilationContext, cache, {}, meta);
      compiledValues[collectionSchemaProp.prop][itemIndex][itemSchemaProp.prop] = compiledValue;
    });

    // We want to style block element based on the most common values from all text parts within all lines.
    // Only for this component, we compile nested @easyblocks/rich-text-part components values.
    if (editableElement._component === "@easyblocks/rich-text") {
      if (compiledValues.isListStyleAuto) {
        const {
          mainColor = compiledValues.mainColor,
          mainFont = compiledValues.mainFont
        } = compileRichTextValuesFromRichTextParts(editableElement, compilationContext, cache);
        compiledValues.mainColor = mainColor;
        compiledValues.mainFont = mainFont;
      }
      compiledValues.mainFontSize = mapResponsiveFontToResponsiveFontSize(compiledValues.mainFont);
    }
    compiled = {
      ...compiled,
      components: {},
      styled: {}
    };
    const renderableComponentDefinition = componentDefinition;
    if (compilationContext.isEditing) {
      /**
       * Let's build default editingOutput (fields and component output)
       */

      const editorContext = compilationContext;
      editingInfo = buildDefaultEditingInfo(renderableComponentDefinition, configPrefix, editorContext, compiledValues, editableElement._component);

      /**
       * Let's run custom editing function
       */
      if (renderableComponentDefinition.editing) {
        const scalarizedConfig = scalarizeConfig$1(compiledValues, editorContext.breakpointIndex, editorContext.devices, renderableComponentDefinition.schema);
        const identityEditingField = assertDefined(editingInfo.fields.find(f => f.prop === "$myself"));
        const editingInfoWithoutIdentityField = {
          ...editingInfo,
          // Filter out identity field, since it's not users responsibility to care of it.
          fields: editingInfo.fields.filter(f => f.prop !== "$myself")
        };
        const editingInfoInput = convertInternalEditingInfoToEditingInfo(editingInfoWithoutIdentityField, configPrefix);
        const editingInfoResult = renderableComponentDefinition.editing({
          values: scalarizedConfig,
          params: ownPropsAfterAuto.params,
          editingInfo: editingInfoInput,
          device: editorContext.devices.find(device => device.id === editorContext.breakpointIndex),
          ...(componentDefinition.id === "@easyblocks/rich-text" || componentDefinition.id === "@easyblocks/rich-text-part" ? {
            __SECRET_INTERNALS__: {
              pathPrefix: configPrefix,
              editorContext
            }
          } : {})
        });
        if (editingInfoResult) {
          const internalEditingInfo = convertEditingInfoToInternalEditingInfo(editingInfoResult, editingInfo, componentDefinition, editorContext, configPrefix);
          internalEditingInfo.fields?.unshift(identityEditingField);
          deepObjectMergeWithoutArrays(editingInfo, internalEditingInfo);
        }
      }

      /**
       * Save to __editing
       */

      applyEditingInfoToCompiledConfig(compiled, editingInfo, parentComponentEditingInfo, {
        width: $width,
        auto: $widthAuto
      });
      editingContextProps = editingInfo.components;
    }
    const {
      props,
      components,
      styled
    } = resop2({
      values: compiledValues,
      params: ownPropsAfterAuto.params
    }, (_ref2, breakpointIndex) => {
      let {
        values,
        params
      } = _ref2;
      if (!renderableComponentDefinition.styles) {
        return {};
      }
      const device = assertDefined(compilationContext.devices.find(device => device.id === breakpointIndex), `Missing device "${breakpointIndex}"`);
      const stylesInput = {
        values,
        params: {
          ...params,
          $width: assertDefined(responsiveValueAt($width, breakpointIndex)),
          $widthAuto: assertDefined(responsiveValueAt($widthAuto, breakpointIndex))
        },
        isEditing: !!compilationContext.isEditing,
        device,
        ...(componentDefinition.id === "@easyblocks/rich-text-part" ? {
          __COMPILATION_CONTEXT__: compilationContext
        } : {})
      };
      return renderableComponentDefinition.styles(stylesInput);
    }, compilationContext.devices, renderableComponentDefinition);
    validateStylesProps(props, componentDefinition);
    subcomponentsContextProps = components;

    // Move all the boxes to _compiled
    for (const key in styled) {
      let styles = styled[key];
      if (Array.isArray(styles)) {
        styles = styles.map(v => {
          return {
            ...v,
            __isBox: true
          };
        });
      } else {
        styles = {
          ...styles,
          __isBox: true
        };
      }
      const schemaProp = componentDefinition.schema.find(x => x.prop === key);

      // Context props processed below
      if (schemaProp) {
        continue;
      }

      // If box

      compiled.styled[key] = compileBoxes(styles, compilationContext);
    }
    componentDefinition.schema.forEach(schemaProp => {
      if ("buildOnly" in schemaProp && schemaProp.buildOnly) {
        return;
      }
      if (isExternalSchemaProp(schemaProp, compilationContext.types) || schemaProp.type === "text") {
        // We simply copy ONLY the breakpoints which are defined in the raw data
        compiled.props[schemaProp.prop] = Object.fromEntries(Object.keys(editableElement[schemaProp.prop]).map(deviceId => {
          return [deviceId, compiledValues[schemaProp.prop][deviceId]];
        }));
      } else {
        compiled.props[schemaProp.prop] = responsiveValueNormalize$1(compiledValues[schemaProp.prop], compilationContext.devices);
      }
    });

    // we also add __props to props
    compiled.props = {
      ...props,
      ...compiled.props
    };

    // We are going to mutate this object so let's disconnect it from its source object
    configAfterAuto = deepClone({
      ...ownPropsAfterAuto.values,
      ...ownPropsAfterAuto.params
    });
  }
  if (compilationContext.isEditing) {
    /**
     * Let's build default editingOutput (fields and component output)
     */

    const editorContext = compilationContext;
    const renderableComponentDefinition = componentDefinition;
    editingInfo = buildDefaultEditingInfo(renderableComponentDefinition, configPrefix, editorContext, compiledValues, editableElement._component);

    /**
     * Let's run custom editing function
     */
    if (renderableComponentDefinition.editing) {
      const scalarizedValues = scalarizeConfig$1(compiledValues, editorContext.breakpointIndex, editorContext.devices, renderableComponentDefinition.schema);
      const identityEditingField = assertDefined(editingInfo.fields.find(f => f.prop === "$myself"));
      const editingInfoWithoutIdentityField = {
        ...editingInfo,
        // Filter out identity field, since it's not users responsibility to care of it.
        fields: editingInfo.fields.filter(f => f.prop !== "$myself")
      };
      const editingInfoInput = convertInternalEditingInfoToEditingInfo(editingInfoWithoutIdentityField, configPrefix);
      const editingInfoResult = renderableComponentDefinition.editing({
        values: scalarizedValues,
        params: ownPropsAfterAuto.params,
        editingInfo: editingInfoInput,
        device: editorContext.devices.find(device => device.id === editorContext.breakpointIndex),
        ...(componentDefinition.id === "@easyblocks/rich-text" || componentDefinition.id === "@easyblocks/rich-text-part" ? {
          __SECRET_INTERNALS__: {
            pathPrefix: configPrefix,
            editorContext
          }
        } : {})
      });
      if (editingInfoResult) {
        const internalEditingInfo = convertEditingInfoToInternalEditingInfo(editingInfoResult, editingInfo, componentDefinition, editorContext, configPrefix);
        internalEditingInfo.fields?.unshift(identityEditingField);
        deepObjectMergeWithoutArrays(editingInfo, internalEditingInfo);
      }
    }
    if (editingInfo)
      // Save to __editing
      applyEditingInfoToCompiledConfig(compiled, editingInfo, parentComponentEditingInfo, {
        width: $width,
        auto: $widthAuto
      });
    editingContextProps = editingInfo.components;
  }
  compileSubcomponents(editableElement, contextProps, subcomponentsContextProps, compilationContext, meta, editingContextProps, configPrefix, compiled, configAfterAuto, cache);
  cache.set(ownProps.values._id, {
    values: ownProps,
    valuesAfterAuto: ownPropsAfterAuto,
    compiledValues,
    compiledConfig: compiled,
    contextProps: subcomponentsContextProps,
    editingContextProps
  });
  if (process.env.SHOPSTORY_INTERNAL_COMPILATION_DEBUG === "true") {
    logCompilationDebugOutput({
      cachedResult,
      hasComponentConfigChanged,
      configPrefix,
      ownProps,
      compiled
    });
  }
  return {
    compiledComponentConfig: compiled,
    configAfterAuto
  };
}
function validateStylesProps(props, componentDefinition) {
  for (const key of Object.keys(props)) {
    const schemaProp = componentDefinition.schema.find(s => s.prop === key);
    if (!schemaProp || !("buildOnly" in schemaProp)) {
      continue;
    }
    if (!schemaProp.buildOnly) {
      throw new Error(`You've returned property "${key}" in "props" object that conflicts with the same prop in schema of component "${componentDefinition.id}". You can either change the property name or set the schema property as build-only (\`buildOnly: true\`).`);
    }
  }
}
function logCompilationDebugOutput(_ref3) {
  let {
    cachedResult,
    hasComponentConfigChanged,
    configPrefix,
    ownProps,
    compiled
  } = _ref3;
  if (cachedResult && !hasComponentConfigChanged) {
    console.groupCollapsed("[cache] ", configPrefix ? configPrefix : "root");
  } else {
    console.groupCollapsed("[compiled] ", configPrefix ? configPrefix : "root");
  }
  console.log(ownProps);
  console.log(compiled);
  console.groupEnd();
}
function createOwnComponentProps(_ref4) {
  let {
    config,
    contextProps,
    componentDefinition,
    compilationContext
  } = _ref4;
  // Copy all values and refs defined in schema, for component fields copy only _id, _component and its _itemProps but flattened
  const values = Object.fromEntries(componentDefinition.schema.map(schemaProp => {
    if (isSchemaPropComponentOrComponentCollection(schemaProp)) {
      let configValue = config[schemaProp.prop];
      if (configValue.length === 0) {
        return [schemaProp.prop, []];
      }
      if (isSchemaPropComponent(schemaProp)) {
        return [schemaProp.prop, [{
          _id: configValue[0]._id,
          _component: configValue[0]._component
        }]];
      }
      if (isSchemaPropComponentCollectionLocalised(schemaProp)) {
        configValue = resolveLocalisedValue$1(config[schemaProp.prop], compilationContext)?.value ?? [];
      }
      const configValuesWithFlattenedItemProps = configValue.map(config => {
        if (schemaProp.itemFields) {
          const flattenedItemProps = flattenItemProps(config, componentDefinition, schemaProp, schemaProp.itemFields);
          return {
            _id: config._id,
            _component: config._component,
            ...flattenedItemProps
          };
        }
        return {
          _id: config._id,
          _component: config._component
        };
      });
      return [schemaProp.prop, configValuesWithFlattenedItemProps];
    }
    return [schemaProp.prop, config[schemaProp.prop]];
  }));
  const ownValues = {
    // Copy id and component which uniquely identify component.
    _id: config._id,
    _component: config._component,
    ...values
  };
  return {
    values: ownValues,
    params: contextProps
  };
}
function flattenItemProps(config, componentDefinition, collectionSchemaProp, itemsSchemas) {
  const itemProps = Object.fromEntries(itemsSchemas.map(itemSchemaProp => {
    return [itemSchemaProp.prop, config._itemProps[componentDefinition.id][collectionSchemaProp.prop][itemSchemaProp.prop]];
  }));
  return itemProps;
}
function addComponentToSerializedComponentDefinitions(component, meta, componentType, compilationContext) {
  const definitions = meta.vars.definitions[componentType];
  if (definitions.find(def => def.id === component._component)) {
    return;
  }
  const internalDefinition = findComponentDefinition(component, compilationContext);
  const newDef = {
    id: internalDefinition.id,
    label: internalDefinition.label,
    schema: internalDefinition.schema,
    type: internalDefinition.type
  };
  if (compilationContext.isEditing) {
    newDef.pasteSlots = internalDefinition.pasteSlots ?? [];
  }
  definitions.push(newDef);
}
function compileSubcomponents(editableElement, contextProps, subcomponentsContextProps, compilationContext, meta, editingInfoComponents, configPrefix, compiledComponentConfig, configAfterAuto,
// null means that we don't want auto
cache) {
  const componentDefinition = findComponentDefinition(editableElement, compilationContext);
  componentDefinition.schema.forEach(schemaProp => {
    if (isSchemaPropComponentOrComponentCollection(schemaProp)) {
      // Currently these are processed outside of compileSubcomponents
      if (isSchemaPropActionTextModifier(schemaProp) || isSchemaPropTextModifier(schemaProp)) {
        return;
      }
      const childContextProps = subcomponentsContextProps[schemaProp.prop] || {};

      // Subcomponents must always have $width and $widthAuto defined. If wasn't set explicitly then parent's one is used.
      childContextProps.$width = childContextProps.$width ?? contextProps.$width;
      childContextProps.$widthAuto = childContextProps.$widthAuto ?? contextProps.$widthAuto;
      if (schemaProp.type === "component-collection" || schemaProp.type === "component-collection-localised") {
        childContextProps.itemProps = childContextProps.itemProps ?? [];
        let value;
        if (schemaProp.type === "component-collection") {
          value = editableElement[schemaProp.prop];
        } else {
          const resolvedValue = resolveLocalisedValue$1(editableElement[schemaProp.prop], compilationContext);
          if (!resolvedValue) {
            throw new Error(`Can't resolve localised value for prop "${schemaProp.prop}" of component ${editableElement._component}`);
          }
          value = resolvedValue.value;
        }
        value.forEach((_, index) => {
          childContextProps.itemProps[index] = childContextProps.itemProps[index] ?? {};
          const itemPropContextProps = childContextProps.itemProps[index];
          itemPropContextProps.$width = itemPropContextProps.$width ?? contextProps.$width;
          itemPropContextProps.$widthAuto = itemPropContextProps.$widthAuto ?? contextProps.$widthAuto;
        });
      }
      const compilationOutput = compileFromSchema(editableElement[schemaProp.prop], schemaProp, compilationContext, cache, childContextProps, meta, editingInfoComponents?.[schemaProp.prop], `${configPrefix}${configPrefix === "" ? "" : "."}${schemaProp.prop}`);
      compiledComponentConfig.components[schemaProp.prop] = compilationOutput.map(compilationOutput => compilationOutput.compiledComponentConfig);

      // Merge config after auto
      if (compilationContext.isEditing && configAfterAuto !== null) {
        if (schemaProp.type === "component") {
          configAfterAuto[schemaProp.prop] = [compilationOutput[0]?.configAfterAuto ?? []];
        } else if (schemaProp.type === "component-collection" || schemaProp.type === "component-collection-localised") {
          const configsAfterAuto = compilationOutput.map((compilationOutput, index) => {
            if (schemaProp.itemFields) {
              const itemPropsCollectionPath = `_itemProps.${editableElement._component}.${schemaProp.prop}`;
              const itemProps = Object.fromEntries(schemaProp.itemFields.map(itemSchemaProp => {
                const itemPropValue = configAfterAuto[schemaProp.prop][index][itemSchemaProp.prop];
                return [itemSchemaProp.prop, itemPropValue];
              }));
              dotNotationSet(compilationOutput.configAfterAuto, itemPropsCollectionPath, itemProps);
            }
            return compilationOutput.configAfterAuto;
          });
          if (schemaProp.type === "component-collection-localised") {
            // We store after auto config within context of current locale only
            configAfterAuto[schemaProp.prop] = {
              [compilationContext.contextParams.locale]: configsAfterAuto
            };
          } else {
            configAfterAuto[schemaProp.prop] = configsAfterAuto;
          }
        }
      }
    }
  });
}
function calculateWidths(compilationContext, contextProps) {
  const $width = {
    $res: true
  };
  const $widthAuto = {
    $res: true
  };
  compilationContext.devices.forEach(device => {
    $width[device.id] = contextProps.$width?.[device.id] ?? -1;
    $widthAuto[device.id] = contextProps.$widthAuto?.[device.id] ?? ($width[device.id] === -1 ? true : false);
  });
  return {
    $width,
    $widthAuto
  };
}
function itemFieldsForEach(config, compilationContext, callback) {
  const componentDefinition = findComponentDefinition(config, compilationContext);
  componentDefinition.schema.forEach(schemaProp => {
    if (isSchemaPropCollection(schemaProp)) {
      const itemFields = schemaProp.itemFields;
      let path = schemaProp.prop;
      if (schemaProp.type === "component-collection-localised") {
        const localizedValue = resolveLocalisedValue$1(config[schemaProp.prop], compilationContext);
        if (localizedValue) {
          path = `${path}.${localizedValue.locale}`;
        } else {
          path = `${path}.${compilationContext.contextParams.locale}`;
        }
      }
      const value = dotNotationGet(config, path) ?? [];
      value.forEach((_, index) => {
        if (itemFields) {
          itemFields.forEach(itemSchemaProp => {
            const itemPath = `${path}.${index}.${itemSchemaProp.prop}`;
            const itemValue = dotNotationGet(config, itemPath);
            callback({
              collectionSchemaProp: schemaProp,
              itemIndex: index,
              itemSchemaProp,
              itemPropPath: itemPath,
              itemPropValue: itemValue
            });
          });
        }
      });
    }
  });
}
function resolveLocalisedValue$1(localisedValue, compilationContext) {
  const locale = compilationContext.contextParams.locale;
  if (localisedValue[locale] !== undefined) {
    return {
      value: localisedValue[locale],
      locale
    };
  }
  const fallbackLocale = getFallbackLocaleForLocale(locale, compilationContext.locales);
  if (!fallbackLocale) {
    return;
  }
  return {
    value: localisedValue[fallbackLocale],
    locale: fallbackLocale
  };
}
function buildDefaultEditingInfo(definition, configPrefix, editorContext, compiledValues, templateId) {
  const scalarizedConfig = scalarizeConfig$1(compiledValues, editorContext.breakpointIndex, editorContext.devices, definition.schema);
  const schema = [...definition.schema];
  let defaultFields = schema
  // Right now, component-collection schema prop isn't shown in the sidebar
  .filter(schemaProp => !isSchemaPropCollection(schemaProp)).filter(schemaProp => {
    if (compiledValues.noTrace && schemaProp.prop.startsWith("trace")) {
      return false;
    }
    return true;
  }).map(schemaProp => getDefaultFieldDefinition(schemaProp, configPrefix, definition, editorContext, scalarizedConfig));

  // noAction is a special property
  if (compiledValues.noAction) {
    defaultFields = defaultFields.filter(field => field.path !== "action");
  }
  const pathInfo = parsePath(configPrefix, editorContext.form);
  const parentInfo = pathInfo.parent;
  if (parentInfo) {
    const parentDefinition = findComponentDefinitionById(parentInfo.templateId, editorContext);
    if (!parentDefinition) {
      throw new Error(`Can't find parent definition: ${parentInfo.templateId}`);
    }
    const parentSchemaProp = parentDefinition.schema.find(schemaProp => schemaProp.prop === parentInfo.fieldName);
    if (!parentSchemaProp) {
      throw new Error(`Can't find parent schemaProp: ${parentInfo.templateId} > ${parentInfo.fieldName}`);
    }
    let required;
    if (parentSchemaProp.type === "component") {
      required = !!parentSchemaProp.required;
    } else {
      required = false;
    }
    const headerSchemaProp = {
      prop: "$myself",
      label: "Component type",
      type: "component$$$",
      picker: parentSchemaProp.picker,
      definition: parentDefinition,
      required,
      group: "Component"
    };
    const headerField = {
      component: "identity",
      hidden: false,
      label: "Component type",
      name: configPrefix,
      prop: "$myself",
      schemaProp: headerSchemaProp
    };
    defaultFields.unshift(headerField);
  } else {
    const rootComponentDefinition = assertDefined(findComponentDefinitionById(dotNotationGet(editorContext.form.values, "")._component, editorContext));
    const headerSchemaProp = {
      prop: "$myself",
      label: "Component type",
      type: "component$$$",
      definition: rootComponentDefinition,
      required: true,
      group: "Component"
    };
    const headerField = {
      component: "identity",
      hidden: false,
      label: "Component type",
      name: "",
      prop: "$myself",
      schemaProp: headerSchemaProp
    };
    defaultFields.unshift(headerField);
  }
  const fields = bubbleDown(x => x.prop === "Analytics", defaultFields);
  const editingInfo = {
    fields,
    components: {}
  };
  definition.schema.forEach(schemaProp => {
    if (isSchemaPropCollection(schemaProp)) {
      editingInfo.components[schemaProp.prop] = {
        items: scalarizedConfig[schemaProp.prop].map((x, index) => ({
          fields: (schemaProp.itemFields ?? []).map(itemSchemaProp => getDefaultFieldDefinition(itemSchemaProp, `${configPrefix}${configPrefix === "" ? "" : "."}${schemaProp.prop}.${index}._itemProps.${definition.id}.${schemaProp.prop}`, definition, editorContext, scalarizedConfig))
        }))
      };
    } else if (isSchemaPropComponent(schemaProp)) {
      editingInfo.components[schemaProp.prop] = {
        fields: []
      };
    }
  });
  return editingInfo;
}
function applyEditingInfoToCompiledConfig(compiledComponentConfig, editingInfo, parentEditingInfo, widthInfo) {
  const headerFields = editingInfo.fields.filter(field => field.prop === "$myself");
  const nonHeaderFields = editingInfo.fields.filter(field => field.prop !== "$myself");
  const fields = [...headerFields, ...(parentEditingInfo && "fields" in parentEditingInfo ? parentEditingInfo.fields : []), ...nonHeaderFields];
  compiledComponentConfig.__editing = {
    ...parentEditingInfo,
    fields,
    components: {},
    widthInfo
  };
  for (const fieldName in editingInfo.components) {
    compiledComponentConfig.__editing.components[fieldName] = {};
    const childComponentEditingInfo = editingInfo.components[fieldName];

    // Here we copy only noInline. It's the only flag we need in parent component. It's only because we need noInline info even if there is no component in array (to know that we shouldn't render placeholder)
    if ("noInline" in childComponentEditingInfo && childComponentEditingInfo.noInline !== undefined) {
      compiledComponentConfig.__editing.components[fieldName].noInline = childComponentEditingInfo.noInline;
    }
  }
}
const deepObjectMergeWithoutArrays = (target, source) => {
  // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) Object.assign(source[key], deepObjectMergeWithoutArrays(target[key], source[key]));
  }

  // Join `target` and modified `source`
  Object.assign(target || {}, source);
  return target;
};
function compileRichTextValuesFromRichTextParts(richTextConfig, compilationContext, cache) {
  const mainColor = getMostCommonValueFromRichTextParts(richTextConfig, "color", compilationContext, cache);
  const mainFont = getMostCommonValueFromRichTextParts(richTextConfig, "font", compilationContext, cache);
  return {
    mainColor,
    mainFont
  };
}
function mapResponsiveFontToResponsiveFontSize(responsiveFontValue) {
  return Object.fromEntries(entries(responsiveFontValue).map(_ref5 => {
    let [breakpoint, fontValue] = _ref5;
    if (breakpoint === "$res") {
      return [breakpoint, fontValue];
    }
    return [breakpoint, fontValue.fontSize];
  }));
}
function addStylesHash(styles) {
  if ("__hash" in styles) {
    delete styles["__hash"];
  }
  const hash = jsXxhash.xxHash32(JSON.stringify(styles));
  styles.__hash = hash.toString();
  return styles;
}
function compileBoxes(value, compilationContext) {
  if (Array.isArray(value)) {
    return value.map(x => compileBoxes(x, compilationContext));
  } else if (typeof value === "object" && value !== null) {
    if (value.__isBox) {
      return addStylesHash(compileBox(value, compilationContext.devices));
    }
    const ret = {};
    for (const key in value) {
      ret[key] = compileBoxes(value[key], compilationContext);
    }
    return ret;
  }
  return value;
}
function getDefaultFieldDefinition(schemaProp, configPrefix, definition, editorContext, compiledValues, templateId) {
  const tinaField = getTinaField({
    ...schemaProp,
    definition
  }, editorContext, compiledValues[schemaProp.prop]);
  let visible = !isSchemaPropComponentOrComponentCollection(schemaProp);
  if (typeof schemaProp.visible === "boolean") {
    visible = schemaProp.visible;
  } else if (typeof schemaProp.visible === "function") {
    visible = schemaProp.visible(compiledValues, {
      editorContext
    });
  }
  return {
    ...tinaField,
    prop: schemaProp.prop,
    name: createFieldName(schemaProp, configPrefix),
    hidden: !visible
  };
}
function createFieldName(schemaProp, configPrefix) {
  return schemaProp.prop === "$myself" ? configPrefix : `${configPrefix}${configPrefix === "" ? "" : "."}${schemaProp.prop}`;
}
function convertInternalEditingInfoToEditingInfo(editingInfo, configPrefix) {
  const fields = editingInfo.fields.map(f => {
    return convertInternalEditingFieldToEditingInfoField(f, configPrefix);
  });
  const components = Object.fromEntries(Object.entries(editingInfo.components).map(_ref6 => {
    let [name, childEditingInfo] = _ref6;
    if ("items" in childEditingInfo) {
      const adaptedChildEditingInfo = childEditingInfo.items.map(item => {
        return {
          fields: item.fields.map(f => convertInternalEditingFieldToEditingInfoField(f, configPrefix)),
          direction: item.direction,
          selectable: item.noInline
        };
      });
      return [name, adaptedChildEditingInfo];
    }
    return [name, {
      fields: childEditingInfo.fields.map(f => convertInternalEditingFieldToEditingInfoField(f, configPrefix)),
      direction: childEditingInfo.direction,
      selectable: childEditingInfo.noInline
    }];
  }));
  return {
    fields,
    components
  };
}
function convertInternalEditingFieldToEditingInfoField(field, configPrefix) {
  const path = field.schemaProp.prop === "$myself" ? field.schemaProp.prop : toRelativeFieldPath(field.name, configPrefix);
  return {
    path,
    type: "field",
    visible: typeof field.hidden === "boolean" ? !field.hidden : true,
    group: field.group,
    label: field.label
  };
}
function toRelativeFieldPath(path, configPrefix) {
  let adjustedPath = path;
  if (path.includes("_itemProps")) {
    const pathFragments = path.split(".");
    const itemPropsFragmentIndex = pathFragments.indexOf("_itemProps");
    const adjustedPathFragments = [...pathFragments.slice(0, itemPropsFragmentIndex), pathFragments.at(-1)];
    adjustedPath = adjustedPathFragments.join(".");
  }
  return configPrefix ? adjustedPath.replace(`${configPrefix}.`, "") : adjustedPath;
}
function convertEditingInfoToInternalEditingInfo(editingInfo, internalEditingInfo, componentDefinition, editorContext, configPrefix) {
  let internalEditingInfoFields;
  if (editingInfo.fields) {
    if (!internalEditingInfoFields) {
      internalEditingInfoFields = [];
    }
    for (const field of editingInfo.fields) {
      const internalEditingInfoField = convertEditingFieldToInternalEditingField(field, internalEditingInfo, componentDefinition, editorContext, configPrefix);
      internalEditingInfoFields.push(internalEditingInfoField);
    }
  }
  let internalEditingInfoComponents;
  if (editingInfo.components) {
    internalEditingInfoComponents = {};
    for (const [name, childEditingInfo] of Object.entries(editingInfo.components)) {
      const sourceInternalEditingInfoComponent = internalEditingInfo.components[name];
      if (!sourceInternalEditingInfoComponent) {
        throw new Error(`Found component at path ${configPrefix} but it's not defined in the schema`);
      }
      if (Array.isArray(childEditingInfo)) {
        internalEditingInfoComponents[name] = {
          items: childEditingInfo.map((editingInfoItem, index) => {
            const sourceInternalFields = sourceInternalEditingInfoComponent.items[index].fields;
            const internalFields = editingInfoItem.fields?.map(field => {
              const internalEditingInfoField = convertEditingFieldToInternalEditingField(field, internalEditingInfo, componentDefinition, editorContext, configPrefix);
              return internalEditingInfoField;
            });
            const result = {
              fields: internalFields ?? sourceInternalFields
            };
            if (editingInfoItem.direction) {
              result.direction = editingInfoItem.direction;
            }
            if (editingInfoItem.selectable !== undefined) {
              result.noInline = !editingInfoItem.selectable;
            }
            return result;
          })
        };
      } else {
        const result = {};
        if (childEditingInfo.fields) {
          result.fields = childEditingInfo.fields.map(field => {
            const internalEditingInfoField = convertEditingFieldToInternalEditingField(field, internalEditingInfo, componentDefinition, editorContext, configPrefix);
            return internalEditingInfoField;
          });
        }
        if (childEditingInfo.direction) {
          result.direction = childEditingInfo.direction;
        }
        if (childEditingInfo.selectable !== undefined) {
          result.noInline = !childEditingInfo.selectable;
        }
        internalEditingInfoComponents[name] = result;
      }
    }
  }
  const result = {};
  if (internalEditingInfoFields) {
    result.fields = internalEditingInfoFields;
  }
  if (internalEditingInfoComponents) {
    result.components = internalEditingInfoComponents;
  }
  return result;
}
function convertEditingFieldToInternalEditingField(field, internalEditingInfo, componentDefinition, editorContext, configPrefix) {
  if (componentDefinition.id === "@easyblocks/rich-text" || componentDefinition.id === "@easyblocks/rich-text-part") {
    // This is a special case. Rich text components have a really nasty `editing` function implementation
    // relying on `editorContext`, absolute paths and multi field portals. Ideally it would best to address this,
    // but right now let's keep it as it is and treat it like an exception

    // Even though the type definition for field doesn't allow `path` to be an array, $richText component
    // returns an array of paths.
    if (Array.isArray(field.path)) {
      const fieldName = field.path[0]?.split(".").at(-1) ?? raiseError("Expected field name to be present");
      const sources = field.path.map(p => p.split(".").slice(0, -1).join("."));
      return {
        portal: "multi-field",
        fieldName,
        sources
      };
    }
    const isAbsolutePath = isFieldPathAbsolutePath(field, editorContext);
    if (isAbsolutePath) {
      if (field.type === "fields") {
        const groups = field.filters?.group ? toArray(field.filters.group) : undefined;
        return {
          portal: "component",
          source: field.path,
          groups
        };
      }
      const pathFragments = field.path.split(".");
      const fieldName = pathFragments.at(-1) ?? raiseError("Expected field name to be present");
      const source = pathFragments.slice(0, -1).join(".");
      return {
        portal: "field",
        source,
        fieldName
      };
    }
  }
  if (field.type === "field") {
    let sourceInternalEditingInfoField = internalEditingInfo.fields.find(f => {
      return f.name === toAbsolutePath(field.path, configPrefix) || field.path === "$myself";
    });
    if (!sourceInternalEditingInfoField) {
      const pathFragments = field.path.split(".");
      const isPathToComponentField = pathFragments.length > 1;
      if (isPathToComponentField) {
        const componentSchemaProp = componentDefinition.schema.find(isSchemaPropComponentOrComponentCollection);
        if (componentSchemaProp) {
          if (isSchemaPropCollection(componentSchemaProp)) {
            const itemField = componentSchemaProp.itemFields?.find(f => f.prop === pathFragments.at(-1));
            if (itemField) {
              const componentItemIndex = +pathFragments[1];
              sourceInternalEditingInfoField = internalEditingInfo.components[componentSchemaProp.prop].items[componentItemIndex].fields.find(f => f.prop === itemField.prop);
            }
          }
          if (componentSchemaProp.type === "component" && componentSchemaProp.required) {
            const absoluteFieldPath = toAbsolutePath(pathFragments.slice(0, -1).join("."), configPrefix);
            const overrides = {};
            if (field.label !== undefined) {
              overrides.label = field.label;
            }
            if (field.group !== undefined) {
              overrides.group = field.group;
            }
            return {
              portal: "field",
              fieldName: pathFragments.at(-1),
              source: absoluteFieldPath,
              overrides
            };
          }
        }
      }
      if (!sourceInternalEditingInfoField) {
        throw new Error(`Field "${field.path}" for component "${componentDefinition.id}" not found.`);
      }
    }
    return {
      ...sourceInternalEditingInfoField,
      label: field.label,
      group: field.group,
      hidden: !field.visible
    };
  }
  if (field.type === "fields") {
    const absoluteFieldPath = toAbsolutePath(field.path, configPrefix);
    return {
      portal: "component",
      source: absoluteFieldPath,
      ...(field.filters?.group !== undefined && {
        groups: toArray(field.filters.group)
      })
    };
  }
  throw new Error(`Unknown field type`);
}
function isFieldPathAbsolutePath(field, editorContext) {
  const pathFragments = field.path.split(".");
  const rootValue = dotNotationGet(editorContext.form.values, "");
  let currentPathFragmentIndex = 0;
  let currentValue = dotNotationGet(rootValue, pathFragments[currentPathFragmentIndex]);
  while (currentValue !== undefined) {
    if (pathFragments.length - 1 === currentPathFragmentIndex) {
      return true;
    }
    currentValue = dotNotationGet(currentValue, pathFragments[++currentPathFragmentIndex]);
  }
  return false;
}
function toAbsolutePath(path, configPrefix) {
  if (configPrefix) {
    return `${configPrefix}.${path}`;
  }
  return path;
}
function isSchemaPropTokenized(schemaProp) {
  return schemaProp.type === "color" || schemaProp.type === "space" || schemaProp.type === "font" || schemaProp.type === "aspectRatio" || schemaProp.type === "boxShadow" || schemaProp.type === "containerWidth";
}

const textProvider = (schemaProp, compilationContext) => {
  const checkIfValid = x => {
    if (typeof x !== "object" || x === null) {
      return false;
    }
    if (typeof x.id === "string") {
      if (x.id.startsWith("local.")) {
        // for local values "value" must be object
        if (typeof x.value !== "object" || x.value === null) {
          return false;
        }
      }
    }
    return true;
  };
  return {
    normalize: x => {
      if (x === undefined || x === null) {
        return {
          id: "local." + uniqueId(),
          value: {
            [compilationContext.contextParams.locale]: schemaProp.defaultValue ?? "Lorem ipsum"
          },
          widgetId: "@easyblocks/local-text"
        };
      }
      if (checkIfValid(x)) {
        return x;
      }
      throw new Error(`incorrect text type: ${x}`);
    },
    compile: x => {
      if ("value" in x) {
        const value = x.value[compilationContext.contextParams.locale];

        // Let's apply fallback
        if (typeof value !== "string") {
          const fallbackValue = getFallbackForLocale(x.value, compilationContext.contextParams.locale, compilationContext.locales) ?? "";
          return {
            id: x.id,
            value: fallbackValue,
            widgetId: "@easyblocks/local-text"
          };
        }
        return {
          id: x.id,
          value,
          widgetId: "@easyblocks/local-text"
        };
      }
      return {
        id: x.id,
        widgetId: x.widgetId,
        ...(x.id !== null && {
          key: x.key
        })
      };
    },
    getHash: value => {
      // TODO: those conditions will be removed after we merge external-local texts update
      if (typeof value === "string") {
        return value;
      }
      if (value === null) {
        return undefined;
      }
      return value.id ?? undefined;
    }
  };
};
const schemaPropDefinitions = {
  text: textProvider,
  number: (schemaProp, compilationContext) => {
    const normalize = getNormalize(compilationContext, schemaProp.defaultValue, 0, x => typeof x === "number" ? x : undefined);
    return {
      normalize,
      compile: x => x,
      getHash: value => {
        return value.toString();
      }
    };
  },
  string: (schemaProp, compilationContext) => {
    const normalize = schemaProp.responsive ? getResponsiveNormalize(compilationContext, schemaProp.defaultValue, "", x => typeof x === "string" ? x : undefined) : getNormalize(compilationContext, schemaProp.defaultValue, "", x => typeof x === "string" ? x : undefined);
    return {
      normalize,
      compile: x => x,
      getHash: (value, breakpointIndex) => {
        if (isTrulyResponsiveValue$1(value)) {
          return responsiveValueAt(value, breakpointIndex);
        }
        return value;
      }
    };
  },
  boolean: (schemaProp, compilationContext) => {
    const normalize = schemaProp.responsive ? getResponsiveNormalize(compilationContext, schemaProp.defaultValue, false, x => typeof x === "boolean" ? x : undefined) : getNormalize(compilationContext, schemaProp.defaultValue, false, x => typeof x === "boolean" ? x : undefined);
    return {
      normalize,
      compile: x => x,
      getHash: (value, breakpointIndex) => {
        if (isTrulyResponsiveValue$1(value)) {
          const breakpointValue = responsiveValueAt(value, breakpointIndex);
          return breakpointValue?.toString();
        }
        return value.toString();
      }
    };
  },
  select: getSelectSchemaPropDefinition(),
  "radio-group": getSelectSchemaPropDefinition(),
  component: (schemaProp, compilationContext) => {
    // Here:
    // 1. if non-fixed => block field.
    // 2. if fixed => block field with "fixed" flag (no component picker).
    const normalize = x => {
      if (!Array.isArray(x) || x.length === 0) {
        let componentDefinition;
        for (const componentIdOrType of schemaProp.accepts) {
          componentDefinition = findComponentDefinitionById(componentIdOrType, compilationContext);
          if (!componentDefinition) {
            const componentDefinitionsByType = findComponentDefinitionsByType(componentIdOrType, compilationContext);
            if (componentDefinitionsByType.length > 0) {
              componentDefinition = componentDefinitionsByType[0];
              break;
            }
          } else {
            break;
          }
        }
        if (schemaProp.required) {
          if (!componentDefinition) {
            throw new Error(`Missing component definition for prop "${schemaProp.prop}" for specified accepted types: [${schemaProp.accepts.join(", ")}]`);
          }
          return [normalizeComponent({
            _component: componentDefinition.id
          }, compilationContext)];
        }
        return [];
      }
      return [normalizeComponent(x[0], compilationContext)];
    };
    return {
      normalize,
      compile: (arg, contextProps, serializedDefinitions, editingInfoComponent, configPrefix, cache) => {
        if (arg.length === 0) {
          return [];
        }

        // FIXME: ?????
        const {
          configAfterAuto,
          compiledComponentConfig
        } = compileComponent(arg[0], compilationContext, contextProps, serializedDefinitions || {
          components: []
        }, cache, editingInfoComponent, `${configPrefix}.0`);
        return [{
          configAfterAuto,
          compiledComponentConfig
        }];
      },
      getHash: value => {
        if (value.length > 0) {
          // For now, if the block's value contains elements, it will only contain single element
          if (process.env.NODE_ENV === "development") {
            console.assert(value.length === 1, "component prop should have only one element");
          }
          return value[0]._component;
        }
        return "__BLOCK_EMPTY__";
      }
    };
  },
  "component-collection": (_, compilationContext) => {
    const normalize = x => {
      if (!Array.isArray(x)) {
        return [];
      }
      const ret = (x || []).map(item => normalizeComponent(item, compilationContext));
      return ret;
    };
    return {
      normalize,
      compile: (arr, contextProps, serializedDefinitions, editingInfoComponents, configPrefix, cache) => {
        return arr.map((componentConfig, index) => compileComponent(componentConfig, compilationContext, (contextProps.itemProps || [])[index] || {}, serializedDefinitions, cache, editingInfoComponents?.items?.[index], `${configPrefix}.${index}`));
      },
      getHash: value => {
        return value.map(v => v._component).join(";");
      }
    };
  },
  "component-collection-localised": (schemaProp, compilationContext) => {
    const collectionSchemaPropDefinition = schemaPropDefinitions["component-collection"]({
      ...schemaProp,
      type: "component-collection"
    }, compilationContext);
    return {
      normalize: x => {
        if (x === undefined) {
          return {};
        }
        const normalized = {};
        for (const locale in x) {
          if (locale === "__fallback") {
            continue;
          }
          normalized[locale] = collectionSchemaPropDefinition.normalize(x[locale]);
        }
        return normalized;
      },
      compile: (value, contextProps, serializedDefinitions, editingInfoComponents, configPrefix, cache) => {
        const resolvedLocalisedValue = resolveLocalisedValue(value, compilationContext);
        return collectionSchemaPropDefinition.compile(resolvedLocalisedValue?.value ?? [], contextProps, serializedDefinitions, editingInfoComponents, `${configPrefix}.${resolvedLocalisedValue?.locale ?? compilationContext.contextParams.locale}`, cache);
      },
      getHash: (value, breakpoint, devices) => {
        return collectionSchemaPropDefinition.getHash(value[compilationContext.contextParams.locale] ?? [], breakpoint, devices);
      }
    };
  },
  component$$$: () => {
    return {
      normalize: x => x,
      compile: x => x,
      getHash: x => x._component
    };
  },
  // external: (schemaProp, compilationContext) => {
  //   if (schemaProp.responsive) {
  //     const defaultValue: ExternalReferenceEmpty = {
  //       id: null,
  //       widgetId: compilationContext.isEditing
  //         ? compilationContext.types[schemaProp.type]?.widgets[0]?.id
  //         : "",
  //     };

  //     const normalize = getResponsiveNormalize<ExternalReference>(
  //       compilationContext,
  //       defaultValue,
  //       defaultValue,
  //       externalNormalize(schemaProp.type)
  //     );

  //     return {
  //       normalize,
  //       compile: (x) => x,
  //       getHash: externalReferenceGetHash,
  //     };
  //   }

  //   return {
  //     normalize: (value) => {
  //       const normalized = externalNormalize(schemaProp.type)(
  //         value,
  //         compilationContext
  //       );

  //       if (!normalized) {
  //         return {
  //           id: null,
  //           widgetId: compilationContext.types[schemaProp.type]?.widgets[0]?.id,
  //         };
  //       }

  //       return normalized;
  //     },
  //     compile: (value) => {
  //       return value;
  //     },
  //     getHash: (value) => {
  //       if (value.id === null) {
  //         return `${schemaProp.type}.${value.widgetId}`;
  //       }

  //       return `${schemaProp.type}.${value.widgetId}.${value.id}`;
  //     },
  //   };
  // },
  position: (schemaProp, compilationContext) => {
    return {
      normalize: getResponsiveNormalize(compilationContext, schemaProp.defaultValue, "top-left", x => {
        return typeof x === "string" ? x : "top-left";
      }),
      compile: x => x,
      getHash: (value, currentBreakpoint) => {
        if (isTrulyResponsiveValue$1(value)) {
          const breakpointValue = responsiveValueAt(value, currentBreakpoint);
          return breakpointValue?.toString();
        }
        return value;
      }
    };
  },
  custom: (schemaProp, compilationContext) => {
    const customTypeDefinition = compilationContext.types[schemaProp.type];
    return {
      normalize: value => {
        if (customTypeDefinition.type === "inline") {
          const defaultValue = schemaProp.defaultValue ?? customTypeDefinition.defaultValue;
          const normalizeScalar = v => {
            if (isLocalValue(v)) {
              if (customTypeDefinition.validate) {
                const isValueValid = customTypeDefinition.validate(v.value);
                if (isValueValid) {
                  return v;
                }
                return {
                  value: defaultValue,
                  widgetId: v.widgetId
                };
              }
              return {
                value: v.value ?? defaultValue,
                widgetId: v.widgetId
              };
            }
            return {
              value: v ?? defaultValue,
              widgetId: customTypeDefinition.widget.id
            };
          };
          if (customTypeDefinition.responsiveness === "optional" && schemaProp.responsive || customTypeDefinition.responsiveness === "always") {
            const normalize = getResponsiveNormalize(compilationContext, defaultValue, defaultValue, normalizeScalar);
            return normalize(value);
          }
          if (customTypeDefinition.responsiveness === "never" && schemaProp.responsive) {
            console.warn(`Custom type "${schemaProp.type}" is marked as "never" responsive, but schema prop is marked as responsive. This is not supported and the value for this field is going to stay not responsive. Please change custom type definition or schema prop definition.`);
          }
          const result = normalizeScalar(value);
          if (result) {
            return result;
          }
          const defaultLocalValue = {
            value: defaultValue,
            widgetId: customTypeDefinition.widget.id
          };
          return defaultLocalValue;
        }
        if (customTypeDefinition.type === "token") {
          const themeValues = compilationContext.theme[customTypeDefinition.token];
          const defaultThemeValueEntry = Object.entries(themeValues).find(_ref => {
            let [, v] = _ref;
            return v.isDefault;
          });
          const defaultValue = (() => {
            if (schemaProp.defaultValue) {
              return schemaProp.defaultValue;
            } else if (defaultThemeValueEntry) {
              return {
                tokenId: defaultThemeValueEntry[0]
              };
            } else {
              return customTypeDefinition.defaultValue;
            }
          })();
          const defaultWidgetId = customTypeDefinition.widget?.id;
          const createTokenNormalizer = normalizeScalar => {
            return customTypeDefinition.responsiveness === "always" || customTypeDefinition.responsiveness === "optional" && schemaProp.responsive ? getResponsiveNormalize(compilationContext, schemaProp.defaultValue, customTypeDefinition.defaultValue, x => {
              return normalizeTokenValue(x, themeValues, defaultValue, defaultWidgetId, normalizeScalar ?? (x => x));
            }) : getNormalize(compilationContext, schemaProp.defaultValue, customTypeDefinition.defaultValue, x => {
              return normalizeTokenValue(x, themeValues, defaultValue, defaultWidgetId, normalizeScalar ?? (x => x));
            });
          };
          if (customTypeDefinition.token === "space") {
            const normalizeSpace = createTokenNormalizer(x => {
              if (typeof x === "number") {
                return `${x}px`;
              }
              const isValidSpacing = customTypeDefinition.validate?.(x) ?? true;
              if (!isValidSpacing) {
                return;
              }
              return x;
            });
            return normalizeSpace(value);
          }
          if (customTypeDefinition.token === "icons") {
            const scalarValueNormalize = x => {
              if (typeof x === "string" && x.trim().startsWith("<svg")) {
                return x;
              }
              return;
            };
            const iconDefaultValue = normalizeTokenValue(schemaProp.defaultValue, themeValues, customTypeDefinition.defaultValue, defaultWidgetId, scalarValueNormalize) ?? customTypeDefinition.defaultValue;
            return normalizeTokenValue(value, themeValues, iconDefaultValue, defaultWidgetId, scalarValueNormalize) ?? value;
          }
          const defaultTokenNormalizer = createTokenNormalizer();
          return defaultTokenNormalizer(value);
        }
        if (customTypeDefinition.type === "external") {
          if (schemaProp.responsive) {
            const defaultValue = {
              id: null,
              widgetId: compilationContext.isEditing ? customTypeDefinition.widgets[0]?.id : ""
            };
            const normalize = getResponsiveNormalize(compilationContext, defaultValue, defaultValue, externalNormalize(schemaProp.type));
            return normalize(value);
          }
          const normalized = externalNormalize(schemaProp.type)(value, compilationContext);
          if (!normalized) {
            return {
              id: null,
              widgetId: customTypeDefinition.widgets[0]?.id
            };
          }
          return normalized;
        }
        throw new Error("Unknown type definition");
      },
      compile: x => {
        const val = responsiveValueMap(x, y => {
          if ("value" in y) {
            return y.value;
          }
          return y;
        });
        const flattened = responsiveValueFlatten(val, compilationContext.devices);
        return responsiveValueFill(flattened, compilationContext.devices, getDevicesWidths(compilationContext.devices));
      },
      getHash: (value, breakpointIndex) => {
        function getTokenValue(value) {
          if (value.tokenId) {
            return value.tokenId;
          }
          if (typeof value.value === "object") {
            return JSON.stringify(value.value);
          }
          const scalarVal = value.value;
          if (scalarVal.toString) {
            return scalarVal.toString();
          }
          throw new Error("unreachable");
        }
        if (customTypeDefinition.type === "external") {
          return externalReferenceGetHash(value, breakpointIndex);
        }
        if (isTrulyResponsiveValue$1(value)) {
          const breakpointValue = responsiveValueAt(value, breakpointIndex);
          if (!breakpointValue) {
            return;
          }
          if ("tokenId" in breakpointValue) {
            return getTokenValue(breakpointValue);
          }
          return typeof breakpointValue.value === "object" ? JSON.stringify(breakpointValue.value) : breakpointValue.value;
        }
        if ("tokenId" in value) {
          return getTokenValue(value);
        }
        return typeof value.value === "object" ? JSON.stringify(value.value) : value.value;
      }
    };
  }
};
function getNormalize(compilationContext, defaultValue, fallbackDefaultValue) {
  let normalize = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : x => x;
  return val => {
    const normalizedVal = normalize(val, compilationContext);
    if (normalizedVal !== undefined) {
      return normalizedVal;
    }
    const normalizedDefaultVal = normalize(defaultValue, compilationContext);
    if (normalizedDefaultVal !== undefined) {
      return normalizedDefaultVal;
    }
    return normalize(fallbackDefaultValue, compilationContext);
  };
}
function getResponsiveNormalize(compilationContext, defaultValue, fallbackDefaultValue) {
  let normalize = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : x => x;
  if (isTrulyResponsiveValue$1(defaultValue)) {
    /**
     * Here we must decide how this behaves. It's not obvious. If default is responsive, we cannot easily use default breakpoints.
     * It's because auto might be different. Changing one breakpoint changes "context" for others.
     */
    throw new Error("default responsive values not yet supported");
  }
  return val => {
    const scalarNormalize = getNormalize(compilationContext, defaultValue, fallbackDefaultValue, normalize);

    // if value is not really responsive
    if (!isTrulyResponsiveValue$1(val)) {
      return {
        $res: true,
        [compilationContext.mainBreakpointIndex]: scalarNormalize(val)
      };
    }
    const responsiveVal = responsiveValueMap(val, x => {
      return normalize(x, compilationContext);
    });

    // main breakpoint always set
    if (responsiveVal[compilationContext.mainBreakpointIndex] === undefined) {
      responsiveVal[compilationContext.mainBreakpointIndex] = scalarNormalize(undefined);
    }
    return responsiveVal;
  };
}
function getSelectSchemaPropDefinition() {
  return (schemaProp, compilationContext) => {
    return {
      normalize: schemaProp.responsive ? getResponsiveNormalize(compilationContext, schemaProp.defaultValue, getFirstOptionValue(schemaProp), x => {
        return isSelectValueCorrect(x, schemaProp.params.options) ? x : undefined;
      }) : getNormalize(compilationContext, schemaProp.defaultValue, getFirstOptionValue(schemaProp), x => {
        return isSelectValueCorrect(x, schemaProp.params.options) ? x : undefined;
      }),
      compile: x => x,
      getHash: (value, currentBreakpoint) => {
        if (isTrulyResponsiveValue$1(value)) {
          const breakpointValue = responsiveValueAt(value, currentBreakpoint);
          return breakpointValue?.toString();
        }
        return value;
      }
    };
  };
}
function isSelectValueCorrect(value, options) {
  if (typeof value !== "string") {
    return false;
  }
  return options.map(getSelectValue).indexOf(value) > -1;
}
function getSelectValue(arg) {
  if (typeof arg === "string") {
    return arg;
  }
  return arg.value;
}
function getFirstOptionValue(schemaProp) {
  if (schemaProp.params.options.length === 0) {
    throw new Error("Select field can't have 0 options");
  }
  const firstOption = schemaProp.params.options[0];
  const firstOptionValue = typeof firstOption === "object" ? firstOption.value : firstOption;
  return firstOptionValue;
}
function normalizeTokenValue(x, themeValues, defaultValue, defaultWidgetId) {
  let scalarValueNormalize = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : x => undefined;
  const input = x ?? defaultValue;
  const widgetId = input.widgetId ?? defaultWidgetId;

  // if (typeof input !== "object" && "value" in defaultValue) {
  //   const normalizedVal = scalarValueNormalize(defaultValue.value);

  //   if (normalizedVal !== undefined) {
  //     return {
  //       value: normalizedVal,
  //       widgetId,
  //     };
  //   }

  //   return;
  // }

  const hasTokenId = "tokenId" in input && typeof input.tokenId === "string";
  if (hasTokenId) {
    const val = themeValues[input.tokenId];
    if (val !== undefined) {
      return {
        value: val.value,
        tokenId: input.tokenId,
        widgetId
      };
    }
  }
  if ("value" in input) {
    const normalizedVal = scalarValueNormalize(input.value);
    if (normalizedVal !== undefined) {
      return {
        tokenId: hasTokenId ? input.tokenId : undefined,
        value: normalizedVal,
        widgetId
      };
    }
  }
  return;
}
function externalNormalize(externalType) {
  return (x, compilationContext) => {
    if (typeof x === "object" && x !== null) {
      if ("id" in x && x.id !== null) {
        const normalized = {
          id: x.id,
          widgetId: x.widgetId,
          key: x.key
        };
        return normalized;
      }
      const normalized = {
        id: null,
        widgetId: typeof x.widgetId === "string" ? x.widgetId : compilationContext.types[externalType]?.widgets[0]?.id
      };
      return normalized;
    }
  };
}
function externalReferenceGetHash(value, breakpointIndex) {
  if (isTrulyResponsiveValue$1(value)) {
    const breakpointValue = responsiveValueAt(value, breakpointIndex);
    if (breakpointValue) {
      return externalReferenceGetHash(breakpointValue, breakpointIndex);
    }
    return;
  }
  if (value.id) {
    return `${value.id}.${value.widgetId}`;
  }
}
function normalizeComponent(configComponent, compilationContext) {
  const ret = {
    _id: configComponent._id ?? uniqueId(),
    _component: configComponent._component
  };

  // Normalize itemProps (before own props). If component definition is missing, we still normalize item props
  if (configComponent._itemProps) {
    ret._itemProps = {};
    for (const templateId in configComponent._itemProps) {
      ret._itemProps[templateId] = {};
      for (const fieldName in configComponent._itemProps[templateId]) {
        ret._itemProps[templateId][fieldName] = {};
        const values = configComponent._itemProps[templateId][fieldName];
        const ownerDefinition = findComponentDefinitionById(templateId, compilationContext);
        const ownerSchemaProp = ownerDefinition.schema.find(x => x.prop === fieldName);
        if (!ownerSchemaProp) {
          continue;
        }
        (ownerSchemaProp.itemFields || []).forEach(itemFieldSchemaProp => {
          ret._itemProps[templateId][fieldName][itemFieldSchemaProp.prop] = getSchemaDefinition(itemFieldSchemaProp, compilationContext).normalize(values[itemFieldSchemaProp.prop]);
        });
      }
    }
  }
  const componentDefinition = findComponentDefinitionById(configComponent._component, compilationContext);
  if (!componentDefinition) {
    console.warn(`[normalize] Unknown _component ${configComponent._component}`);
    return ret;
  }
  componentDefinition.schema.forEach(schemaProp => {
    ret[schemaProp.prop] = getSchemaDefinition(schemaProp, compilationContext).normalize(configComponent[schemaProp.prop]);
  });

  // RichText is a really specific component. It must have concrete shape to work properly.
  // When using prop of type `component` with `accepts: ["@easyblocks/rich-text"]` it's going to be initialized with empty
  // `elements` property which in result will cause RichText to not work properly. To fix this, we're going
  // to initialize `elements` with default template - the same that's being added when user adds RichText to Stack manually.
  if (ret._component === "@easyblocks/rich-text") {
    if (Object.keys(ret.elements).length === 0 || ret.elements[compilationContext.contextParams.locale]?.length === 0) {
      const richTextConfig = buildRichTextNoCodeEntry({
        locale: compilationContext.contextParams.locale,
        color: Object.entries(compilationContext.theme.colors ?? {}).find(_ref2 => {
          let [, value] = _ref2;
          return value.isDefault;
        })?.[0],
        font: Object.entries(compilationContext.theme.fonts ?? {}).find(_ref3 => {
          let [, value] = _ref3;
          return value.isDefault;
        })?.[0]
      });
      ret.elements = richTextConfig.elements;
    }
  }
  return ret;
}
function getSchemaDefinition(schemaProp, compilationContext) {
  const provider = compilationContext.types[schemaProp.type] && schemaProp.type !== "text" ? schemaPropDefinitions.custom : schemaPropDefinitions[schemaProp.type];
  return provider(schemaProp, compilationContext);
}
function resolveLocalisedValue(localisedValue, compilationContext) {
  const locale = compilationContext.contextParams.locale;
  if (localisedValue[locale] !== undefined) {
    return {
      value: localisedValue[locale],
      locale
    };
  }
  const fallbackLocale = getFallbackLocaleForLocale(locale, compilationContext.locales);
  if (!fallbackLocale) {
    return;
  }
  return {
    value: localisedValue[fallbackLocale],
    locale: fallbackLocale
  };
}

function normalize(configComponent, compilationContext) {
  return normalizeComponent(configComponent, compilationContext);
}

function compileInternal(configComponent, compilationContext) {
  let cache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new CompilationCache();
  const normalizedConfig = normalize(configComponent, compilationContext);
  const meta = {
    vars: {
      definitions: {
        links: [],
        actions: [],
        components: [],
        textModifiers: []
      },
      devices: compilationContext.devices,
      locale: compilationContext.contextParams.locale
    }
  };
  const contextProps = {
    $width: getDevicesWidths(compilationContext.devices),
    $widthAuto: {
      $res: true,
      ...Object.fromEntries(compilationContext.devices.map(d => [d.id, false]))
    }
  };
  const compilationArtifacts = compileComponent(normalizedConfig, compilationContext, contextProps, meta, cache);
  const ret = {
    compiled: compilationArtifacts.compiledComponentConfig,
    meta: {
      vars: meta.vars
    }
  };
  if (compilationContext.isEditing) {
    return {
      ...ret,
      configAfterAuto: compilationArtifacts.configAfterAuto
    };
  }
  return ret;
}

/**
 * Traverses given `config` by invoking given `callback` for each schema prop defined within components from `context`
 */
function traverseComponents(config, context, callback) {
  traverseComponentsInternal(config, context, callback, "");
}
function traverseComponentsArray(array, context, callback, path) {
  array.forEach((config, index) => {
    traverseComponentsInternal(config, context, callback, `${path}.${index}`);
  });
}
function traverseComponentsInternal(componentConfig, context, callback, path) {
  const componentDefinition = findComponentDefinition(componentConfig, context);
  if (!componentDefinition) {
    console.warn("[traverseComponents] Unknown component definition", componentConfig);
    return;
  }
  const pathPrefix = path === "" ? "" : path + ".";
  callback({
    componentConfig,
    path
  });
  componentDefinition.schema.forEach(schemaProp => {
    if (isSchemaPropComponent(schemaProp) || schemaProp.type === "component-collection") {
      traverseComponentsArray(componentConfig[schemaProp.prop], context, callback, `${pathPrefix}${schemaProp.prop}`);
    } else if (schemaProp.type === "component-collection-localised") {
      for (const locale in componentConfig[schemaProp.prop]) {
        traverseComponentsArray(componentConfig[schemaProp.prop][locale], context, callback, `${pathPrefix}${schemaProp.prop}.${locale}`);
      }
    }
  });
}

function configFindAllPaths(config, editorContext, predicate) {
  const matchedConfigPaths = [];
  traverseComponents(config, editorContext, _ref => {
    let {
      path,
      componentConfig
    } = _ref;
    if (predicate(componentConfig, editorContext)) {
      matchedConfigPaths.push(path);
    }
  });
  return matchedConfigPaths;
}

function richTextStyles(_ref) {
  let {
    values,
    params
  } = _ref;
  const align = params.passedAlign ?? values.align;
  return {
    styled: {
      Root: {
        display: "flex",
        justifyContent: mapAlignmentToFlexAlignment(align),
        textAlign: align
      }
    },
    components: {
      elements: {
        // We store values within $richText to allow for changing them from sidebar, but we use them inside of $richTextBlockElement.
        itemProps: values.elements.map(() => ({
          accessibilityRole: values.accessibilityRole,
          mainColor: values.mainColor,
          mainFont: values.mainFont,
          mainFontSize: values.mainFontSize,
          align
        }))
      }
    },
    props: {
      align
    }
  };
}
function mapAlignmentToFlexAlignment(align) {
  if (align === "center") {
    return "center";
  }
  if (align === "right") {
    return "flex-end";
  }
  return "flex-start";
}

function richTextLineElementStyles(_ref) {
  let {
    values,
    params
  } = _ref;
  return {
    styled: {
      TextLine: {
        lineHeight: "initial",
        wordBreak: "break-word"
      },
      ListItem: {
        __as: "li",
        display: "flex",
        justifyContent: mapAlignmentToFlexAlignment(values.align),
        alignItems: "baseline",
        paddingLeft: 0,
        lineHeight: "initial",
        wordBreak: "break-word",
        listStyle: "none",
        counterIncrement: "list-item",
        // Allows flex items to break when text is overflowing
        "& > *": {
          minWidth: 0
        }
      }
    },
    props: {
      blockType: params.blockType
    }
  };
}

const richTextLineElementEditableComponent = {
  id: "@easyblocks/rich-text-line-element",
  schema: [{
    prop: "elements",
    type: "component-collection",
    accepts: [richTextPartEditableComponent.id]
  }],
  styles: richTextLineElementStyles
};

function px(value) {
  if (typeof value === "number") {
    return value === 0 ? "0" : `${value}px`;
  }
  return value;
}
const BULLETED_LIST_MIN_INLINE_SPACING = 8;
const NUMBERED_LIST_MIN_COUNTER_SPACING = 8;
const NUMBERED_LIST_MAX_COUNTER_SPACING = "0.5ch";
/**
 * Numbered list consists of number and dot. We can safely calculate required space for number by
 * counting digits of list length and using `ch` unit. Dot character differentiate between fonts
 * and we reserve at least 0.5ch of space.
 */
const NUMBERED_LIST_DOT_CHARACTER_SAFE_WIDTH = "0.5ch";
const BULLET_CHARACTER = "\u2022";
function richTextBlockElementStyles(_ref) {
  let {
    values: {
      elements,
      type
    },
    params: {
      accessibilityRole,
      align,
      mainColor,
      mainFont,
      mainFontSize
    }
  } = _ref;
  const maxDigitsCount = elements.length.toString().length;
  const paddingInline = `clamp(${px(BULLETED_LIST_MIN_INLINE_SPACING)}, calc(${px(mainFontSize)} * 0.5), ${px(mainFontSize)})`;
  const bulletedListMarkerStyles = {
    paddingLeft: paddingInline,
    paddingRight: paddingInline,
    content: BULLET_CHARACTER
  };
  const numberedListMarkerStyles = {
    minWidth: `calc(${maxDigitsCount} * 1ch + ${NUMBERED_LIST_DOT_CHARACTER_SAFE_WIDTH})`,
    paddingRight: `clamp(${px(NUMBERED_LIST_MIN_COUNTER_SPACING)}, 0.5ch, ${NUMBERED_LIST_MAX_COUNTER_SPACING})`,
    fontVariantNumeric: "tabular-nums",
    textAlign: "right",
    content: `counter(list-item)"."`
  };
  const markerStyles = {
    boxSizing: "content-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    flexGrow: 0,
    flexShrink: 0,
    fontSize: mainFontSize,
    ...(type === "bulleted-list" ? bulletedListMarkerStyles : numberedListMarkerStyles)
  };
  const listStyles = {
    counterSet: "list-item",
    paddingLeft: 0,
    listStyle: "none",
    color: mainColor,
    ...mainFont,
    "& > li": {
      color: mainColor,
      ...mainFont,
      // Instead of using ::marker pseudo-element, we use ::before because it gives us more control over its appearance.
      "&::before": markerStyles
    }
  };
  return {
    styled: {
      Paragraph: {
        __as: accessibilityRole
      },
      BulletedList: {
        __as: "ul",
        ...listStyles
      },
      NumberedList: {
        __as: "ol",
        ...listStyles
      }
    },
    components: {
      elements: {
        itemProps: elements.map(() => ({
          blockType: type,
          align
        }))
      }
    }
  };
}

const RICH_TEXT_BLOCK_ELEMENT_TYPES = ["bulleted-list", "numbered-list", "paragraph"];
const RICH_TEXT_BLOCK_ELEMENT_TYPE_OPTIONS = [{
  value: RICH_TEXT_BLOCK_ELEMENT_TYPES[0],
  label: "Bulleted"
}, {
  value: RICH_TEXT_BLOCK_ELEMENT_TYPES[1],
  label: "Numbered"
}, {
  value: RICH_TEXT_BLOCK_ELEMENT_TYPES[2],
  label: "No list"
}];
const richTextBlockElementEditableComponent = {
  id: "@easyblocks/rich-text-block-element",
  schema: [{
    prop: "type",
    type: "select",
    params: {
      options: RICH_TEXT_BLOCK_ELEMENT_TYPE_OPTIONS
    },
    defaultValue: RICH_TEXT_BLOCK_ELEMENT_TYPES[2],
    label: "Type",
    group: "Text"
  }, {
    prop: "elements",
    type: "component-collection",
    accepts: [richTextLineElementEditableComponent.id]
  }],
  styles: richTextBlockElementStyles
};

const editing = _ref => {
  let {
    values,
    params,
    editingInfo,
    __SECRET_INTERNALS__
  } = _ref;
  if (!__SECRET_INTERNALS__) {
    throw new Error("Missing __SECRET_INTERNALS__");
  }
  const {
    pathPrefix,
    editorContext
  } = __SECRET_INTERNALS__;
  const richTextConfig = dotNotationGet(editorContext.form.values, pathPrefix);
  const richTextBlockPaths = configFindAllPaths(richTextConfig, editorContext, config => {
    return config._component === "@easyblocks/rich-text-block-element";
  });
  const richTextBlockPath = richTextBlockPaths.length > 0 ? `${pathPrefix}.${richTextBlockPaths[0]}` : undefined;
  const accessibilityRoleFieldIndex = editingInfo.fields.findIndex(field => field.path === "accessibilityRole");
  const fieldsBeforeAccessibilityRole = editingInfo.fields.slice(0, accessibilityRoleFieldIndex).filter(field => {
    if (field.path === "align" && params.passedAlign !== undefined) {
      return false;
    }
    return true;
  });
  const fieldsAfterAccessibilityRole = editingInfo.fields.slice(accessibilityRoleFieldIndex).map(field => {
    if (!richTextBlockPath) {
      return field;
    }
    const richTextBlockType = dotNotationGet(editorContext.form.values, `${richTextBlockPath}.type`);
    if (richTextBlockType !== "paragraph") {
      if (field.path === "accessibilityRole") {
        return {
          ...field,
          visible: false
        };
      }
      if (field.path === "isListStyleAuto") {
        return {
          ...field,
          visible: true
        };
      }
      if (!values.isListStyleAuto && (field.path === "mainFont" || field.path === "mainColor")) {
        return {
          ...field,
          visible: true
        };
      }
    }
    return field;
  });
  const richTextPartPaths = configFindAllPaths(richTextConfig, editorContext, config => {
    return config._component === "@easyblocks/rich-text-part";
  });
  let currentLocaleRichTextPartPaths = richTextPartPaths.filter(isRichTextPartPathForLocale(editorContext.contextParams.locale));
  if (currentLocaleRichTextPartPaths.length === 0) {
    const fallbackLocale = getFallbackLocaleForLocale(editorContext.contextParams.locale, editorContext.locales);
    if (fallbackLocale) {
      currentLocaleRichTextPartPaths = richTextPartPaths.filter(isRichTextPartPathForLocale(fallbackLocale));
    }
  }
  const richTextPartSources = currentLocaleRichTextPartPaths.map(path => `${pathPrefix}.${path}`);
  return {
    fields: [...fieldsBeforeAccessibilityRole, richTextPartSources.length > 0 ? {
      type: "field",
      path: richTextPartSources.map(source => `${source}.font`)
    } : null, richTextPartSources.length > 0 ? {
      type: "field",
      path: richTextPartSources.map(source => `${source}.color`)
    } : null, richTextBlockPath ? {
      type: "field",
      path: `${richTextBlockPath}.type`,
      label: "List style",
      group: "Text"
    } : null, ...fieldsAfterAccessibilityRole].filter(nonNullable())
  };
};
const richTextEditableComponent = {
  id: "@easyblocks/rich-text",
  label: "Text",
  thumbnail: "https://shopstory.s3.eu-central-1.amazonaws.com/picker_icon_text.png",
  schema: [{
    prop: "elements",
    type: "component-collection-localised",
    accepts: [richTextBlockElementEditableComponent.id],
    visible: false
  }, {
    prop: "align",
    label: "Align",
    type: "radio-group",
    responsive: true,
    params: {
      options: [{
        value: "left",
        label: "Left",
        icon: "AlignLeft",
        hideLabel: true
      }, {
        value: "center",
        label: "Center",
        icon: "AlignCenter",
        hideLabel: true
      }, {
        value: "right",
        label: "Right",
        icon: "AlignRight",
        hideLabel: true
      }]
    },
    defaultValue: "left",
    group: "Layout",
    buildOnly: true
  }, {
    prop: "accessibilityRole",
    type: "select",
    label: "Role",
    params: {
      options: [{
        value: "div",
        label: "Paragraph"
      }, ...range(1, 6).map(index => ({
        value: `h${index}`,
        label: `Heading ${index}`
      }))]
    },
    group: "Accessibility and SEO"
  }, {
    prop: "isListStyleAuto",
    type: "boolean",
    label: "Auto list styles",
    defaultValue: true,
    visible: false,
    group: "Text"
  }, {
    prop: "mainFont",
    type: "font",
    label: "Main font",
    visible: false,
    group: "Text"
  }, {
    prop: "mainColor",
    type: "color",
    label: "Main color",
    visible: false,
    group: "Text"
  }],
  type: "item",
  styles: richTextStyles,
  editing
};
function isRichTextPartPathForLocale(locale) {
  return function innerIsLocalizedRichTextPart(richTextPartConfigPath) {
    return richTextPartConfigPath.startsWith(`elements.${locale}`);
  };
}

function textStyles(_ref) {
  let {
    values,
    params
  } = _ref;
  const align = params.passedAlign || "left";
  const fontWithDefaults = {
    fontWeight: "initial",
    fontStyle: "initial",
    ...values.font
  };
  return {
    styled: {
      Text: {
        ...fontWithDefaults,
        __as: values.accessibilityRole,
        color: values.color,
        textAlign: align,
        "& textarea::placeholder": {
          color: "currentColor",
          opacity: 0.5
        },
        "& textarea": {
          // This is important when textarea is globally set in project, here we'll override any global styles.
          ...fontWithDefaults,
          color: values.color
        },
        border: values.value === "" ? "1px dotted grey" : "none"
      }
    }
  };
}

const textEditableComponent = {
  id: "@easyblocks/text",
  label: "Simple Text",
  styles: textStyles,
  type: "item",
  thumbnail: "https://shopstory.s3.eu-central-1.amazonaws.com/picker_icon_text.png",
  schema: [{
    prop: "value",
    label: "Text",
    type: "text"
  }, {
    prop: "color",
    label: "Color",
    type: "color"
  }, {
    prop: "font",
    label: "Font",
    type: "font"
  }, {
    prop: "accessibilityRole",
    type: "select",
    label: "Role",
    params: {
      options: [{
        value: "p",
        label: "Paragraph"
      }, ...range(1, 6).map(index => ({
        value: `h${index}`,
        label: `Heading ${index}`
      }))]
    },
    group: "Accessibility and SEO"
  }]
};

function themeScalarValueToResponsiveValue(input, devices) {
  if (!isTrulyResponsiveValue$1(input)) {
    return input;
  }
  const output = {
    $res: true
  };
  devices.forEach(device => {
    const val = input[device.id];
    if (val !== undefined) {
      output[device.id] = val;
    }
  });
  return output;
}

/**
 * This is a copy of validate-color function from validate-color npm package. This package has problem with bundling, so I copied it here. It was modified 100 years ago anyway and had 32 stars, so nothing fancy really.
 */

// Good article on HTML Colors:
// https://dev.to/alvaromontoro/the-ultimate-guide-to-css-colors-2020-edition-1bh1#hsl

// Check if parameter is defined and a string
const isString = color => color && typeof color === "string";
// All existing HTML color names
const htmlColorNames = ["AliceBlue", "AntiqueWhite", "Aqua", "Aquamarine", "Azure", "Beige", "Bisque", "Black", "BlanchedAlmond", "Blue", "BlueViolet", "Brown", "BurlyWood", "CadetBlue", "Chartreuse", "Chocolate", "Coral", "CornflowerBlue", "Cornsilk", "Crimson", "Cyan", "DarkBlue", "DarkCyan", "DarkGoldenrod", "DarkGray", "DarkGreen", "DarkKhaki", "DarkMagenta", "DarkOliveGreen", "DarkOrange", "DarkOrchid", "DarkRed", "DarkSalmon", "DarkSeaGreen", "DarkSlateBlue", "DarkSlateGray", "DarkTurquoise", "DarkViolet", "DeepPink", "DeepSkyBlue", "DimGray", "DodgerBlue", "FireBrick", "FloralWhite", "ForestGreen", "Fuchsia", "Gainsboro", "GhostWhite", "Gold", "Goldenrod", "Gray", "Green", "GreenYellow", "HoneyDew", "HotPink", "IndianRed", "Indigo", "Ivory", "Khaki", "Lavender", "LavenderBlush", "LawnGreen", "LemonChiffon", "LightBlue", "LightCoral", "LightCyan", "LightGoldenrodYellow", "LightGray", "LightGreen", "LightPink", "LightSalmon", "LightSalmon", "LightSeaGreen", "LightSkyBlue", "LightSlateGray", "LightSteelBlue", "LightYellow", "Lime", "LimeGreen", "Linen", "Magenta", "Maroon", "MediumAquamarine", "MediumBlue", "MediumOrchid", "MediumPurple", "MediumSeaGreen", "MediumSlateBlue", "MediumSlateBlue", "MediumSpringGreen", "MediumTurquoise", "MediumVioletRed", "MidnightBlue", "MintCream", "MistyRose", "Moccasin", "NavajoWhite", "Navy", "OldLace", "Olive", "OliveDrab", "Orange", "OrangeRed", "Orchid", "PaleGoldenrod", "PaleGreen", "PaleTurquoise", "PaleVioletRed", "PapayaWhip", "PeachPuff", "Peru", "Pink", "Plum", "PowderBlue", "Purple", "RebeccaPurple", "Red", "RosyBrown", "RoyalBlue", "SaddleBrown", "Salmon", "SandyBrown", "SeaGreen", "SeaShell", "Sienna", "Silver", "SkyBlue", "SlateBlue", "SlateGray", "Snow", "SpringGreen", "SteelBlue", "Tan", "Teal", "Thistle", "Tomato", "Turquoise", "Violet", "Wheat", "White", "WhiteSmoke", "Yellow", "YellowGreen"];
// These 3 values are valid, usable color names, which are special in their own way
const htmlColorNamesSpecial = ["currentColor", "inherit", "transparent"];

// Validate HTML color name (red, yellow, etc)
const validateHTMLColorName = color => {
  let status = false;
  if (isString(color)) {
    htmlColorNames.map(c => {
      if (color.toLowerCase() === c.toLowerCase()) {
        status = true;
      }
      return null;
    });
  }
  return status;
};

// Validate HTML color special name (currentColor, inherit, etc)
const validateHTMLColorSpecialName = color => {
  let status = false;
  if (isString(color)) {
    htmlColorNamesSpecial.map(c => {
      if (color.toLowerCase() === c.toLowerCase()) {
        status = true;
      }
      return null;
    });
  }
  return status;
};

// Validate HTML color 'hex'
const validateHTMLColorHex = color => {
  if (isString(color)) {
    const regex = /^#([\da-f]{3}){1,2}$|^#([\da-f]{4}){1,2}$/i;
    return !!color && regex.test(color);
  }
  return false;
};

// Validate HTML color 'rgb'
// -- legacy notation
// color: rgb(255, 255, 255);
// color: rgba(255, 255, 255, 1);
// -- new notation
// color: rgb(255 255 255);
// color: rgb(255 255 255 / 1);
// Note that 'rgba()' is now merged into 'rgb()'
const validateHTMLColorRgb = color => {
  if (isString(color)) {
    const regex = /(rgb)a?\((\s*\d+%?\s*?,?\s*){2}(\s*\d+%?\s*?,?\s*\)?)(\s*,?\s*\/?\s*(0?\.?\d+%?\s*)?|1|0)?\)$/i;
    return !!color && regex.test(color);
  }
  return false;
};
const optionalCommaOrRequiredSpace = `((\\s*,\\s*)|(\\s+))`;
const optionalDecimals = `(\\.\\d+)?`;
const anyPercentage = `((\\d*${optionalDecimals})%)`;
const hundredPercent = `(([0-9]|[1-9][0-9]|100)%)`;
const alphaPercentage = `(((${hundredPercent}))|(0?${optionalDecimals})|1))?`;
const endingWithAlphaPercentage = `\\s*?\\)?)(\\s*?(\\/?)\\s+${alphaPercentage}\\s*?\\)$`;

// Validate HTML color 'hsl'
// -- These units are valid for the first parameter
// 'deg': degrees | full circle = 360
// 'gra': gradians | full circle = 400
// 'radians': radians | full circle = 2π (approx. 6.28)
// 'turn': turns | full circle = 1
const validateHTMLColorHsl = color => {
  if (isString(color)) {
    // Validate each possible unit value separately, as their values differ
    const degRegex = `(-?([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-9][0-9]|3[0-5][0-9]|360)(deg)?)`;
    const graRegex = `(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-9][0-9]|3[0-9][0-9]|400)gra)`;
    const radRegex = `((([0-5])?\\.\\d+|6\\.([0-9]|1[0-9]|2[0-8])|[0-6])rad)`;
    const turnRegex = `((0?${optionalDecimals}|1)turn)`;
    const regexLogic = `(hsl)a?\\((\\s*?(${degRegex}|${graRegex}|${radRegex}|${turnRegex})${optionalCommaOrRequiredSpace})(\\s*?(0|${hundredPercent})${optionalCommaOrRequiredSpace})(\\s*?(0|${hundredPercent})\\s*?\\)?)(\\s*?(\\/?|,?)\\s*?(((${hundredPercent}))|(0?${optionalDecimals})|1))?\\)$`;
    const regex = new RegExp(regexLogic);
    return !!color && regex.test(color);
  }
  return false;
};

// Validate HTML color 'hwb'
// -- 'hwb' accepts 'deg' as unit in its 1st property, which stands for 'hue'
// 'deg': degrees | full circle = 360
const validateHTMLColorHwb = color => {
  if (isString(color)) {
    const degRegex = `(-?([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-9][0-9]|3[0-5][0-9]|360)(deg)?)`;
    const regexLogic = `(hwb\\(\\s*?${degRegex}\\s+)((0|${hundredPercent})\\s+)((0|${hundredPercent})${endingWithAlphaPercentage}`;
    const regex = new RegExp(regexLogic);
    return !!color && regex.test(color);
  }
  return false;
};

// Validate HTML color 'lab'
// -- 'lab' 2nd & 3rd parameters are any number between -160 & 160
const validateHTMLColorLab = color => {
  if (isString(color)) {
    const labParam = `(-?(([0-9]|[1-9][0-9]|1[0-5][0-9])${optionalDecimals}?|160))`;
    const regexLogic = `(lab\\(\\s*?${anyPercentage}\\s+${labParam}\\s+${labParam}${endingWithAlphaPercentage}`;
    const regex = new RegExp(regexLogic);
    return !!color && regex.test(color);
  }
  return false;
};
const validateColor = color => {
  // Former validation - source: https://www.regextester.com/103656
  // if (isString(color)) {
  //   const regex = /^#([\da-f]{3}){1,2}$|^#([\da-f]{4}){1,2}$|(rgb|hsl)a?\((\s*-?\d+%?\s*,){2}(\s*-?\d+%?\s*,?\s*\)?)(,\s*(0?\.\d+)?|1|0)?\)$/i;
  //   return color && regex.test(color);
  // }
  // New validation
  if (color && validateHTMLColorHex(color) || validateHTMLColorName(color) || validateHTMLColorSpecialName(color) || validateHTMLColorRgb(color) || validateHTMLColorHsl(color) || validateHTMLColorHwb(color) || validateHTMLColorLab(color)) {
    return true;
  }
  return false;
};

function normalizeSpace(space) {
  return responsiveValueMap(space, val => {
    if (typeof val === "number") {
      return `${val}px`;
    }
    return val;
  });
}
function prepareDevices(configDevices) {
  const devices = []; // let's make devices copy
  DEFAULT_DEVICES.forEach(defaultDevice => {
    devices.push({
      ...defaultDevice
    });
  });
  if (configDevices) {
    devices.forEach((device, index) => {
      const configDevice = configDevices[device.id];
      if (configDevice) {
        device.w = configDevice.w ?? device.w;
        device.h = configDevice.h !== undefined ? configDevice.h : device.h;
        device.hidden = configDevice.hidden ?? device.hidden;
        if (configDevice.startsFrom && index > 0) {
          const previousDevice = devices[index - 1];
          previousDevice.breakpoint = configDevice.startsFrom;
        }
      }
    });
  }
  return devices;
}
function createCompilationContext(config, contextParams, rootComponentId) {
  const devices = prepareDevices(config.devices);
  const mainDevice = devices.find(x => x.isMain);
  if (!mainDevice) {
    throw new Error(`Missing main device in devices config.`);
  }
  const {
    space,
    ...customTokens
  } = config.tokens ?? {};
  const theme = {
    space: {}
  };

  // TODO: allow for custom breakpoints!!! What happens with old ones when the new ones show up?

  if (space) {
    space.forEach(space => {
      let val = space.value;

      // If value is "vw" and is not responsive then we should responsify it.
      // Why? Because responsive token behaves differently from non-responsive in terms of auto.
      // Responsive token automatically "fills" all the breakpoints.
      // If someone does 10vw it is responsive in nature, it's NEVER a scalar.
      if (typeof val === "string" && parseSpacing(val).unit === "vw") {
        val = {
          $res: true,
          [mainDevice.id]: val
        };
      }
      theme.space[space.id] = {
        value: normalizeSpace(themeScalarValueToResponsiveValue(val, devices)),
        isDefault: space.isDefault ?? false,
        label: space.label
      };
    });
  }
  const types = {
    ...createCustomTypes(config.types),
    ...createBuiltinTypes()
  };
  const allTypeIds = Object.keys(types);
  Object.entries(customTokens).forEach(_ref => {
    let [id, tokens] = _ref;
    const type = Object.values(types).find(type => type.type === "token" && type.token === id);
    if (!type) {
      throw new Error(`Can't find a matching type for a token "${id}" (found in Config.tokens)`);
    }
    theme[id] = Object.fromEntries(tokens.map(token => {
      if (type.validate) {
        if (type.validate(token.value) !== true) {
          throw new Error(`The value for token "${id}.${token.id}" (${token.value}) is incorrect. The validation function for its corresponding type must return 'true'. `);
        }
      }
      return [token.id, {
        label: token.label,
        value: token.value,
        isDefault: token.isDefault ?? false
      }];
    }));
  });
  const components = [textEditableComponent, richTextEditableComponent, richTextBlockElementEditableComponent, richTextLineElementEditableComponent, richTextPartEditableComponent, {
    id: "@easyblocks/missing-component",
    label: "Missing component",
    schema: [{
      prop: "error",
      type: "string",
      visible: false
    }]
  }];
  const rootComponent = (config.components ?? []).find(component => component.id === rootComponentId);
  if (!rootComponent) {
    throw new Error(`createCompilationContext: rootComponentId "${rootComponentId}" doesn't exist in config.components`);
  }
  if (rootComponent.rootParams && rootComponent.rootParams.length > 0) {
    ensureDocumentDataWidgetForExternalTypes(types);
  }
  const builtinTypes = ["string", "number", "boolean", "select", "radio-group", "text", "component", "component-collection", "component-collection-localised", "position"];

  // Validate if components have correct types
  if (config.components) {
    config.components.forEach(component => {
      if (component.schema) {
        component.schema.forEach(prop => {
          if (builtinTypes.includes(prop.type)) {
            return;
          }
          if (!allTypeIds.includes(prop.type)) {
            throw new Error(`The field "${component.id}.${prop.prop}" has an unrecognized type: "${prop.type}". Custom types can be added in Config.types object`);
          }
        });
      }
    });
  }
  if (config.components) {
    components.push(...(config.components ?? []).map(component => {
      // For root component with rootParams we should create special param types and move params to schema props
      if (component.id === rootComponent.id && rootComponent.rootParams) {
        const paramSchemaProps = [];
        rootComponent.rootParams.forEach(param => {
          const typeName = "param__" + param.prop;
          types[typeName] = {
            type: "external",
            widgets: param.widgets
          };
          paramSchemaProps.push({
            prop: param.prop,
            label: param.label,
            type: typeName,
            group: "Parameters",
            optional: true
          });
        });
        return {
          ...component,
          schema: [...paramSchemaProps, ...component.schema]
        };
      }
      return component;
    }));
  }
  if (!config.locales) {
    throw new Error(`Required property config.locales doesn't exist in your config.`);
  }
  if (config.locales.find(l => l.code === contextParams.locale) === undefined) {
    throw new Error(`You passed locale "${contextParams.locale}" which doesn't exist in your config.locales`);
  }
  const compilationContext = {
    devices,
    theme,
    definitions: {
      components
    },
    types,
    mainBreakpointIndex: mainDevice.id,
    contextParams,
    locales: config.locales,
    rootComponent
  };
  return compilationContext;
}
function createCustomTypes(types) {
  if (!types) {
    return {};
  }
  return Object.fromEntries(Object.entries(types).map(_ref2 => {
    let [id, definition] = _ref2;
    if (definition.type === "external") {
      return [id, {
        ...definition,
        responsiveness: definition.responsiveness ?? "never",
        widgets: definition.widgets ?? []
      }];
    }
    return [id, {
      ...definition,
      responsiveness: definition.responsiveness ?? "never"
    }];
  }));
}
function createBuiltinTypes() {
  return {
    space: {
      type: "token",
      responsiveness: "always",
      token: "space",
      defaultValue: {
        value: "0px"
      },
      widget: {
        id: "@easyblocks/space",
        label: "Space"
      },
      allowCustom: true,
      validate(value) {
        return typeof value === "string" && !!parseSpacing(value);
      }
    },
    color: {
      type: "token",
      responsiveness: "always",
      token: "colors",
      defaultValue: {
        value: "#000000"
      },
      widget: {
        id: "@easyblocks/color",
        label: "Color"
      },
      allowCustom: true,
      validate(value) {
        return typeof value === "string" && validateColor(value);
      }
    },
    font: {
      type: "token",
      token: "fonts",
      responsiveness: "always",
      defaultValue: {
        value: {
          fontFamily: "sans-serif",
          fontSize: "16px"
        }
      }
    },
    aspectRatio: {
      type: "token",
      token: "aspectRatios",
      responsiveness: "always",
      widget: {
        id: "@easyblocks/aspectRatio",
        label: "Aspect ratio"
      },
      defaultValue: {
        value: "1:1"
      },
      allowCustom: true,
      validate(value) {
        return typeof value === "string" && (!!value.match(/[0-9]+:[0-9]+/) || value === "natural");
      }
    },
    boxShadow: {
      type: "token",
      token: "boxShadows",
      responsiveness: "always",
      defaultValue: {
        value: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
      }
    },
    icon: {
      type: "token",
      responsiveness: "never",
      token: "icons",
      defaultValue: {
        value: `<svg viewBox="0 -960 960 960"><path fill="currentColor" d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T518-680h-76q-15-41-55-67.5T300-774q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480-228Zm0-273Z"/></svg>`
      },
      widget: {
        id: "@easyblocks/icon",
        label: "Icon"
      },
      allowCustom: true,
      validate(value) {
        return typeof value === "string" && value.trim().startsWith("<svg");
      }
    },
    text: {
      type: "external",
      widgets: []
    }
  };
}
function ensureDocumentDataWidgetForExternalTypes(types) {
  const externalTypesNames = new Set([...Object.keys(types).filter(t => types[t].type === "external")]);
  externalTypesNames.forEach(externalTypeName => {
    const externalTypeDefinition = types[externalTypeName];
    if (!externalTypeDefinition.widgets) {
      externalTypeDefinition.widgets = [];
    }
    const hasDocumentDataWidget = externalTypeDefinition.widgets.some(w => w.id === "@easyblocks/document-data");
    if (!hasDocumentDataWidget) {
      externalTypeDefinition.widgets.push({
        id: "@easyblocks/document-data",
        label: "Document data"
      });
    }
  });
}

/**
 * Traverses given `config` by invoking given `callback` for each schema prop defined within components from `context`
 */
function configTraverse(config, context, callback) {
  configTraverseInternal(config, context, callback, "");
}
function configTraverseArray(array, context, callback, path) {
  array.forEach((config, index) => {
    configTraverseInternal(config, context, callback, `${path}.${index}`);
  });
}
function configTraverseInternal(config, context, callback, path) {
  const componentDefinition = findComponentDefinition(config, context);
  if (!componentDefinition) {
    console.warn(`[configTraverse] Unknown component definition for: ${config._component}`);
    return;
  }
  const pathPrefix = path === "" ? "" : path + ".";
  componentDefinition.schema.forEach(schemaProp => {
    if (isSchemaPropComponent(schemaProp) || schemaProp.type === "component-collection") {
      callback({
        config,
        value: config[schemaProp.prop],
        path: `${pathPrefix}${schemaProp.prop}`,
        schemaProp
      });
      configTraverseArray(config[schemaProp.prop], context, callback, `${pathPrefix}${schemaProp.prop}`);
    } else if (schemaProp.type === "component-collection-localised") {
      callback({
        config,
        value: config[schemaProp.prop],
        path: `${pathPrefix}${schemaProp.prop}`,
        schemaProp
      });
      for (const locale in config[schemaProp.prop]) {
        configTraverseArray(config[schemaProp.prop][locale], context, callback, `${pathPrefix}${schemaProp.prop}.${locale}`);
      }
    } else {
      const currentPath = `${pathPrefix}${schemaProp.prop}`;
      callback({
        config,
        path: currentPath,
        value: config[schemaProp.prop],
        schemaProp
      });
    }
  });
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
  } = React.useMemo(() => {
    /**
     * Why parse+stringify?
     *
     * Because if we remove them some nested objects in styles (like media queries etc) don't work (although they exist in the object).
     * Why? My bet is this: Stitches uses CSSOM to inject styles. Maybe (for some weird reason, maybe even browser bug) if some part of the object is not in iframe scope but in parent window scope then it's somehow ignored? Absolutely no idea right now, happy this works.
     */
    const correctedStyles = getBoxStyles(JSON.parse(JSON.stringify(styles)), devices);
    const generateBoxClass = stitches.css(boxStyles);
    const generateClassName = stitches.css(correctedStyles);
    return {
      boxClassName: generateBoxClass(),
      componentClassName: generateClassName()
    };
  }, [styles.__hash]);
  return /*#__PURE__*/React__default["default"].createElement(as || __as || "div", {
    ref,
    ...restPassedProps,
    className: [boxClassName, componentClassName, className].filter(Boolean).join(" "),
    "data-testid": __name
  }, props.children);
});

const EasyblocksExternalDataContext = /*#__PURE__*/React.createContext(null);
function useEasyblocksExternalData() {
  const context = React.useContext(EasyblocksExternalDataContext);
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
  return /*#__PURE__*/React__default["default"].createElement(EasyblocksExternalDataContext.Provider, {
    value: externalData
  }, children);
}

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

const EasyblocksMetadataContext = /*#__PURE__*/React.createContext(undefined);
const EasyblocksMetadataProvider = _ref => {
  let {
    meta,
    children
  } = _ref;
  // Let's load stitches instance
  if (easyblocksStitchesInstances.length === 0) {
    easyblocksStitchesInstances.push(core.createStitches({}));
  }
  return /*#__PURE__*/React__default["default"].createElement(EasyblocksMetadataContext.Provider, {
    value: {
      ...meta,
      stitches: easyblocksStitchesInstances[0]
    }
  }, children);
};
function useEasyblocksMetadata() {
  const context = React.useContext(EasyblocksMetadataContext);
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
function getComponentDefinition(compiled, runtimeContext) {
  return findComponentDefinitionById(compiled._component, runtimeContext);
}

/**
 * Checks whether:
 * 1. component is renderable (if all non-optional externals are defined)
 * 2. is data loading...
 * 3. gets fields that are not defined
 *
 * @param compiled
 * @param runtimeContext
 * @param rendererContext
 */

function getRenderabilityStatus(compiled, meta, externalData) {
  const status = {
    renderable: true,
    isLoading: false,
    fieldsRequiredToRender: new Set()
  };
  const componentDefinition = getComponentDefinition(compiled, {
    definitions: meta.vars.definitions
  });
  if (!componentDefinition) {
    return {
      renderable: false,
      isLoading: false,
      fieldsRequiredToRender: new Set()
    };
  }
  const requiredExternalFields = componentDefinition.schema.filter(schemaProp => {
    if (schemaProp.type === "text") {
      return false;
    }
    const propValue = compiled.props[schemaProp.prop];
    if (typeof propValue === "object" && propValue !== null && "id" in propValue && "widgetId" in propValue) {
      if ("optional" in schemaProp) {
        return !schemaProp.optional;
      }
      return true;
    }
    return false;
  });
  if (requiredExternalFields.length === 0) {
    return status;
  }
  for (const resourceSchemaProp of requiredExternalFields) {
    const externalReference = compiled.props[resourceSchemaProp.prop];
    const fieldStatus = getFieldStatus(externalReference, externalData, compiled._id, resourceSchemaProp.prop, meta.vars.devices);
    status.isLoading = status.isLoading || fieldStatus.isLoading;
    status.renderable = status.renderable && fieldStatus.renderable;
    if (!fieldStatus.renderable && !fieldStatus.isLoading) {
      status.fieldsRequiredToRender.add(resourceSchemaProp.label || resourceSchemaProp.prop);
    }
  }
  return status;
}
function getCompiledSubcomponents(id, compiledArray, contextProps, schemaProp, path, meta, isEditing, components) {
  const originalPath = path;
  if (schemaProp.type === "component-collection-localised") {
    path = path + "." + meta.vars.locale;
  }
  if (schemaProp.noInline) {
    const elements = compiledArray.map((compiledChild, index) => "_component" in compiledChild ? /*#__PURE__*/React__default["default"].createElement(ComponentBuilder, {
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
  let elements = compiledArray.map((compiledChild, index) => "_component" in compiledChild ? /*#__PURE__*/React__default["default"].createElement(EditableComponentBuilder, {
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
    return elements[0] ?? /*#__PURE__*/React__default["default"].createElement(React.Fragment, null);
  } else {
    return elements;
  }
}
function ComponentBuilder(props) {
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

  // Here we know we must render just component, without any wrappers
  const componentDefinition = getComponentDefinition(compiled, {
    definitions: meta.vars.definitions
  });
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
  const renderabilityStatus = getRenderabilityStatus(compiled, meta, externalData);
  if (!renderabilityStatus.renderable) {
    const fieldsRequiredToRender = Array.from(renderabilityStatus.fieldsRequiredToRender);
    return /*#__PURE__*/React__default["default"].createElement(MissingComponent, {
      component: componentDefinition
    }, `Fill following fields to render the component: ${fieldsRequiredToRender.join(", ")}`, renderabilityStatus.isLoading && /*#__PURE__*/React__default["default"].createElement(React.Fragment, null, /*#__PURE__*/React__default["default"].createElement("br", null), /*#__PURE__*/React__default["default"].createElement("br", null), "Loading data..."));
  }
  const shopstoryCompiledConfig = compiled;

  // Shopstory component
  const styled = buildBoxes(shopstoryCompiledConfig.styled, "", {}, meta);

  // Styled
  componentDefinition.schema.forEach(schemaProp => {
    if (isSchemaPropComponentOrComponentCollection(schemaProp)) {
      const contextProps = shopstoryCompiledConfig.__editing?.components?.[schemaProp.prop] || {};
      const compiledChildren = shopstoryCompiledConfig.components[schemaProp.prop];
      styled[schemaProp.prop] = getCompiledSubcomponents(compiled._id, compiledChildren, contextProps, schemaProp, `${path}${pathSeparator}${schemaProp.prop}`, meta, isEditing, components);
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    ref,
    __isSelected,
    ...restPassedProps
  } = allPassedProps || {};
  const runtime = {
    stitches: meta.stitches,
    resop: resop,
    devices: meta.vars.devices
  };
  const easyblocksProp = {
    id: shopstoryCompiledConfig._id,
    isEditing,
    path,
    runtime,
    isSelected: __isSelected
  };
  const componentProps = {
    ...restPassedProps,
    ...mapExternalProps(shopstoryCompiledConfig.props, shopstoryCompiledConfig._id, componentDefinition, externalData),
    ...styled,
    __easyblocks: easyblocksProp
  };
  return /*#__PURE__*/React__default["default"].createElement(Component, componentProps);
}
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
function mapExternalProps(props, configId, componentDefinition, externalData) {
  const resultsProps = {};
  for (const propName in props) {
    const schemaProp = componentDefinition.schema.find(currentSchema => currentSchema.prop === propName);
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
function getFieldStatus(externalReference, externalData, configId, fieldName, devices) {
  return responsiveValueReduce(externalReference, (currentStatus, value, deviceId) => {
    if (!deviceId) {
      if (!value.id) {
        return {
          isLoading: false,
          renderable: false
        };
      }
      const externalValue = getResolvedExternalDataValue(externalData, configId, fieldName, value);
      return {
        isLoading: currentStatus.isLoading || externalValue === undefined,
        renderable: currentStatus.renderable && externalValue !== undefined && (externalValue.type === "object" ? value.key !== undefined : true)
      };
    }
    if (currentStatus.isLoading || !currentStatus.renderable) {
      return currentStatus;
    }
    const externalReferenceValue = responsiveValueGetDefinedValue(value, deviceId, devices);
    if (!externalReferenceValue || externalReferenceValue.id === null) {
      return {
        isLoading: false,
        renderable: false
      };
    }
    const externalValue = getResolvedExternalDataValue(externalData, configId, fieldName, externalReferenceValue);
    return {
      isLoading: currentStatus.isLoading || externalValue === undefined,
      renderable: currentStatus.renderable && externalValue !== undefined && (externalValue.type === "object" ? externalReferenceValue.key !== undefined : true)
    };
  }, {
    renderable: true,
    isLoading: false
  }, devices);
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

const AUTH_HEADER = "x-shopstory-access-token";
class EasyblocksBackend {
  constructor(args) {
    this.accessToken = args.accessToken;
    this.rootUrl = args.rootUrl ?? "https://app.easyblocks.io";
  }
  async init() {
    // don't reinitialize
    if (this.project) {
      return;
    }

    // Set project!
    const response = await this.get("/projects");
    if (response.ok) {
      const projects = await response.json();
      if (projects.length === 0) {
        throw new Error("Authorization error. Have you provided a correct access token?");
      }
      this.project = projects[0];
    } else {
      throw new Error("Initialization error in ApiClient");
    }
  }
  async request(path, options) {
    const apiRequestUrl = new URL(`${this.rootUrl}/api${path}`);
    if (options.searchParams && Object.keys(options.searchParams).length > 0) {
      for (const [key, value] of Object.entries(options.searchParams)) {
        if (Array.isArray(value)) {
          value.forEach(value => {
            apiRequestUrl.searchParams.append(key, value);
          });
        } else {
          apiRequestUrl.searchParams.set(key, value);
        }
      }
    }
    const headers = {
      ...(path.includes("assets") ? {} : {
        "Content-Type": "application/json"
      }),
      ...options.headers,
      [AUTH_HEADER]: this.accessToken
    };
    const body = options.body ? typeof options.body === "object" && !(options.body instanceof FormData) ? JSON.stringify(options.body) : options.body : undefined;
    return fetch(apiRequestUrl.toString(), {
      method: options.method,
      headers,
      body
    });
  }
  async get(path) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return this.request(path, {
      ...options,
      method: "GET"
    });
  }
  async post(path) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return this.request(path, {
      ...options,
      method: "POST"
    });
  }
  async put(path) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return this.request(path, {
      ...options,
      method: "PUT"
    });
  }
  async delete(path) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return this.request(path, {
      ...options,
      method: "DELETE"
    });
  }
  documents = {
    get: async payload => {
      await this.init();
      const response = await this.get(`/projects/${this.project.id}/documents/${payload.id}`, {
        searchParams: {
          format: "full"
        }
      });
      if (response.ok) {
        return documentWithResolvedConfigDTOToDocument(await response.json());
      }
      throw new Error("Failed to get document");
    },
    create: async payload => {
      await this.init();
      const response = await this.post(`/projects/${this.project.id}/documents`, {
        body: {
          title: "Untitled",
          config: payload.entry,
          rootContainer: payload.entry._component
        }
      });
      if (response.ok) {
        return documentDTOToDocument(await response.json(), payload.entry);
      }
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
      throw new Error("Failed to save document");
    },
    update: async payload => {
      await this.init();
      const response = await this.put(`/projects/${this.project.id}/documents/${payload.id}`, {
        body: {
          version: payload.version,
          config: payload.entry
        }
      });
      if (response.ok) {
        return documentDTOToDocument(await response.json(), payload.entry);
      }
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
      throw new Error("Failed to update document");
    }
  };
  templates = {
    get: async payload => {
      await this.init();

      // dummy inefficient implementation
      const allTemplates = await this.templates.getAll();
      const template = allTemplates.find(template => template.id === payload.id);
      if (!template) {
        throw new Error("Template not found");
      }
      return template;
    },
    getAll: async () => {
      await this.init();
      try {
        const response = await this.get(`/projects/${this.project.id}/templates`);
        const data = await response.json();
        const templates = data.map(item => ({
          id: item.id,
          label: item.label,
          entry: item.config.config,
          isUserDefined: true,
          width: item.width,
          widthAuto: item.widthAuto
        }));
        return templates;
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    create: async input => {
      await this.init();
      const payload = {
        label: input.label,
        config: input.entry,
        masterTemplateIds: [],
        width: input.width,
        widthAuto: input.widthAuto
      };
      const response = await this.request(`/projects/${this.project.id}/templates`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (response.status !== 200) {
        throw new Error("couldn't create template");
      }
      const json = await response.json();
      return {
        id: json.id,
        label: json.label,
        entry: input.entry,
        isUserDefined: true
      };
    },
    update: async input => {
      await this.init();
      const payload = {
        label: input.label,
        masterTemplateIds: []
      };
      const response = await this.request(`/projects/${this.project.id}/templates/${input.id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      const json = await response.json();
      console.log("update template json", json);
      if (response.status !== 200) {
        throw new Error();
      }
      return {
        id: json.id,
        label: json.label,
        isUserDefined: true
      };
    },
    delete: async input => {
      await this.init();
      const response = await this.request(`/projects/${this.project.id}/templates/${input.id}`, {
        method: "DELETE"
      });
      if (response.status !== 200) {
        throw new Error();
      }
    }
  };
}
function documentDTOToDocument(documentDTO, entry) {
  if (!documentDTO.root_container) {
    throw new Error("unexpected server error");
  }
  return {
    id: documentDTO.id,
    version: documentDTO.version,
    entry
  };
}
function documentWithResolvedConfigDTOToDocument(documentWithResolvedConfigDTO) {
  return documentDTOToDocument(documentWithResolvedConfigDTO, documentWithResolvedConfigDTO.config.config);
}

exports.Box = Box;
exports.CompilationCache = CompilationCache;
exports.ComponentBuilder = ComponentBuilder;
exports.EasyblocksBackend = EasyblocksBackend;
exports.EasyblocksExternalDataProvider = EasyblocksExternalDataProvider;
exports.EasyblocksMetadataProvider = EasyblocksMetadataProvider;
exports.RichTextPartClient = RichTextPartClient;
exports.buildRichTextBlockElementComponentConfig = buildRichTextBlockElementComponentConfig;
exports.buildRichTextBulletedListBlockElementComponentConfig = buildRichTextBulletedListBlockElementComponentConfig;
exports.buildRichTextComponentConfig = buildRichTextComponentConfig;
exports.buildRichTextLineElementComponentConfig = buildRichTextLineElementComponentConfig;
exports.buildRichTextNoCodeEntry = buildRichTextNoCodeEntry;
exports.buildRichTextParagraphBlockElementComponentConfig = buildRichTextParagraphBlockElementComponentConfig;
exports.buildRichTextPartComponentConfig = buildRichTextPartComponentConfig;
exports.cleanString = cleanString;
exports.compileBox = compileBox;
exports.compileInternal = compileInternal;
exports.componentPickerClosed = componentPickerClosed;
exports.componentPickerOpened = componentPickerOpened;
exports.configTraverse = configTraverse;
exports.createCompilationContext = createCompilationContext;
exports.deepClone = deepClone;
exports.deepCompare = deepCompare;
exports.dotNotationGet = dotNotationGet;
exports.dotNotationSet = dotNotationSet;
exports.easyblocksGetCssText = easyblocksGetCssText;
exports.easyblocksGetStyleTag = easyblocksGetStyleTag;
exports.findComponentDefinition = findComponentDefinition;
exports.findComponentDefinitionById = findComponentDefinitionById;
exports.findPathOfFirstAncestorOfType = findPathOfFirstAncestorOfType;
exports.getBoxStyles = getBoxStyles;
exports.getDefaultLocale = getDefaultLocale;
exports.getDevicesWidths = getDevicesWidths;
exports.getExternalReferenceLocationKey = getExternalReferenceLocationKey;
exports.getExternalValue = getExternalValue;
exports.getFallbackForLocale = getFallbackForLocale;
exports.getFallbackLocaleForLocale = getFallbackLocaleForLocale;
exports.getResolvedExternalDataValue = getResolvedExternalDataValue;
exports.getSchemaDefinition = getSchemaDefinition;
exports.isComponentConfig = isComponentConfig;
exports.isCompoundExternalDataValue = isCompoundExternalDataValue;
exports.isCustomSchemaProp = isCustomSchemaProp;
exports.isDocument = isDocument;
exports.isEmptyExternalReference = isEmptyExternalReference;
exports.isEmptyRenderableContent = isEmptyRenderableContent;
exports.isExternalSchemaProp = isExternalSchemaProp;
exports.isIdReferenceToDocumentExternalValue = isIdReferenceToDocumentExternalValue;
exports.isLocalTextReference = isLocalTextReference;
exports.isLocalValue = isLocalValue;
exports.isNonEmptyRenderableContent = isNonEmptyRenderableContent;
exports.isRenderableContent = isRenderableContent;
exports.isResolvedCompoundExternalDataValue = isResolvedCompoundExternalDataValue;
exports.isSchemaPropActionTextModifier = isSchemaPropActionTextModifier;
exports.isSchemaPropCollection = isSchemaPropCollection;
exports.isSchemaPropComponent = isSchemaPropComponent;
exports.isSchemaPropComponentCollectionLocalised = isSchemaPropComponentCollectionLocalised;
exports.isSchemaPropComponentOrComponentCollection = isSchemaPropComponentOrComponentCollection;
exports.isSchemaPropTextModifier = isSchemaPropTextModifier;
exports.isTrulyResponsiveValue = isTrulyResponsiveValue$1;
exports.itemInserted = itemInserted;
exports.itemMoved = itemMoved;
exports.nonNullable = nonNullable;
exports.normalize = normalize;
exports.parsePath = parsePath;
exports.parseSpacing = parseSpacing;
exports.resolveExternalValue = resolveExternalValue;
exports.resolveLocalisedValue = resolveLocalisedValue;
exports.responsiveValueAt = responsiveValueAt;
exports.responsiveValueEntries = responsiveValueEntries;
exports.responsiveValueFill = responsiveValueFill;
exports.responsiveValueFindDeviceWithDefinedValue = responsiveValueFindDeviceWithDefinedValue;
exports.responsiveValueFindHigherDeviceWithDefinedValue = responsiveValueFindHigherDeviceWithDefinedValue;
exports.responsiveValueFindLowerDeviceWithDefinedValue = responsiveValueFindLowerDeviceWithDefinedValue;
exports.responsiveValueFlatten = responsiveValueFlatten;
exports.responsiveValueForceGet = responsiveValueForceGet$1;
exports.responsiveValueGet = responsiveValueGet;
exports.responsiveValueGetDefinedValue = responsiveValueGetDefinedValue;
exports.responsiveValueGetFirstHigherValue = responsiveValueGetFirstHigherValue;
exports.responsiveValueGetFirstLowerValue = responsiveValueGetFirstLowerValue;
exports.responsiveValueGetHighestDefinedDevice = responsiveValueGetHighestDefinedDevice;
exports.responsiveValueMap = responsiveValueMap;
exports.responsiveValueNormalize = responsiveValueNormalize$1;
exports.responsiveValueReduce = responsiveValueReduce;
exports.responsiveValueValues = responsiveValueValues;
exports.richTextChangedEvent = richTextChangedEvent;
exports.scalarizeConfig = scalarizeConfig$1;
exports.selectionFramePositionChanged = selectionFramePositionChanged;
exports.serialize = serialize;
exports.spacingToPx = spacingToPx;
exports.stripRichTextPartSelection = stripRichTextPartSelection;
exports.textModifierSchemaProp = textModifierSchemaProp;
exports.traverseComponents = traverseComponents;
exports.uniqueId = uniqueId;
exports.useEasyblocksMetadata = useEasyblocksMetadata;
//# sourceMappingURL=EasyblocksBackend-225168fa.js.map
