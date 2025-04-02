/* with love from shopstory */
import { getFallbackLocaleForLocale, getFallbackForLocale } from '../locales.js';
import { buildRichTextNoCodeEntry } from './builtins/_richText/builders.js';
import { compileComponent } from './compileComponent.js';
import { getDevicesWidths } from './devices.js';
import { findComponentDefinitionById, findComponentDefinitionsByType } from './findComponentDefinition.js';
import { responsiveValueFlatten } from '../responsiveness/responsiveValueFlatten.js';
import { isLocalValue } from '../checkers.js';
import { isTrulyResponsiveValue } from '../responsiveness/isTrulyResponsiveValue.js';
import { responsiveValueAt } from '../responsiveness/responsiveValueAt.js';
import { responsiveValueMap } from '../responsiveness/responsiveValueMap.js';
import { responsiveValueFill } from '../responsiveness/responsiveValueFill.js';
import { uniqueId } from '../utils/uniqueId.js';

const textProvider = (schemaProp, compilationContext) => {
  const checkIfValid = x => {
    if (typeof x !== "object" || x === null) {
      return false;
    }
    if (typeof x.id === "string") {
      if (x.id.startsWith("local.")) {
        // for local values "value" must be object
        if (typeof x.value !== "object" || x.value === null) {
          return false;
        }
      }
    }
    return true;
  };
  return {
    normalize: x => {
      if (x === undefined || x === null) {
        return {
          id: "local." + uniqueId(),
          value: {
            [compilationContext.contextParams.locale]: schemaProp.defaultValue ?? "Lorem ipsum"
          },
          widgetId: "@easyblocks/local-text"
        };
      }
      if (checkIfValid(x)) {
        return x;
      }
      throw new Error(`incorrect text type: ${x}`);
    },
    compile: x => {
      if ("value" in x) {
        const value = x.value[compilationContext.contextParams.locale];

        // Let's apply fallback
        if (typeof value !== "string") {
          const fallbackValue = getFallbackForLocale(x.value, compilationContext.contextParams.locale, compilationContext.locales) ?? "";
          return {
            id: x.id,
            value: fallbackValue,
            widgetId: "@easyblocks/local-text"
          };
        }
        return {
          id: x.id,
          value,
          widgetId: "@easyblocks/local-text"
        };
      }
      return {
        id: x.id,
        widgetId: x.widgetId,
        ...(x.id !== null && {
          key: x.key
        })
      };
    },
    getHash: value => {
      // TODO: those conditions will be removed after we merge external-local texts update
      if (typeof value === "string") {
        return value;
      }
      if (value === null) {
        return undefined;
      }
      return value.id ?? undefined;
    }
  };
};
const schemaPropDefinitions = {
  text: textProvider,
  number: (schemaProp, compilationContext) => {
    const normalize = getNormalize(compilationContext, schemaProp.defaultValue, 0, x => typeof x === "number" ? x : undefined);
    return {
      normalize,
      compile: x => x,
      getHash: value => {
        return value.toString();
      }
    };
  },
  string: (schemaProp, compilationContext) => {
    const normalize = schemaProp.responsive ? getResponsiveNormalize(compilationContext, schemaProp.defaultValue, "", x => typeof x === "string" ? x : undefined) : getNormalize(compilationContext, schemaProp.defaultValue, "", x => typeof x === "string" ? x : undefined);
    return {
      normalize,
      compile: x => x,
      getHash: (value, breakpointIndex) => {
        if (isTrulyResponsiveValue(value)) {
          return responsiveValueAt(value, breakpointIndex);
        }
        return value;
      }
    };
  },
  boolean: (schemaProp, compilationContext) => {
    const normalize = schemaProp.responsive ? getResponsiveNormalize(compilationContext, schemaProp.defaultValue, false, x => typeof x === "boolean" ? x : undefined) : getNormalize(compilationContext, schemaProp.defaultValue, false, x => typeof x === "boolean" ? x : undefined);
    return {
      normalize,
      compile: x => x,
      getHash: (value, breakpointIndex) => {
        if (isTrulyResponsiveValue(value)) {
          const breakpointValue = responsiveValueAt(value, breakpointIndex);
          return breakpointValue?.toString();
        }
        return value.toString();
      }
    };
  },
  select: getSelectSchemaPropDefinition(),
  "radio-group": getSelectSchemaPropDefinition(),
  component: (schemaProp, compilationContext) => {
    // Here:
    // 1. if non-fixed => block field.
    // 2. if fixed => block field with "fixed" flag (no component picker).
    const normalize = x => {
      if (!Array.isArray(x) || x.length === 0) {
        let componentDefinition;
        for (const componentIdOrType of schemaProp.accepts) {
          componentDefinition = findComponentDefinitionById(componentIdOrType, compilationContext);
          if (!componentDefinition) {
            const componentDefinitionsByType = findComponentDefinitionsByType(componentIdOrType, compilationContext);
            if (componentDefinitionsByType.length > 0) {
              componentDefinition = componentDefinitionsByType[0];
              break;
            }
          } else {
            break;
          }
        }
        if (schemaProp.required) {
          if (!componentDefinition) {
            throw new Error(`Missing component definition for prop "${schemaProp.prop}" for specified accepted types: [${schemaProp.accepts.join(", ")}]`);
          }
          return [normalizeComponent({
            _component: componentDefinition.id
          }, compilationContext)];
        }
        return [];
      }
      return [normalizeComponent(x[0], compilationContext)];
    };
    return {
      normalize,
      compile: (arg, contextProps, serializedDefinitions, editingInfoComponent, configPrefix, cache) => {
        if (arg.length === 0) {
          return [];
        }

        // FIXME: ?????
        const {
          configAfterAuto,
          compiledComponentConfig
        } = compileComponent(arg[0], compilationContext, contextProps, serializedDefinitions || {
          components: []
        }, cache, editingInfoComponent, `${configPrefix}.0`);
        return [{
          configAfterAuto,
          compiledComponentConfig
        }];
      },
      getHash: value => {
        if (value.length > 0) {
          // For now, if the block's value contains elements, it will only contain single element
          if (process.env.NODE_ENV === "development") {
            console.assert(value.length === 1, "component prop should have only one element");
          }
          return value[0]._component;
        }
        return "__BLOCK_EMPTY__";
      }
    };
  },
  "component-collection": (_, compilationContext) => {
    const normalize = x => {
      if (!Array.isArray(x)) {
        return [];
      }
      const ret = (x || []).map(item => normalizeComponent(item, compilationContext));
      return ret;
    };
    return {
      normalize,
      compile: (arr, contextProps, serializedDefinitions, editingInfoComponents, configPrefix, cache) => {
        return arr.map((componentConfig, index) => compileComponent(componentConfig, compilationContext, (contextProps.itemProps || [])[index] || {}, serializedDefinitions, cache, editingInfoComponents?.items?.[index], `${configPrefix}.${index}`));
      },
      getHash: value => {
        return value.map(v => v._component).join(";");
      }
    };
  },
  "component-collection-localised": (schemaProp, compilationContext) => {
    const collectionSchemaPropDefinition = schemaPropDefinitions["component-collection"]({
      ...schemaProp,
      type: "component-collection"
    }, compilationContext);
    return {
      normalize: x => {
        if (x === undefined) {
          return {};
        }
        const normalized = {};
        for (const locale in x) {
          if (locale === "__fallback") {
            continue;
          }
          normalized[locale] = collectionSchemaPropDefinition.normalize(x[locale]);
        }
        return normalized;
      },
      compile: (value, contextProps, serializedDefinitions, editingInfoComponents, configPrefix, cache) => {
        const resolvedLocalisedValue = resolveLocalisedValue(value, compilationContext);
        return collectionSchemaPropDefinition.compile(resolvedLocalisedValue?.value ?? [], contextProps, serializedDefinitions, editingInfoComponents, `${configPrefix}.${resolvedLocalisedValue?.locale ?? compilationContext.contextParams.locale}`, cache);
      },
      getHash: (value, breakpoint, devices) => {
        return collectionSchemaPropDefinition.getHash(value[compilationContext.contextParams.locale] ?? [], breakpoint, devices);
      }
    };
  },
  component$$$: () => {
    return {
      normalize: x => x,
      compile: x => x,
      getHash: x => x._component
    };
  },
  // external: (schemaProp, compilationContext) => {
  //   if (schemaProp.responsive) {
  //     const defaultValue: ExternalReferenceEmpty = {
  //       id: null,
  //       widgetId: compilationContext.isEditing
  //         ? compilationContext.types[schemaProp.type]?.widgets[0]?.id
  //         : "",
  //     };

  //     const normalize = getResponsiveNormalize<ExternalReference>(
  //       compilationContext,
  //       defaultValue,
  //       defaultValue,
  //       externalNormalize(schemaProp.type)
  //     );

  //     return {
  //       normalize,
  //       compile: (x) => x,
  //       getHash: externalReferenceGetHash,
  //     };
  //   }

  //   return {
  //     normalize: (value) => {
  //       const normalized = externalNormalize(schemaProp.type)(
  //         value,
  //         compilationContext
  //       );

  //       if (!normalized) {
  //         return {
  //           id: null,
  //           widgetId: compilationContext.types[schemaProp.type]?.widgets[0]?.id,
  //         };
  //       }

  //       return normalized;
  //     },
  //     compile: (value) => {
  //       return value;
  //     },
  //     getHash: (value) => {
  //       if (value.id === null) {
  //         return `${schemaProp.type}.${value.widgetId}`;
  //       }

  //       return `${schemaProp.type}.${value.widgetId}.${value.id}`;
  //     },
  //   };
  // },
  position: (schemaProp, compilationContext) => {
    return {
      normalize: getResponsiveNormalize(compilationContext, schemaProp.defaultValue, "top-left", x => {
        return typeof x === "string" ? x : "top-left";
      }),
      compile: x => x,
      getHash: (value, currentBreakpoint) => {
        if (isTrulyResponsiveValue(value)) {
          const breakpointValue = responsiveValueAt(value, currentBreakpoint);
          return breakpointValue?.toString();
        }
        return value;
      }
    };
  },
  custom: (schemaProp, compilationContext) => {
    const customTypeDefinition = compilationContext.types[schemaProp.type];
    return {
      normalize: value => {
        if (customTypeDefinition.type === "inline") {
          const defaultValue = schemaProp.defaultValue ?? customTypeDefinition.defaultValue;
          const normalizeScalar = v => {
            if (isLocalValue(v)) {
              if (customTypeDefinition.validate) {
                const isValueValid = customTypeDefinition.validate(v.value);
                if (isValueValid) {
                  return v;
                }
                return {
                  value: defaultValue,
                  widgetId: v.widgetId
                };
              }
              return {
                value: v.value ?? defaultValue,
                widgetId: v.widgetId
              };
            }
            return {
              value: v ?? defaultValue,
              widgetId: customTypeDefinition.widget.id
            };
          };
          if (customTypeDefinition.responsiveness === "optional" && schemaProp.responsive || customTypeDefinition.responsiveness === "always") {
            const normalize = getResponsiveNormalize(compilationContext, defaultValue, defaultValue, normalizeScalar);
            return normalize(value);
          }
          if (customTypeDefinition.responsiveness === "never" && schemaProp.responsive) {
            console.warn(`Custom type "${schemaProp.type}" is marked as "never" responsive, but schema prop is marked as responsive. This is not supported and the value for this field is going to stay not responsive. Please change custom type definition or schema prop definition.`);
          }
          const result = normalizeScalar(value);
          if (result) {
            return result;
          }
          const defaultLocalValue = {
            value: defaultValue,
            widgetId: customTypeDefinition.widget.id
          };
          return defaultLocalValue;
        }
        if (customTypeDefinition.type === "token") {
          const themeValues = compilationContext.theme[customTypeDefinition.token];
          const defaultThemeValueEntry = Object.entries(themeValues).find(_ref => {
            let [, v] = _ref;
            return v.isDefault;
          });
          const defaultValue = (() => {
            if (schemaProp.defaultValue) {
              return schemaProp.defaultValue;
            } else if (defaultThemeValueEntry) {
              return {
                tokenId: defaultThemeValueEntry[0]
              };
            } else {
              return customTypeDefinition.defaultValue;
            }
          })();
          const defaultWidgetId = customTypeDefinition.widget?.id;
          const createTokenNormalizer = normalizeScalar => {
            return customTypeDefinition.responsiveness === "always" || customTypeDefinition.responsiveness === "optional" && schemaProp.responsive ? getResponsiveNormalize(compilationContext, schemaProp.defaultValue, customTypeDefinition.defaultValue, x => {
              return normalizeTokenValue(x, themeValues, defaultValue, defaultWidgetId, normalizeScalar ?? (x => x));
            }) : getNormalize(compilationContext, schemaProp.defaultValue, customTypeDefinition.defaultValue, x => {
              return normalizeTokenValue(x, themeValues, defaultValue, defaultWidgetId, normalizeScalar ?? (x => x));
            });
          };
          if (customTypeDefinition.token === "space") {
            const normalizeSpace = createTokenNormalizer(x => {
              if (typeof x === "number") {
                return `${x}px`;
              }
              const isValidSpacing = customTypeDefinition.validate?.(x) ?? true;
              if (!isValidSpacing) {
                return;
              }
              return x;
            });
            return normalizeSpace(value);
          }
          if (customTypeDefinition.token === "icons") {
            const scalarValueNormalize = x => {
              if (typeof x === "string" && x.trim().startsWith("<svg")) {
                return x;
              }
              return;
            };
            const iconDefaultValue = normalizeTokenValue(schemaProp.defaultValue, themeValues, customTypeDefinition.defaultValue, defaultWidgetId, scalarValueNormalize) ?? customTypeDefinition.defaultValue;
            return normalizeTokenValue(value, themeValues, iconDefaultValue, defaultWidgetId, scalarValueNormalize) ?? value;
          }
          const defaultTokenNormalizer = createTokenNormalizer();
          return defaultTokenNormalizer(value);
        }
        if (customTypeDefinition.type === "external") {
          if (schemaProp.responsive) {
            const defaultValue = {
              id: null,
              widgetId: compilationContext.isEditing ? customTypeDefinition.widgets[0]?.id : ""
            };
            const normalize = getResponsiveNormalize(compilationContext, defaultValue, defaultValue, externalNormalize(schemaProp.type));
            return normalize(value);
          }
          const normalized = externalNormalize(schemaProp.type)(value, compilationContext);
          if (!normalized) {
            return {
              id: null,
              widgetId: customTypeDefinition.widgets[0]?.id
            };
          }
          return normalized;
        }
        throw new Error("Unknown type definition");
      },
      compile: x => {
        const val = responsiveValueMap(x, y => {
          if ("value" in y) {
            return y.value;
          }
          return y;
        });
        const flattened = responsiveValueFlatten(val, compilationContext.devices);
        return responsiveValueFill(flattened, compilationContext.devices, getDevicesWidths(compilationContext.devices));
      },
      getHash: (value, breakpointIndex) => {
        function getTokenValue(value) {
          if (value.tokenId) {
            return value.tokenId;
          }
          if (typeof value.value === "object") {
            return JSON.stringify(value.value);
          }
          const scalarVal = value.value;
          if (scalarVal.toString) {
            return scalarVal.toString();
          }
          throw new Error("unreachable");
        }
        if (customTypeDefinition.type === "external") {
          return externalReferenceGetHash(value, breakpointIndex);
        }
        if (isTrulyResponsiveValue(value)) {
          const breakpointValue = responsiveValueAt(value, breakpointIndex);
          if (!breakpointValue) {
            return;
          }
          if ("tokenId" in breakpointValue) {
            return getTokenValue(breakpointValue);
          }
          return typeof breakpointValue.value === "object" ? JSON.stringify(breakpointValue.value) : breakpointValue.value;
        }
        if ("tokenId" in value) {
          return getTokenValue(value);
        }
        return typeof value.value === "object" ? JSON.stringify(value.value) : value.value;
      }
    };
  }
};
function getNormalize(compilationContext, defaultValue, fallbackDefaultValue) {
  let normalize = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : x => x;
  return val => {
    const normalizedVal = normalize(val, compilationContext);
    if (normalizedVal !== undefined) {
      return normalizedVal;
    }
    const normalizedDefaultVal = normalize(defaultValue, compilationContext);
    if (normalizedDefaultVal !== undefined) {
      return normalizedDefaultVal;
    }
    return normalize(fallbackDefaultValue, compilationContext);
  };
}
function getResponsiveNormalize(compilationContext, defaultValue, fallbackDefaultValue) {
  let normalize = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : x => x;
  if (isTrulyResponsiveValue(defaultValue)) {
    /**
     * Here we must decide how this behaves. It's not obvious. If default is responsive, we cannot easily use default breakpoints.
     * It's because auto might be different. Changing one breakpoint changes "context" for others.
     */
    throw new Error("default responsive values not yet supported");
  }
  return val => {
    const scalarNormalize = getNormalize(compilationContext, defaultValue, fallbackDefaultValue, normalize);

    // if value is not really responsive
    if (!isTrulyResponsiveValue(val)) {
      return {
        $res: true,
        [compilationContext.mainBreakpointIndex]: scalarNormalize(val)
      };
    }
    const responsiveVal = responsiveValueMap(val, x => {
      return normalize(x, compilationContext);
    });

    // main breakpoint always set
    if (responsiveVal[compilationContext.mainBreakpointIndex] === undefined) {
      responsiveVal[compilationContext.mainBreakpointIndex] = scalarNormalize(undefined);
    }
    return responsiveVal;
  };
}
function getSelectSchemaPropDefinition() {
  return (schemaProp, compilationContext) => {
    return {
      normalize: schemaProp.responsive ? getResponsiveNormalize(compilationContext, schemaProp.defaultValue, getFirstOptionValue(schemaProp), x => {
        return isSelectValueCorrect(x, schemaProp.params.options) ? x : undefined;
      }) : getNormalize(compilationContext, schemaProp.defaultValue, getFirstOptionValue(schemaProp), x => {
        return isSelectValueCorrect(x, schemaProp.params.options) ? x : undefined;
      }),
      compile: x => x,
      getHash: (value, currentBreakpoint) => {
        if (isTrulyResponsiveValue(value)) {
          const breakpointValue = responsiveValueAt(value, currentBreakpoint);
          return breakpointValue?.toString();
        }
        return value;
      }
    };
  };
}
function isSelectValueCorrect(value, options) {
  if (typeof value !== "string") {
    return false;
  }
  return options.map(getSelectValue).indexOf(value) > -1;
}
function getSelectValue(arg) {
  if (typeof arg === "string") {
    return arg;
  }
  return arg.value;
}
function getFirstOptionValue(schemaProp) {
  if (schemaProp.params.options.length === 0) {
    throw new Error("Select field can't have 0 options");
  }
  const firstOption = schemaProp.params.options[0];
  const firstOptionValue = typeof firstOption === "object" ? firstOption.value : firstOption;
  return firstOptionValue;
}
function normalizeTokenValue(x, themeValues, defaultValue, defaultWidgetId) {
  let scalarValueNormalize = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : x => undefined;
  const input = x ?? defaultValue;
  const widgetId = input.widgetId ?? defaultWidgetId;

  // if (typeof input !== "object" && "value" in defaultValue) {
  //   const normalizedVal = scalarValueNormalize(defaultValue.value);

  //   if (normalizedVal !== undefined) {
  //     return {
  //       value: normalizedVal,
  //       widgetId,
  //     };
  //   }

  //   return;
  // }

  const hasTokenId = "tokenId" in input && typeof input.tokenId === "string";
  if (hasTokenId) {
    const val = themeValues[input.tokenId];
    if (val !== undefined) {
      return {
        value: val.value,
        tokenId: input.tokenId,
        widgetId
      };
    }
  }
  if ("value" in input) {
    const normalizedVal = scalarValueNormalize(input.value);
    if (normalizedVal !== undefined) {
      return {
        tokenId: hasTokenId ? input.tokenId : undefined,
        value: normalizedVal,
        widgetId
      };
    }
  }
  return;
}
function externalNormalize(externalType) {
  return (x, compilationContext) => {
    if (typeof x === "object" && x !== null) {
      if ("id" in x && x.id !== null) {
        const normalized = {
          id: x.id,
          widgetId: x.widgetId,
          key: x.key
        };
        return normalized;
      }
      const normalized = {
        id: null,
        widgetId: typeof x.widgetId === "string" ? x.widgetId : compilationContext.types[externalType]?.widgets[0]?.id
      };
      return normalized;
    }
  };
}
function externalReferenceGetHash(value, breakpointIndex) {
  if (isTrulyResponsiveValue(value)) {
    const breakpointValue = responsiveValueAt(value, breakpointIndex);
    if (breakpointValue) {
      return externalReferenceGetHash(breakpointValue, breakpointIndex);
    }
    return;
  }
  if (value.id) {
    return `${value.id}.${value.widgetId}`;
  }
}
function normalizeComponent(configComponent, compilationContext) {
  const ret = {
    _id: configComponent._id ?? uniqueId(),
    _component: configComponent._component
  };

  // Normalize itemProps (before own props). If component definition is missing, we still normalize item props
  if (configComponent._itemProps) {
    ret._itemProps = {};
    for (const templateId in configComponent._itemProps) {
      ret._itemProps[templateId] = {};
      for (const fieldName in configComponent._itemProps[templateId]) {
        ret._itemProps[templateId][fieldName] = {};
        const values = configComponent._itemProps[templateId][fieldName];
        const ownerDefinition = findComponentDefinitionById(templateId, compilationContext);
        const ownerSchemaProp = ownerDefinition.schema.find(x => x.prop === fieldName);
        if (!ownerSchemaProp) {
          continue;
        }
        (ownerSchemaProp.itemFields || []).forEach(itemFieldSchemaProp => {
          ret._itemProps[templateId][fieldName][itemFieldSchemaProp.prop] = getSchemaDefinition(itemFieldSchemaProp, compilationContext).normalize(values[itemFieldSchemaProp.prop]);
        });
      }
    }
  }
  const componentDefinition = findComponentDefinitionById(configComponent._component, compilationContext);
  if (!componentDefinition) {
    console.warn(`[normalize] Unknown _component ${configComponent._component}`);
    return ret;
  }
  componentDefinition.schema.forEach(schemaProp => {
    ret[schemaProp.prop] = getSchemaDefinition(schemaProp, compilationContext).normalize(configComponent[schemaProp.prop]);
  });

  // RichText is a really specific component. It must have concrete shape to work properly.
  // When using prop of type `component` with `accepts: ["@easyblocks/rich-text"]` it's going to be initialized with empty
  // `elements` property which in result will cause RichText to not work properly. To fix this, we're going
  // to initialize `elements` with default template - the same that's being added when user adds RichText to Stack manually.
  if (ret._component === "@easyblocks/rich-text") {
    if (Object.keys(ret.elements).length === 0 || ret.elements[compilationContext.contextParams.locale]?.length === 0) {
      const richTextConfig = buildRichTextNoCodeEntry({
        locale: compilationContext.contextParams.locale,
        color: Object.entries(compilationContext.theme.colors ?? {}).find(_ref2 => {
          let [, value] = _ref2;
          return value.isDefault;
        })?.[0],
        font: Object.entries(compilationContext.theme.fonts ?? {}).find(_ref3 => {
          let [, value] = _ref3;
          return value.isDefault;
        })?.[0]
      });
      ret.elements = richTextConfig.elements;
    }
  }
  return ret;
}
function getSchemaDefinition(schemaProp, compilationContext) {
  const provider = compilationContext.types[schemaProp.type] && schemaProp.type !== "text" ? schemaPropDefinitions.custom : schemaPropDefinitions[schemaProp.type];
  return provider(schemaProp, compilationContext);
}
function resolveLocalisedValue(localisedValue, compilationContext) {
  const locale = compilationContext.contextParams.locale;
  if (localisedValue[locale] !== undefined) {
    return {
      value: localisedValue[locale],
      locale
    };
  }
  const fallbackLocale = getFallbackLocaleForLocale(locale, compilationContext.locales);
  if (!fallbackLocale) {
    return;
  }
  return {
    value: localisedValue[fallbackLocale],
    locale: fallbackLocale
  };
}

export { getSchemaDefinition, normalizeComponent, resolveLocalisedValue, schemaPropDefinitions };
