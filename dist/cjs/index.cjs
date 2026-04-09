/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var ComponentBuilder = require('./ComponentBuilder-97eaa5a6.js');
var React = require('react');
var _extends = require('@babel/runtime/helpers/extends');
require('js-xxhash');
require('postcss-value-parser');
require('zod');
require('@stitches/core');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);
var _extends__default = /*#__PURE__*/_interopDefaultLegacy(_extends);

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
  if (ComponentBuilder.isTrulyResponsiveValue(responsiveValue)) {
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
  const isValid = input === null || input === undefined || ComponentBuilder.isDocument(input) || isLegacyInput(input);
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
  return ComponentBuilder.isComponentConfig(input);
}

function normalizeInput(input) {
  if (isLegacyInput(input)) {
    return input;
  }
  if (ComponentBuilder.isDocument(input) && input.entry) {
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
  const compilationContext = ComponentBuilder.createCompilationContext(config, contextParams, content._component);
  const inputConfigComponent = normalizeInput(content);
  const {
    meta,
    compiled,
    configAfterAuto
  } = ComponentBuilder.compileInternal(inputConfigComponent, compilationContext);
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
  const compilationContext = ComponentBuilder.createCompilationContext(config, contextParams, input._component);
  const normalizedConfig = ComponentBuilder.normalize(inputConfigComponent, compilationContext);
  ComponentBuilder.configTraverse(normalizedConfig, compilationContext, _ref => {
    let {
      config,
      value,
      schemaProp
    } = _ref;
    // This kinda tricky, because "text" is a special case. It can be either local or external.
    // To prevent false positives, we need to check if it's local text reference and make sure that we won't
    // treat "text" that's actually external as non external.
    if (schemaProp.type === "text" && ComponentBuilder.isLocalTextReference(value, "text") || schemaProp.type !== "text" && !ComponentBuilder.isExternalSchemaProp(schemaProp, compilationContext.types)) {
      return;
    }
    const hasInputComponentRootParams = compilationContext.definitions.components.some(c => c.id === normalizedConfig._component && c.rootParams !== undefined);
    const configId = normalizedConfig._id === config._id && hasInputComponentRootParams ? "$" : config._id;
    if (ComponentBuilder.isTrulyResponsiveValue(value)) {
      ComponentBuilder.responsiveValueEntries(value).forEach(_ref2 => {
        let [breakpoint, currentValue] = _ref2;
        if (currentValue === undefined) {
          return;
        }
        externalsWithSchemaProps.push({
          id: ComponentBuilder.getExternalReferenceLocationKey(configId, schemaProp.prop, breakpoint),
          schemaProp: schemaProp,
          externalReference: currentValue
        });
      });
    } else {
      externalsWithSchemaProps.push({
        id: ComponentBuilder.getExternalReferenceLocationKey(configId, schemaProp.prop),
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
    if (typeof resource.externalId === "string" && (ComponentBuilder.isLocalTextReference({
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
const extractFonts = entry => {
  const fonts = new Map();
  traverse(entry, node => {
    if (node && typeof node === "object" && node.value && typeof node.value === "object" && typeof node.value.fontFamily === "string") {
      const family = node.value.fontFamily;
      if (!fonts.has(family)) {
        fonts.set(family, undefined);
      }
    }
  });
  return Array.from(fonts.keys());
};

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
const loadedFonts = new Set();
async function loadGoogleFonts() {
  let {
    fonts,
    waitFontReady
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (typeof window === "undefined") return;
  const selectedFonts = (fonts ?? fontFamilies).filter(f => !loadedFonts.has(f));
  if (!selectedFonts.length) {
    if (waitFontReady) {
      await document.fonts.ready;
    }
    return;
  }
  selectedFonts.forEach(f => loadedFonts.add(f));
  const families = selectedFonts.map(f => `${f.replace(/ /g, "+")}:300,400,500,600,700,800`).join("|");
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css?family=${families}&display=swap`;
  document.head.appendChild(link);
  if (waitFontReady) {
    await document.fonts.ready;
  }
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
  const fonts = extractFonts(entry);
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
      meta: ComponentBuilder.serialize(meta),
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
    components
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
  return /*#__PURE__*/React__default["default"].createElement(ComponentBuilder.EasyblocksMetadataProvider, {
    meta: renderableDocument.meta
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

exports.CompilationCache = ComponentBuilder.CompilationCache;
exports.buildRichTextNoCodeEntry = ComponentBuilder.buildRichTextNoCodeEntry;
exports.compileInternal = ComponentBuilder.compileInternal;
exports.createCompilationContext = ComponentBuilder.createCompilationContext;
exports.easyblocksGetCssText = ComponentBuilder.easyblocksGetCssText;
exports.easyblocksGetStyleTag = ComponentBuilder.easyblocksGetStyleTag;
exports.getDefaultLocale = ComponentBuilder.getDefaultLocale;
exports.getDevicesWidths = ComponentBuilder.getDevicesWidths;
exports.getExternalReferenceLocationKey = ComponentBuilder.getExternalReferenceLocationKey;
exports.getExternalValue = ComponentBuilder.getExternalValue;
exports.getFallbackForLocale = ComponentBuilder.getFallbackForLocale;
exports.getFallbackLocaleForLocale = ComponentBuilder.getFallbackLocaleForLocale;
exports.getResolvedExternalDataValue = ComponentBuilder.getResolvedExternalDataValue;
exports.getSchemaDefinition = ComponentBuilder.getSchemaDefinition;
exports.isComponentConfig = ComponentBuilder.isComponentConfig;
exports.isCompoundExternalDataValue = ComponentBuilder.isCompoundExternalDataValue;
exports.isDocument = ComponentBuilder.isDocument;
exports.isEmptyExternalReference = ComponentBuilder.isEmptyExternalReference;
exports.isEmptyRenderableContent = ComponentBuilder.isEmptyRenderableContent;
exports.isIdReferenceToDocumentExternalValue = ComponentBuilder.isIdReferenceToDocumentExternalValue;
exports.isLocalTextReference = ComponentBuilder.isLocalTextReference;
exports.isLocalValue = ComponentBuilder.isLocalValue;
exports.isNonEmptyRenderableContent = ComponentBuilder.isNonEmptyRenderableContent;
exports.isRenderableContent = ComponentBuilder.isRenderableContent;
exports.isResolvedCompoundExternalDataValue = ComponentBuilder.isResolvedCompoundExternalDataValue;
exports.isTrulyResponsiveValue = ComponentBuilder.isTrulyResponsiveValue;
exports.normalize = ComponentBuilder.normalize;
exports.parseSpacing = ComponentBuilder.parseSpacing;
exports.resolveExternalValue = ComponentBuilder.resolveExternalValue;
exports.resolveLocalisedValue = ComponentBuilder.resolveLocalisedValue;
exports.responsiveValueAt = ComponentBuilder.responsiveValueAt;
exports.responsiveValueEntries = ComponentBuilder.responsiveValueEntries;
exports.responsiveValueFill = ComponentBuilder.responsiveValueFill;
exports.responsiveValueFindDeviceWithDefinedValue = ComponentBuilder.responsiveValueFindDeviceWithDefinedValue;
exports.responsiveValueFindHigherDeviceWithDefinedValue = ComponentBuilder.responsiveValueFindHigherDeviceWithDefinedValue;
exports.responsiveValueFindLowerDeviceWithDefinedValue = ComponentBuilder.responsiveValueFindLowerDeviceWithDefinedValue;
exports.responsiveValueFlatten = ComponentBuilder.responsiveValueFlatten;
exports.responsiveValueForceGet = ComponentBuilder.responsiveValueForceGet;
exports.responsiveValueGet = ComponentBuilder.responsiveValueGet;
exports.responsiveValueGetDefinedValue = ComponentBuilder.responsiveValueGetDefinedValue;
exports.responsiveValueGetFirstHigherValue = ComponentBuilder.responsiveValueGetFirstHigherValue;
exports.responsiveValueGetFirstLowerValue = ComponentBuilder.responsiveValueGetFirstLowerValue;
exports.responsiveValueGetHighestDefinedDevice = ComponentBuilder.responsiveValueGetHighestDefinedDevice;
exports.responsiveValueMap = ComponentBuilder.responsiveValueMap;
exports.responsiveValueNormalize = ComponentBuilder.responsiveValueNormalize;
exports.responsiveValueReduce = ComponentBuilder.responsiveValueReduce;
exports.responsiveValueValues = ComponentBuilder.responsiveValueValues;
exports.spacingToPx = ComponentBuilder.spacingToPx;
exports.validateColor = ComponentBuilder.validateColor;
exports.Easyblocks = Easyblocks;
exports.box = box;
exports.buildDocument = buildDocument;
exports.buildEntry = buildEntry;
exports.compile = compile;
exports.defaultFontFamily = defaultFontFamily;
exports.defaultFontSize = defaultFontSize;
exports.defaultFontWeight = defaultFontWeight;
exports.defaultLineHeight = defaultLineHeight;
exports.findExternals = findExternals;
exports.fontFamilies = fontFamilies;
exports.getBrightnessColor = getBrightnessColor;
exports.getFontFamilies = getFontFamilies;
exports.getFontSizes = getFontSizes;
exports.getFontWeights = getFontWeights;
exports.getLineHeights = getLineHeights;
exports.globalSectionGroups = globalSectionGroups;
exports.isNoCodeComponentOfType = isNoCodeComponentOfType;
exports.loadGoogleFonts = loadGoogleFonts;
exports.mergeCompilationMeta = mergeCompilationMeta;
exports.normalizeInput = normalizeInput;
exports.responsiveValueSet = responsiveValueSet;
exports.validate = validate;
