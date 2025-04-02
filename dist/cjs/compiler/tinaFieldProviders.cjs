/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utils = require('@easyblocks/utils');

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
      let tokens = utils.assertDefined(editorContext.theme[customTypeDefinition.token], `Missing token values within the Easyblocks config for "${customTypeDefinition.token}"`);
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

exports.getTinaField = getTinaField;
