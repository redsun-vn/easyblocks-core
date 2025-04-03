/* with love from shopstory */
import { i as isTrulyResponsiveValue, a as isDocument, b as isComponentConfig, c as createCompilationContext, d as compileInternal, n as normalize, e as configTraverse, f as isLocalTextReference, g as isExternalSchemaProp, r as responsiveValueEntries, h as getExternalReferenceLocationKey, s as serialize, j as cleanString, E as EasyblocksMetadataProvider, k as EasyblocksExternalDataProvider, C as ComponentBuilder, R as RichTextPartClient } from './EasyblocksBackend-fd68f091.js';
export { D as CompilationCache, a2 as EasyblocksBackend, l as buildRichTextNoCodeEntry, d as compileInternal, c as createCompilationContext, p as easyblocksGetCssText, q as easyblocksGetStyleTag, G as getDefaultLocale, o as getDevicesWidths, h as getExternalReferenceLocationKey, J as getExternalValue, I as getFallbackForLocale, H as getFallbackLocaleForLocale, K as getResolvedExternalDataValue, F as getSchemaDefinition, b as isComponentConfig, M as isCompoundExternalDataValue, a as isDocument, x as isEmptyExternalReference, A as isEmptyRenderableContent, w as isIdReferenceToDocumentExternalValue, f as isLocalTextReference, B as isLocalValue, z as isNonEmptyRenderableContent, y as isRenderableContent, v as isResolvedCompoundExternalDataValue, i as isTrulyResponsiveValue, n as normalize, u as parseSpacing, L as resolveExternalValue, m as resolveLocalisedValue, Z as responsiveValueAt, r as responsiveValueEntries, N as responsiveValueFill, Q as responsiveValueFindDeviceWithDefinedValue, O as responsiveValueFindHigherDeviceWithDefinedValue, P as responsiveValueFindLowerDeviceWithDefinedValue, Y as responsiveValueFlatten, T as responsiveValueForceGet, S as responsiveValueGet, W as responsiveValueGetDefinedValue, U as responsiveValueGetFirstHigherValue, V as responsiveValueGetFirstLowerValue, a1 as responsiveValueGetHighestDefinedDevice, X as responsiveValueMap, a0 as responsiveValueNormalize, $ as responsiveValueReduce, _ as responsiveValueValues, t as spacingToPx } from './EasyblocksBackend-fd68f091.js';
import React, { useEffect } from 'react';
import _extends from '@babel/runtime/helpers/extends';
import 'js-xxhash';
import 'postcss-value-parser';
import 'zod';
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

export { Easyblocks, box, buildDocument, buildEntry, compile, findExternals, isNoCodeComponentOfType, mergeCompilationMeta, normalizeInput, responsiveValueSet, validate };
//# sourceMappingURL=index.js.map
