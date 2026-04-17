/* with love from shopstory */
import { b as buildEntry, o as loadGoogleFonts } from './fonts-1ff388a2.js';
import { W as serialize } from './configTraverse-50d22a2b.js';
import 'js-xxhash';
import 'zod';
import 'postcss-value-parser';

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
  const fonts = extractFontsWithWeights(entry);
  const [{
    meta,
    externalData,
    renderableContent,
    configAfterAuto
  }] = await Promise.all([buildEntry({
    entry,
    config,
    locale
  }), loadGoogleFonts({
    fonts,
    waitFontReady: true
  })]);
  return {
    renderableDocument: {
      renderableContent,
      meta: serialize(meta),
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

export { buildDocument };
