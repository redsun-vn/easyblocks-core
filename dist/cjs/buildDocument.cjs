/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fonts = require('./fonts-ae304abc.js');
var configTraverse = require('./configTraverse-fbcc69f3.js');
require('js-xxhash');
require('zod');
require('postcss-value-parser');

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
 * Walks the entry tree and collects every `{ fontFamily, fontWeight? }` pair.
 * Returns deduplicated fonts with only the weights actually used.
 */
function extractFontsWithWeights(entry) {
  const map = new Map();
  traverse(entry, node => {
    if (node && typeof node === "object" && node.value && typeof node.value === "object" && typeof node.value.fontFamily === "string") {
      const family = node.value.fontFamily;
      const weight = typeof node.value.fontWeight === "number" ? node.value.fontWeight : 400;
      let weights = map.get(family);
      if (!weights) {
        weights = new Set();
        map.set(family, weights);
      }
      weights.add(weight);
    }
  });
  return Array.from(map.entries()).map(_ref => {
    let [family, weights] = _ref;
    return {
      family,
      weights: Array.from(weights).sort((a, b) => a - b)
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
  const fonts$1 = extractFontsWithWeights(entry);
  const [{
    meta,
    externalData,
    renderableContent,
    configAfterAuto
  }] = await Promise.all([fonts.buildEntry({
    entry,
    config,
    locale
  }), fonts.loadGoogleFonts({
    fonts: fonts$1,
    waitFontReady: true
  })]);
  return {
    renderableDocument: {
      renderableContent,
      meta: configTraverse.serialize(meta),
      configAfterAuto
    },
    externalData
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

exports.buildDocument = buildDocument;
