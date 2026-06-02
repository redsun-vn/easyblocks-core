/* with love from shopstory */
export { b as buildDocument, a as buildEntry, c as compile, d as defaultFontFamily, e as defaultFontSize, g as defaultFontWeight, h as defaultLineHeight, f as findExternals, i as fontFamilies, j as getFontFamilies, k as getFontSizes, l as getFontWeights, o as getLineHeights, p as loadGoogleFonts, m as mergeCompilationMeta, n as normalizeInput, v as validate } from './buildDocument-013d209c.js';
import { i as isTrulyResponsiveValue } from './configTraverse-49ec7945.js';
export { C as CompilationCache, o as buildRichTextNoCodeEntry, k as compileInternal, l as createCompilationContext, q as getDefaultLocale, p as getDevicesWidths, u as getExternalReferenceLocationKey, w as getExternalValue, s as getFallbackForLocale, t as getFallbackLocaleForLocale, x as getResolvedExternalDataValue, m as getSchemaDefinition, a as isComponentConfig, y as isCompoundExternalDataValue, b as isDocument, c as isEmptyExternalReference, d as isEmptyRenderableContent, e as isIdReferenceToDocumentExternalValue, z as isLocalTextReference, f as isLocalValue, g as isNonEmptyRenderableContent, h as isRenderableContent, j as isResolvedCompoundExternalDataValue, i as isTrulyResponsiveValue, n as normalize, R as parseSpacing, A as resolveExternalValue, r as resolveLocalisedValue, B as responsiveValueAt, D as responsiveValueEntries, E as responsiveValueFill, F as responsiveValueFindDeviceWithDefinedValue, G as responsiveValueFindHigherDeviceWithDefinedValue, H as responsiveValueFindLowerDeviceWithDefinedValue, I as responsiveValueFlatten, J as responsiveValueForceGet, K as responsiveValueGet, L as responsiveValueGetDefinedValue, M as responsiveValueGetFirstHigherValue, N as responsiveValueGetFirstLowerValue, O as responsiveValueGetHighestDefinedDevice, P as responsiveValueMap, Q as responsiveValueNormalize, S as spacingToPx, v as validateColor } from './configTraverse-49ec7945.js';
import React, { useEffect } from 'react';
import _extends from '@babel/runtime/helpers/extends';
import { c as cleanString, E as EasyblocksMetadataProvider, a as EasyblocksExternalDataProvider, C as ComponentBuilder, R as RichTextPartClient } from './ComponentBuilder-6e74bb94.js';
export { e as easyblocksGetCssText, b as easyblocksGetStyleTag, r as responsiveValueValues } from './ComponentBuilder-6e74bb94.js';
import 'js-xxhash';
import 'zod';
import 'postcss-value-parser';
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

function RichTextClient(props) {
  const {
    elements: Elements,
    Root
  } = props;
  return /*#__PURE__*/React.createElement(Root.type, Root.props, Elements.map((Element, index) => {
    return /*#__PURE__*/React.createElement(Element.type, _extends({}, Element.props, {
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
  const elements = Elements.map((Element, index) => /*#__PURE__*/React.createElement(Element.type, _extends({}, Element.props, {
    key: index
  })));
  if (type === "paragraph") {
    return /*#__PURE__*/React.createElement(Paragraph.type, Paragraph.props, elements);
  }
  if (type === "bulleted-list") {
    return /*#__PURE__*/React.createElement(BulletedList.type, BulletedList.props, elements);
  }
  if (type === "numbered-list") {
    return /*#__PURE__*/React.createElement(NumberedList.type, NumberedList.props, elements);
  }
  if (process.env.NODE_ENV === "development") {
    console.warn(`Unknown @easyblocks/rich-text-block-element type "${type}"`);
  }
  return /*#__PURE__*/React.createElement("div", null, elements);
}

function RichTextLineElementClient(props) {
  const {
    blockType,
    elements: Elements,
    ListItem,
    TextLine
  } = props;
  const elements = Elements.map((Element, index) => /*#__PURE__*/React.createElement(Element.type, _extends({}, Element.props, {
    key: index
  })));
  if (blockType === "paragraph") {
    return /*#__PURE__*/React.createElement(TextLine.type, TextLine.props, elements);
  }
  if (blockType === "bulleted-list" || blockType === "numbered-list") {
    return /*#__PURE__*/React.createElement(ListItem.type, ListItem.props, /*#__PURE__*/React.createElement("div", null, elements));
  }
  if (process.env.NODE_ENV === "development") {
    console.warn(`Unknown @easyblocks/rich-text-line-element blockType "${blockType}"`);
  }
  return /*#__PURE__*/React.createElement("div", null, elements);
}

function TextClient(props) {
  const {
    value,
    Text
  } = props;

  // We need to transform new lines into <br />
  const lines = cleanString(value || "").split(/(?:\r\n|\r|\n)/g);
  const elements = [];
  lines.forEach((line, index) => {
    elements.push(/*#__PURE__*/React.createElement(React.Fragment, {
      key: index
    }, line));
    if (index !== lines.length - 1) {
      elements.push(/*#__PURE__*/React.createElement("br", {
        key: "br" + index
      }));
    }
  });
  return /*#__PURE__*/React.createElement(Text.type, Text.props, elements);
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
  return /*#__PURE__*/React.createElement("div", {
    style: rootStyles
  }, /*#__PURE__*/React.createElement("div", {
    style: ratioStyles({
      type
    })
  }), /*#__PURE__*/React.createElement("div", {
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
  "@easyblocks/rich-text-part": RichTextPartClient,
  "@easyblocks/text.client": TextClient,
  "EditableComponentBuilder.client": ComponentBuilder
};
function Easyblocks(_ref) {
  let {
    renderableDocument,
    externalData,
    componentOverrides,
    components
  } = _ref;
  useEffect(() => {
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
  return /*#__PURE__*/React.createElement(EasyblocksMetadataProvider, {
    meta: renderableDocument.meta
  }, /*#__PURE__*/React.createElement(EasyblocksExternalDataProvider, {
    externalData: externalData ?? {}
  }, /*#__PURE__*/React.createElement(ComponentBuilder, {
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

export { Easyblocks, box, getBrightnessColor, globalSectionGroups, isNoCodeComponentOfType, responsiveValueReduce, responsiveValueSet };
