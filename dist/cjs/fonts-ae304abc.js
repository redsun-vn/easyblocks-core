/* with love from shopstory */
'use strict';

var configTraverse = require('./configTraverse-fbcc69f3.js');

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
  const isValid = input === null || input === undefined || configTraverse.isDocument(input) || isLegacyInput(input);
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
  return configTraverse.isComponentConfig(input);
}

function normalizeInput(input) {
  if (isLegacyInput(input)) {
    return input;
  }
  if (configTraverse.isDocument(input) && input.entry) {
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
  const compilationContext = configTraverse.createCompilationContext(config, contextParams, content._component);
  const inputConfigComponent = normalizeInput(content);
  const {
    meta,
    compiled,
    configAfterAuto
  } = configTraverse.compileInternal(inputConfigComponent, compilationContext);
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
  const compilationContext = configTraverse.createCompilationContext(config, contextParams, input._component);
  const normalizedConfig = configTraverse.normalize(inputConfigComponent, compilationContext);
  configTraverse.configTraverse(normalizedConfig, compilationContext, _ref => {
    let {
      config,
      value,
      schemaProp
    } = _ref;
    // This kinda tricky, because "text" is a special case. It can be either local or external.
    // To prevent false positives, we need to check if it's local text reference and make sure that we won't
    // treat "text" that's actually external as non external.
    if (schemaProp.type === "text" && configTraverse.isLocalTextReference(value, "text") || schemaProp.type !== "text" && !configTraverse.isExternalSchemaProp(schemaProp, compilationContext.types)) {
      return;
    }
    const hasInputComponentRootParams = compilationContext.definitions.components.some(c => c.id === normalizedConfig._component && c.rootParams !== undefined);
    const configId = normalizedConfig._id === config._id && hasInputComponentRootParams ? "$" : config._id;
    if (configTraverse.isTrulyResponsiveValue(value)) {
      configTraverse.responsiveValueEntries(value).forEach(_ref2 => {
        let [breakpoint, currentValue] = _ref2;
        if (currentValue === undefined) {
          return;
        }
        externalsWithSchemaProps.push({
          id: configTraverse.getExternalReferenceLocationKey(configId, schemaProp.prop, breakpoint),
          schemaProp: schemaProp,
          externalReference: currentValue
        });
      });
    } else {
      externalsWithSchemaProps.push({
        id: configTraverse.getExternalReferenceLocationKey(configId, schemaProp.prop),
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
    if (typeof resource.externalId === "string" && (configTraverse.isLocalTextReference({
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

const defaultFontFamily = "Roboto";
const defaultFontSize = 16;
const defaultFontWeight = 400;
const defaultLineHeight = 1.4;
const fontFamilies = ["Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Inter", "Oswald", "Raleway", "Noto Sans", "Roboto Condensed", "Nunito", "Work Sans", "Rubik", "Mukta", "Ubuntu", "Quicksand", "Hind", "Fira Sans", "Barlow", "Cabin", "Prompt", "Heebo", "Source Sans 3", "Titillium Web", "Muli", "Manrope", "Josefin Sans", "Karla", "DM Sans", "PT Sans", "Tajawal", "Public Sans", "Catamaran", "Urbanist", "Outfit", "Lexend", "Signika", "Asap", "Sarabun", "Red Hat Display", "Exo 2", "Sen", "Epilogue", "Jost", "IBM Plex Sans", "Varela Round", "Mulish", "Spartan", "Krub", "Questrial", "Barlow Condensed", "Overpass", "Alata", "Kanit", "Noto Serif", "Merriweather", "Playfair Display", "Lora", "Cormorant Garamond", "EB Garamond", "PT Serif", "Libre Baskerville", "DM Serif Display", "Crimson Text", "Bitter", "Spectral", "Cormorant", "Zilla Slab", "Nanum Myeongjo", "Tinos", "Cardo", "Domine", "Arvo", "Vollkorn", "Bree Serif", "Alegreya", "Noticia Text", "Libre Caslon Text", "Faustina", "Mate", "Lusitana", "Arapey", "Fira Sans Condensed", "Space Grotesk", "Sofia Sans", "Niramit", "Be Vietnam Pro", "Eczar", "Quattrocento", "Rokkitt", "Cormorant Infant", "Slabo 27px", "Ultra", "Rozha One", "Old Standard TT", "Baskervville", "Play", "Mada", "Rajdhani", "Cabinet Grotesk", "Archivo", "Anton", "Bebas Neue", "Abril Fatface", "Alfa Slab One", "Righteous", "Lobster", "Pacifico", "Caveat", "Dancing Script", "Great Vibes", "Satisfy", "Shadows Into Light", "Cookie", "Gloria Hallelujah", "Indie Flower", "Courgette", "Amatic SC", "Fredoka", "Baloo 2", "Chewy", "Luckiest Guy", "Permanent Marker", "Architects Daughter", "Rock Salt", "Handlee", "Kaushan Script", "Patrick Hand", "Carter One", "Sigmar", "Rye", "Black Ops One", "Bungee", "Press Start 2P", "Space Mono", "Fira Code", "Roboto Mono", "JetBrains Mono", "Inconsolata", "Share Tech Mono", "Major Mono Display", "Source Code Pro", "Audiowide", "Syncopate", "Unica One", "Orbitron", "Chakra Petch", "Expletus Sans", "Staatliches", "Poiret One", "Aldrich", "Gruppo", "Viga", "Suez One", "Frank Ruhl Libre", "Cambo", "Marcellus", "Cinzel", "Judson", "Gelasio", "Abhaya Libre", "Cormorant SC", "Crimson Pro", "Noto Serif Display", "Sanchez", "DM Serif Text", "Fjord One", "Suranna", "Kreon", "Cormorant Upright", "Gloock", "Julius Sans One", "Assistant", "Encode Sans", "Nanum Gothic", "Maven Pro", "Overpass Mono", "Albert Sans", "Palanquin", "Chivo", "Arimo", "Exo", "Molengo", "Abel", "Teko", "Saira", "Jura", "Kumbh Sans", "Hepta Slab", "Azeret Mono", "League Spartan", "Rufina", "Crete Round", "Amiri", "Spectral SC", "Petrona", "Neuton", "Coustard", "Vidaloka", "Bellefair", "Antic Slab", "Copse", "DM Mono", "Anonymous Pro", "Oxygen Mono", "Courier Prime", "IBM Plex Mono", "Zilla Slab Highlight", "Shrikhand", "Bungee Shade", "Fugaz One", "Monoton", "Rammetto One", "Cinzel Decorative", "Fascinate Inline", "Racing Sans One", "Lilita One", "Potta One", "Tourney", "Cherry Swash", "Creepster", "Butcherman", "Ewert", "Bowlby One SC", "Galindo", "Knewave", "Fredoka One", "Ranchers", "Codystar", "VT323", "Cutive Mono", "IBM Plex Serif", "Philosopher"];
function getFontFamilies() {
  return fontFamilies.sort().map(font => {
    return {
      id: font,
      value: font,
      label: font
    };
  });
}
function getFontWeights() {
  return [
  // { id: "100", value: "100", label: "Thin (100)" },
  // { id: "200", value: "200", label: "Extra Light (200)" },
  {
    id: "300",
    value: "300",
    label: "Light (300)"
  }, {
    id: "400",
    value: "400",
    label: "Normal (400)"
  }, {
    id: "500",
    value: "500",
    label: "Medium (500)"
  }, {
    id: "600",
    value: "600",
    label: "Semi Bold (600)"
  }, {
    id: "700",
    value: "700",
    label: "Bold (700)"
  }, {
    id: "800",
    value: "800",
    label: "Extra Bold (800)"
  }
  // { id: "900", value: "900", label: "Black (900)" },
  ];
}
function getLineHeights() {
  return [{
    id: "1",
    value: "1",
    label: "1"
  }, {
    id: "1.1",
    value: "1.1",
    label: "1.1"
  }, {
    id: "1.2",
    value: "1.2",
    label: "1.2"
  }, {
    id: "1.3",
    value: "1.3",
    label: "1.3"
  }, {
    id: "1.4",
    value: "1.4",
    label: "1.4"
  }, {
    id: "1.4258",
    value: "1.4258",
    label: "1.4258"
  }, {
    id: "1.5",
    value: "1.5",
    label: "1.5"
  }, {
    id: "1.6",
    value: "1.6",
    label: "1.6"
  }, {
    id: "1.7",
    value: "1.7",
    label: "1.7"
  }, {
    id: "1.8",
    value: "1.8",
    label: "1.8"
  }, {
    id: "2",
    value: "2",
    label: "2"
  }];
}
const generateFontSizes = (from, to) => {
  if (typeof from !== "number" || typeof to !== "number" || from > to) {
    return [];
  }
  if (from === to) {
    return [{
      id: String(from.toString()),
      label: String(from.toString()),
      value: `${from.toString()}px`
    }];
  }
  let rs = [];
  for (let index = from; index <= to; index++) {
    rs.push({
      id: String(index.toString()),
      label: String(index.toString()),
      value: `${index.toString()}px`
    });
  }
  return rs;
};
function getFontSizes() {
  return generateFontSizes(1, 100).filter(s => typeof s.value === "string" && s.value.match(/\d+(\.\d+)?px\b/)).map(s => ({
    id: parseFloat(s.value).toString(),
    value: parseFloat(s.value).toString(),
    label: s.label ?? ""
  }));
}

// ---------------------------------------------------------------------------
// loadGoogleFonts
// ---------------------------------------------------------------------------

/** Tracks which family+weight combos are already injected. */
const loadedFontWeights = new Map();

/** Default weights to load when only family names (no weights) are provided. */
const DEFAULT_WEIGHTS = [400];

/** All weights loaded in editor mode. */
const EDITOR_WEIGHTS = [300, 400, 500, 600, 700, 800];

/**
 * Builds a Google Fonts API v1 URL.
 *
 * v1 format: `css?family=Open+Sans:300,400|Roboto:400,700`
 */
function buildGoogleFontsUrl(fonts) {
  const params = fonts.map(_ref => {
    let {
      family,
      weights
    } = _ref;
    return `${family.replace(/ /g, "+")}:${weights.join(",")}`;
  }).join("|");
  return `https://fonts.googleapis.com/css?family=${params}&display=swap`;
}

/**
 * Filters out font+weight combos that are already loaded.
 * Returns only the new combos, and marks them as loaded.
 */
function filterNewFontWeights(fonts) {
  const result = [];
  for (const {
    family,
    weights
  } of fonts) {
    let existing = loadedFontWeights.get(family);
    const newWeights = weights.filter(w => !existing?.has(w));
    if (newWeights.length === 0) continue;
    if (!existing) {
      existing = new Set();
      loadedFontWeights.set(family, existing);
    }
    for (const w of newWeights) {
      existing.add(w);
    }
    result.push({
      family,
      weights: newWeights
    });
  }
  return result;
}
/**
 * Injects a `<link>` stylesheet and waits for it to load.
 */
function injectLink(url) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  return new Promise((resolve, reject) => {
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load Google Fonts: ${url}`));
    document.head.appendChild(link);
  });
}

/**
 * Loads Google Fonts by injecting a `<link>` into `<head>`.
 *
 * Two modes:
 * - **Editor** (`editor: true`): loads all font families with weights 300–800.
 * - **Production** (default): loads only the fonts + weights actually used.
 */
async function loadGoogleFonts() {
  let {
    fonts,
    waitFontReady,
    editor
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (typeof window === "undefined") return;
  let requested;
  if (editor) {
    // Editor: all families with full weight range 300–800.
    const families = fonts && fonts.length > 0 && typeof fonts[0] === "string" ? fonts : fontFamilies;
    requested = families.map(f => ({
      family: f,
      weights: EDITOR_WEIGHTS
    }));
  } else if (!fonts) {
    requested = fontFamilies.map(f => ({
      family: f,
      weights: DEFAULT_WEIGHTS
    }));
  } else if (fonts.length > 0 && typeof fonts[0] === "string") {
    requested = fonts.map(f => ({
      family: f,
      weights: DEFAULT_WEIGHTS
    }));
  } else {
    requested = fonts;
  }
  const newFonts = filterNewFontWeights(requested);
  if (newFonts.length === 0) {
    if (waitFontReady) await document.fonts.ready;
    return;
  }
  await injectLink(buildGoogleFontsUrl(newFonts));
  if (waitFontReady) await document.fonts.ready;
}

exports.buildEntry = buildEntry;
exports.compile = compile;
exports.defaultFontFamily = defaultFontFamily;
exports.defaultFontSize = defaultFontSize;
exports.defaultFontWeight = defaultFontWeight;
exports.defaultLineHeight = defaultLineHeight;
exports.findExternals = findExternals;
exports.fontFamilies = fontFamilies;
exports.getFontFamilies = getFontFamilies;
exports.getFontSizes = getFontSizes;
exports.getFontWeights = getFontWeights;
exports.getLineHeights = getLineHeights;
exports.loadGoogleFonts = loadGoogleFonts;
exports.mergeCompilationMeta = mergeCompilationMeta;
exports.normalizeInput = normalizeInput;
exports.validate = validate;
