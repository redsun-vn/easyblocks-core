/* with love from shopstory */
import { b as isDocument, a as isComponentConfig, o as isLocalTextReference, s as isExternalSchemaProp, i as isTrulyResponsiveValue, p as responsiveValueEntries, k as getExternalReferenceLocationKey, t as serialize } from './findComponentDefinition-2b190cc9.js';
import { a as createCompilationContext, c as compileInternal, n as normalize, A as configTraverse } from './configTraverse-2e9c357d.js';

function mergeCompilationMeta(meta1, meta2) {
  if (!meta2 && !meta1) {
    throw new Error("Can't merge empty metadata");
  }
  if (!meta2) {
    return meta1;
  }
  if (!meta1) {
    return meta2;
  }
  return {
    vars: {
      ...meta1.vars,
      ...meta2.vars,
      definitions: {
        actions: mergeDefinitions(meta1.vars.definitions?.actions ?? [], meta2.vars.definitions?.actions ?? []),
        components: mergeDefinitions(meta1.vars.definitions?.components ?? [], meta2.vars.definitions?.components ?? []),
        textModifiers: mergeDefinitions(meta1.vars.definitions?.textModifiers ?? [], meta2.vars.definitions?.textModifiers ?? []),
        links: mergeDefinitions(meta1.vars.definitions?.links ?? [], meta2.vars.definitions?.links ?? [])
      }
    }
  };
}
function mergeDefinitions(definitions1, definitions2) {
  const mergeDefinitions = [...definitions1];
  definitions2.forEach(definition => {
    const isDuplicate = definitions1.some(d => d.id === definition.id);
    if (isDuplicate) {
      return;
    }
    mergeDefinitions.push(definition);
  });
  return mergeDefinitions;
}

function validate(input) {
  const isValid = input === null || input === undefined || isDocument(input) || isLegacyInput(input);
  if (!isValid) {
    return {
      isValid: false
    };
  }
  return {
    isValid: true,
    input: input
  };
}
function isLegacyInput(input) {
  return isComponentConfig(input);
}

function normalizeInput(input) {
  if (isLegacyInput(input)) {
    return input;
  }
  if (isDocument(input) && input.entry) {
    return input.entry;
  }
  throw new Error("Internal error: Can't obtain config from remote document.");
}

const compile = (content, config, contextParams) => {
  let resultMeta = {
    // @ts-expect-error We can leave `devices` and `locale` undefined because these values are set in `compileInternal`.
    vars: {},
    code: {}
  };
  const compilationContext = createCompilationContext(config, contextParams, content._component);
  const inputConfigComponent = normalizeInput(content);
  const {
    meta,
    compiled,
    configAfterAuto
  } = compileInternal(inputConfigComponent, compilationContext);
  resultMeta = mergeCompilationMeta(resultMeta, meta);
  return {
    compiled,
    configAfterAuto,
    meta: resultMeta
  };
};

const findExternals = (input, config, contextParams) => {
  const inputConfigComponent = normalizeInput(input);
  const externalsWithSchemaProps = [];
  const compilationContext = createCompilationContext(config, contextParams, input._component);
  const normalizedConfig = normalize(inputConfigComponent, compilationContext);
  configTraverse(normalizedConfig, compilationContext, _ref => {
    let {
      config,
      value,
      schemaProp
    } = _ref;
    // This kinda tricky, because "text" is a special case. It can be either local or external.
    // To prevent false positives, we need to check if it's local text reference and make sure that we won't
    // treat "text" that's actually external as non external.
    if (schemaProp.type === "text" && isLocalTextReference(value, "text") || schemaProp.type !== "text" && !isExternalSchemaProp(schemaProp, compilationContext.types)) {
      return;
    }
    const hasInputComponentRootParams = compilationContext.definitions.components.some(c => c.id === normalizedConfig._component && c.rootParams !== undefined);
    const configId = normalizedConfig._id === config._id && hasInputComponentRootParams ? "$" : config._id;
    if (isTrulyResponsiveValue(value)) {
      responsiveValueEntries(value).forEach(_ref2 => {
        let [breakpoint, currentValue] = _ref2;
        if (currentValue === undefined) {
          return;
        }
        externalsWithSchemaProps.push({
          id: getExternalReferenceLocationKey(configId, schemaProp.prop, breakpoint),
          schemaProp: schemaProp,
          externalReference: currentValue
        });
      });
    } else {
      externalsWithSchemaProps.push({
        id: getExternalReferenceLocationKey(configId, schemaProp.prop),
        schemaProp: schemaProp,
        externalReference: value
      });
    }
  });
  return externalsWithSchemaProps;
};

const defaultCompiler = {
  compile,
  findExternals,
  validate
};
function buildEntry(_ref) {
  let {
    entry,
    config,
    locale,
    compiler = defaultCompiler,
    externalData = {},
    isExternalDataChanged
  } = _ref;
  if (!compiler.validate(entry)) {
    throw new Error("Invalid entry");
  }
  const contextParams = {
    locale
  };
  const compilationResult = compiler.compile(entry, config, contextParams);
  const resourcesWithSchemaProps = compiler.findExternals(entry, config, contextParams);
  const pendingExternalData = findChangedExternalData(resourcesWithSchemaProps, externalData, isExternalDataChanged);
  return {
    renderableContent: compilationResult.compiled,
    meta: compilationResult.meta,
    externalData: pendingExternalData,
    configAfterAuto: compilationResult.configAfterAuto
  };
}
function findChangedExternalData(resourcesWithSchemaProps, externalData, isExternalDataPending) {
  const changedExternalData = {};
  function defaultIsExternalDataPending(id, resource, type) {
    // If null, then it's empty external value and it's not pending
    if (resource.externalId === null) {
      return false;
    }

    // If it's already fetched, then it's not pending
    if (externalData[id]) {
      return false;
    }

    // If id is a string and it's either local text reference or a reference to document's data, then it's not pending
    if (typeof resource.externalId === "string" && (isLocalTextReference({
      id: resource.externalId
    }, type) || resource.externalId.startsWith("$."))) {
      return false;
    }
    return true;
  }
  resourcesWithSchemaProps.forEach(_ref2 => {
    let {
      id,
      externalReference,
      schemaProp
    } = _ref2;
    const params = getExternalTypeParams(schemaProp);
    const externalData = {
      id,
      externalId: externalReference.id
    };
    if (isExternalDataPending) {
      if (!isExternalDataPending(externalData, resource => {
        return defaultIsExternalDataPending(id, resource, schemaProp.type);
      })) {
        return;
      }
    } else {
      const isPendingDefault = defaultIsExternalDataPending(id, externalData, schemaProp.type);
      if (!isPendingDefault) {
        return;
      }
    }
    if (changedExternalData[id]) {
      return;
    }
    changedExternalData[id] = {
      id: externalReference.id,
      widgetId: externalReference.widgetId,
      params
    };
  });
  return changedExternalData;
}
function getExternalTypeParams(schemaProp) {
  if (schemaProp.type === "text") {
    return;
  }
  return schemaProp.params;
}

function traverse(obj, visitor) {
  if (typeof obj !== "object" || obj === null) return;
  visitor(obj);
  if (Array.isArray(obj)) {
    obj.forEach(item => traverse(item, visitor));
  } else {
    Object.values(obj).forEach(value => traverse(value, visitor));
  }
}
/**
 * Walks the entry tree and collects every `{ fontFamily, fontWeight?, fontStyle? }` pair.
 * Splits weights into regular (`weights`) and italic (`italics`) axes based on `fontStyle`.
 * Returns deduplicated fonts with only the variants actually used.
 */
function extractFontsWithWeights(entry) {
  const map = new Map();
  traverse(entry, node => {
    if (node && typeof node === "object" && node.value && typeof node.value === "object" && typeof node.value.fontFamily === "string") {
      const family = node.value.fontFamily;
      const weight = typeof node.value.fontWeight === "number" ? node.value.fontWeight : 400;
      const isItalic = node.value.fontStyle === "italic";
      let entryMap = map.get(family);
      if (!entryMap) {
        entryMap = {
          weights: new Set(),
          italics: new Set()
        };
        map.set(family, entryMap);
      }
      (isItalic ? entryMap.italics : entryMap.weights).add(weight);
    }
  });
  return Array.from(map.entries()).map(_ref => {
    let [family, {
      weights,
      italics
    }] = _ref;
    return {
      family,
      weights: Array.from(weights).sort((a, b) => a - b),
      italics: Array.from(italics).sort((a, b) => a - b)
    };
  });
}

async function buildDocument(_ref) {
  let {
    documentId,
    config,
    locale
  } = _ref;
  const {
    entry
  } = await resolveEntryForDocument({
    documentId,
    config,
    locale
  });
  const fonts = extractFontsWithWeights(entry) || [];
  const {
    meta,
    externalData,
    renderableContent,
    configAfterAuto
  } = buildEntry({
    entry,
    config,
    locale
  });
  return {
    renderableDocument: {
      renderableContent,
      meta: serialize(meta),
      configAfterAuto
    },
    externalData,
    fonts
  };
}
async function resolveEntryForDocument(_ref2) {
  let {
    documentId,
    config,
    locale
  } = _ref2;
  try {
    const documentResponse = await config.backend.documents.get({
      id: documentId,
      locale
    });
    if (!documentResponse) {
      throw new Error(`Document with id ${documentId} not found.`);
    }
    return documentResponse;
  } catch {
    throw new Error(`Error fetching document with id ${documentId}.`);
  }
}

export { buildEntry as a, buildDocument as b, compile as c, findExternals as f, mergeCompilationMeta as m, normalizeInput as n, validate as v };
