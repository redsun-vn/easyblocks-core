/* with love from shopstory */
'use strict';

var _extends = require('@babel/runtime/helpers/extends');
var React = require('react');
var ComponentBuilder = require('./ComponentBuilder-1abaa8b3.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _extends__default = /*#__PURE__*/_interopDefaultLegacy(_extends);
var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

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

/** Internal request shape — regular weights + italic weights per family. */

/** Tracks which family+weight combos are already injected, per axis. */
const loadedFontWeights = new Map();

/** Default weights to load when only family names (no weights) are provided. */
const DEFAULT_WEIGHTS = [400];

/** All weights loaded in editor mode (applied to both regular and italic axes). */
const EDITOR_WEIGHTS = [300, 400, 500, 600, 700, 800];

/**
 * Per-`<link>` URL budget. Google Fonts v1 + Chrome GET start failing well
 * before 8KB; 3500 chars keeps requests reliably deliverable.
 */
const URL_MAX_CHARS = 3500;
const FONTS_BASE_URL = "https://fonts.googleapis.com/css";
const FONTS_URL_SUFFIX = "&display=swap";

/** Serializes one family entry to its v1 token, e.g. `Open+Sans:400,400italic`. */
function serializeFamily(_ref) {
  let {
    family,
    weights,
    italics
  } = _ref;
  const tokens = [...weights.map(w => String(w)), ...italics.map(w => `${w}italic`)];
  return `${family.replace(/ /g, "+")}:${tokens.join(",")}`;
}

/**
 * Builds a Google Fonts API v1 URL.
 *
 * v1 format: `css?family=Open+Sans:400,700,400italic,700italic|Roboto:400`
 */
function buildGoogleFontsUrl(fonts) {
  const params = fonts.map(serializeFamily).join("|");
  return `${FONTS_BASE_URL}?family=${params}${FONTS_URL_SUFFIX}`;
}

/**
 * Splits requested families into batches such that each batch's URL stays
 * under {@link URL_MAX_CHARS}. Greedy packing — preserves family order.
 */
function chunkRequests(fonts) {
  const baseLen = FONTS_BASE_URL.length + "?family=".length + FONTS_URL_SUFFIX.length;
  const chunks = [];
  let current = [];
  let currentLen = baseLen;
  for (const font of fonts) {
    const token = serializeFamily(font);
    // +1 for the `|` separator between families (omitted on first entry of chunk).
    const addLen = token.length + (current.length > 0 ? 1 : 0);
    if (current.length > 0 && currentLen + addLen > URL_MAX_CHARS) {
      chunks.push(current);
      current = [];
      currentLen = baseLen;
    }
    current.push(font);
    currentLen += current.length === 1 ? token.length : addLen;
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}

/**
 * Filters out font+weight combos that are already loaded.
 * Regular and italic axes filtered independently. Returns only the new combos
 * per axis, and marks them as loaded.
 */
function filterNewFontWeights(fonts) {
  const result = [];
  for (const {
    family,
    weights,
    italics
  } of fonts) {
    let entry = loadedFontWeights.get(family);
    const newRegular = weights.filter(w => !entry?.regular.has(w));
    const newItalic = italics.filter(w => !entry?.italic.has(w));
    if (newRegular.length === 0 && newItalic.length === 0) continue;
    if (!entry) {
      entry = {
        regular: new Set(),
        italic: new Set()
      };
      loadedFontWeights.set(family, entry);
    }
    for (const w of newRegular) entry.regular.add(w);
    for (const w of newItalic) entry.italic.add(w);
    result.push({
      family,
      weights: newRegular,
      italics: newItalic
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
 * Loads Google Fonts by injecting one or more `<link>` tags into `<head>`.
 *
 * Two modes:
 * - **Editor** (`editor: true`): preloads all 233 families × weights 300–800
 *   × regular + italic axes. URL is split into chunks to stay under browser
 *   and Google Fonts URL length limits.
 * - **Production** (default): loads only the variants actually present in
 *   the document. Italic variants come from `ExtractedFont.italics`.
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
    // Editor: all families with full weight range 300–800 for regular AND italic.
    const families = fonts && fonts.length > 0 && typeof fonts[0] === "string" ? fonts : fontFamilies;
    requested = families.map(f => ({
      family: f,
      weights: EDITOR_WEIGHTS,
      italics: EDITOR_WEIGHTS
    }));
  } else if (!fonts) {
    requested = fontFamilies.map(f => ({
      family: f,
      weights: DEFAULT_WEIGHTS,
      italics: DEFAULT_WEIGHTS
    }));
  } else if (fonts.length > 0 && typeof fonts[0] === "string") {
    requested = fonts.map(f => ({
      family: f,
      weights: DEFAULT_WEIGHTS,
      italics: DEFAULT_WEIGHTS
    }));
  } else {
    // ExtractedFont[] — defensive default for italics if consumer omits it.
    requested = fonts.map(f => ({
      family: f.family,
      weights: f.weights,
      italics: f.italics.length ? f.italics : f.weights
    }));
  }
  const newFonts = filterNewFontWeights(requested);
  if (newFonts.length === 0) {
    if (waitFontReady) await document.fonts.ready;
    return;
  }
  const chunks = chunkRequests(newFonts);
  await Promise.all(chunks.map(c => injectLink(buildGoogleFontsUrl(c))));
  if (waitFontReady) await document.fonts.ready;
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
    components,
    fonts,
    stitches
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
  React.useEffect(() => {
    if (fonts?.length) {
      loadGoogleFonts({
        fonts
      }).catch(e => {
        console.error("Failed to load Google Fonts", e);
      });
    }
  }, [fonts]);
  return /*#__PURE__*/React__default["default"].createElement(ComponentBuilder.EasyblocksMetadataProvider, {
    meta: renderableDocument.meta,
    stitches: stitches
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

exports.Easyblocks = Easyblocks;
exports.LazyEasyblocks = LazyEasyblocks;
exports.defaultFontFamily = defaultFontFamily;
exports.defaultFontSize = defaultFontSize;
exports.defaultFontWeight = defaultFontWeight;
exports.defaultLineHeight = defaultLineHeight;
exports.fontFamilies = fontFamilies;
exports.getFontFamilies = getFontFamilies;
exports.getFontSizes = getFontSizes;
exports.getFontWeights = getFontWeights;
exports.getLineHeights = getLineHeights;
exports.loadGoogleFonts = loadGoogleFonts;
