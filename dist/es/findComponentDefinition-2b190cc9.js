/* with love from shopstory */
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/ban-types
function toArray(scalarOrCollection) {
  if (Array.isArray(scalarOrCollection)) {
    return scalarOrCollection;
  }
  return [scalarOrCollection];
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
const documentSchema = z.object({
  documentId: z.string(),
  projectId: z.string(),
  rootContainer: z.string().optional(),
  preview: z.object({}).optional(),
  config: z.optional(z.object({}))
});
function isDocument(value) {
  return documentSchema.safeParse(value).success;
}
function isComponentConfig(value) {
  return typeof value === "object" && typeof value?._component === "string" && typeof value?._id === "string";
}
const localValueSchema = z.object({
  value: z.any(),
  widgetId: z.string()
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
function isTrulyResponsiveValue(x) {
  return typeof x === "object" && x !== null && !Array.isArray(x) && x.$res === true;
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
  if (!isTrulyResponsiveValue(resVal)) {
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

function allDefs(context) {
  return context?.definitions.components || [];
}

/**
 * Lazily-built Map cache for O(1) definition lookup by id.
 * Keyed on the definitions.components array reference — rebuilt only when the array changes.
 */
const _defMapCache = new WeakMap();
function getDefMap(context) {
  const defs = allDefs(context);
  let map = _defMapCache.get(defs);
  if (!map) {
    map = new Map(defs.map(d => [d.id, d]));
    _defMapCache.set(defs, map);
  }
  return map;
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
  return getDefMap(context).get(id);
}

export { findComponentDefinition as A, isSchemaPropActionTextModifier as B, isSchemaPropTextModifier as C, compileBox as D, toArray as E, findComponentDefinitionsByType as F, getBoxStyles as G, isCustomSchemaProp as H, textModifierSchemaProp as I, isComponentConfig as a, isDocument as b, isEmptyExternalReference as c, isEmptyRenderableContent as d, isIdReferenceToDocumentExternalValue as e, isLocalValue as f, isNonEmptyRenderableContent as g, isRenderableContent as h, isTrulyResponsiveValue as i, isResolvedCompoundExternalDataValue as j, getExternalReferenceLocationKey as k, getExternalValue as l, getResolvedExternalDataValue as m, isCompoundExternalDataValue as n, isLocalTextReference as o, responsiveValueEntries as p, responsiveValueMap as q, resolveExternalValue as r, isExternalSchemaProp as s, serialize as t, isSchemaPropComponentOrComponentCollection as u, findComponentDefinitionById as v, entries as w, isSchemaPropComponent as x, isSchemaPropCollection as y, isSchemaPropComponentCollectionLocalised as z };
