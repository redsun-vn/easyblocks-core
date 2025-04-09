/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');
var findComponentDefinition = require('../../compiler/findComponentDefinition.cjs');
var index = require('../../compiler/schema/index.cjs');
var events = require('../../events.cjs');
var resourcesUtils = require('../../resourcesUtils.cjs');
var resop = require('../../responsiveness/resop.cjs');
var Box = require('../Box/Box.cjs');
var EasyblocksExternalDataProvider = require('../EasyblocksExternalDataProvider.cjs');
var EasyblocksMetadataProvider = require('../EasyblocksMetadataProvider.cjs');
var responsiveValueValues = require('../../responsiveness/responsiveValueValues.cjs');
var responsiveValueReduce = require('../../responsiveness/responsiveValueReduce.cjs');
var isTrulyResponsiveValue = require('../../responsiveness/isTrulyResponsiveValue.cjs');
var responsiveValueGetDefinedValue = require('../../responsiveness/responsiveValueGetDefinedValue.cjs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

function buildBoxes(compiled, name, actionWrappers, meta) {
  if (Array.isArray(compiled)) {
    return compiled.map((x, index) => buildBoxes(x, `${name}.${index}`, actionWrappers, meta));
  } else if (typeof compiled === "object" && compiled !== null) {
    if (compiled.__isBox) {
      const boxProps = {
        __compiled: compiled,
        __name: name,
        devices: meta.vars.devices,
        stitches: meta.stitches
      };
      return /*#__PURE__*/React__default["default"].createElement(Box.Box, boxProps);
    }
    const ret = {};
    for (const key in compiled) {
      ret[key] = buildBoxes(compiled[key], key, actionWrappers, meta);
    }
    return ret;
  }
  return compiled;
}
function getComponentDefinition(compiled, runtimeContext) {
  return findComponentDefinition.findComponentDefinitionById(compiled._component, runtimeContext);
}

/**
 * Checks whether:
 * 1. component is renderable (if all non-optional externals are defined)
 * 2. is data loading...
 * 3. gets fields that are not defined
 *
 * @param compiled
 * @param runtimeContext
 * @param rendererContext
 */

function getRenderabilityStatus(compiled, meta, externalData) {
  const status = {
    renderable: true,
    isLoading: false,
    fieldsRequiredToRender: new Set()
  };
  const componentDefinition = getComponentDefinition(compiled, {
    definitions: meta.vars.definitions
  });
  if (!componentDefinition) {
    return {
      renderable: false,
      isLoading: false,
      fieldsRequiredToRender: new Set()
    };
  }
  const requiredExternalFields = componentDefinition.schema.filter(schemaProp => {
    if (schemaProp.type === "text") {
      return false;
    }
    const propValue = compiled.props[schemaProp.prop];
    if (typeof propValue === "object" && propValue !== null && "id" in propValue && "widgetId" in propValue) {
      if ("optional" in schemaProp) {
        return !schemaProp.optional;
      }
      return true;
    }
    return false;
  });
  if (requiredExternalFields.length === 0) {
    return status;
  }
  for (const resourceSchemaProp of requiredExternalFields) {
    const externalReference = compiled.props[resourceSchemaProp.prop];
    const fieldStatus = getFieldStatus(externalReference, externalData, compiled._id, resourceSchemaProp.prop, meta.vars.devices);
    status.isLoading = status.isLoading || fieldStatus.isLoading;
    status.renderable = status.renderable && fieldStatus.renderable;
    if (!fieldStatus.renderable && !fieldStatus.isLoading) {
      status.fieldsRequiredToRender.add(resourceSchemaProp.label || resourceSchemaProp.prop);
    }
  }
  return status;
}
function getCompiledSubcomponents(id, compiledArray, contextProps, schemaProp, path, meta, isEditing, components) {
  const originalPath = path;
  if (schemaProp.type === "component-collection-localised") {
    path = path + "." + meta.vars.locale;
  }
  if (schemaProp.noInline) {
    const elements = compiledArray.map((compiledChild, index) => "_component" in compiledChild ? /*#__PURE__*/React__default["default"].createElement(ComponentBuilder, {
      path: `${path}.${index}`,
      compiled: compiledChild,
      components: components
    }) : compiledChild);
    if (index.isSchemaPropComponent(schemaProp)) {
      return elements[0];
    } else {
      return elements;
    }
  }
  const EditableComponentBuilder = isEditing ? components["EditableComponentBuilder.editor"] : components["EditableComponentBuilder.client"];
  let elements = compiledArray.map((compiledChild, index) => "_component" in compiledChild ? /*#__PURE__*/React__default["default"].createElement(EditableComponentBuilder, {
    compiled: compiledChild,
    index: index,
    length: compiledArray.length,
    path: `${path}.${index}`,
    components: components
  }) : compiledChild);
  const Placeholder = components["Placeholder"];

  // TODO: this code should be editor-only
  if (isEditing && Placeholder && elements.length === 0 && !contextProps.noInline &&
  // We don't want to show add button for this type
  schemaProp.type !== "component-collection-localised") {
    const type = getComponentMainType(schemaProp.accepts);
    elements = [/*#__PURE__*/React__default["default"].createElement(Placeholder, {
      id: id,
      path: path,
      type: type,
      appearance: schemaProp.placeholderAppearance,
      onClick: () => {
        function handleComponentPickerCloseMessage(event) {
          if (event.data.type === "@easyblocks-editor/component-picker-closed") {
            window.removeEventListener("message", handleComponentPickerCloseMessage);
            if (event.data.payload.config) {
              window.parent.postMessage(events.itemInserted({
                name: path,
                index: 0,
                block: event.data.payload.config
              }));
            }
          }
        }
        window.addEventListener("message", handleComponentPickerCloseMessage);
        window.parent.postMessage(events.componentPickerOpened(originalPath));
      },
      meta: meta
    })];
  }
  if (index.isSchemaPropComponent(schemaProp)) {
    return elements[0] ?? /*#__PURE__*/React__default["default"].createElement(React.Fragment, null);
  } else {
    return elements;
  }
}
function ComponentBuilder(props) {
  const {
    compiled,
    passedProps,
    path,
    components,
    ...restProps
  } = props;
  const allPassedProps = {
    ...passedProps,
    ...restProps
  };
  const meta = EasyblocksMetadataProvider.useEasyblocksMetadata();
  const externalData = EasyblocksExternalDataProvider.useEasyblocksExternalData();

  /**
   * Component is build in editing mode only if compiled.__editing is set.
   * This is the result of compilation.
   * The only case when compiled.__editing is set is when we're in Editor and for non-nested components.
   */
  const isEditing = compiled.__editing !== undefined;
  const pathSeparator = path === "" ? "" : ".";

  // Here we know we must render just component, without any wrappers
  const componentDefinition = getComponentDefinition(compiled, {
    definitions: meta.vars.definitions
  });
  const component = getComponent(componentDefinition, components, isEditing);
  const isMissingComponent = compiled._component === "@easyblocks/missing-component";
  const isMissingInstance = component === undefined;
  const isMissing = isMissingComponent || isMissingInstance;
  const MissingComponent = components["@easyblocks/missing-component"];
  if (isMissing) {
    if (!isEditing) {
      return null;
    }
    if (isMissingComponent) {
      return /*#__PURE__*/React__default["default"].createElement(MissingComponent, {
        error: true
      }, "Missing");
    } else {
      console.warn(`Missing "${compiled._component}"`);
      return /*#__PURE__*/React__default["default"].createElement(MissingComponent, {
        component: componentDefinition,
        error: true
      }, "Missing");
    }
  }
  const Component = component;
  const renderabilityStatus = getRenderabilityStatus(compiled, meta, externalData);
  if (!renderabilityStatus.renderable) {
    const fieldsRequiredToRender = Array.from(renderabilityStatus.fieldsRequiredToRender);
    return /*#__PURE__*/React__default["default"].createElement(MissingComponent, {
      component: componentDefinition
    }, `Fill following fields to render the component: ${fieldsRequiredToRender.join(", ")}`, renderabilityStatus.isLoading && /*#__PURE__*/React__default["default"].createElement(React.Fragment, null, /*#__PURE__*/React__default["default"].createElement("br", null), /*#__PURE__*/React__default["default"].createElement("br", null), "Loading data..."));
  }
  const shopstoryCompiledConfig = compiled;

  // Shopstory component
  const styled = buildBoxes(shopstoryCompiledConfig.styled, "", {}, meta);

  // Styled
  componentDefinition.schema.forEach(schemaProp => {
    if (index.isSchemaPropComponentOrComponentCollection(schemaProp)) {
      const contextProps = shopstoryCompiledConfig.__editing?.components?.[schemaProp.prop] || {};
      const compiledChildren = shopstoryCompiledConfig.components[schemaProp.prop];
      styled[schemaProp.prop] = getCompiledSubcomponents(compiled._id, compiledChildren, contextProps, schemaProp, `${path}${pathSeparator}${schemaProp.prop}`, meta, isEditing, components);
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    ref,
    __isSelected,
    ...restPassedProps
  } = allPassedProps || {};
  const runtime = {
    stitches: meta.stitches,
    resop: resop.resop,
    devices: meta.vars.devices
  };
  const easyblocksProp = {
    id: shopstoryCompiledConfig._id,
    isEditing,
    path,
    runtime,
    isSelected: __isSelected
  };
  const componentProps = {
    ...restPassedProps,
    ...mapExternalProps(shopstoryCompiledConfig.props, shopstoryCompiledConfig._id, componentDefinition, externalData),
    ...styled,
    __easyblocks: easyblocksProp
  };
  return /*#__PURE__*/React__default["default"].createElement(Component, componentProps);
}
function getComponent(componentDefinition, components, isEditing) {
  let component;

  // We first try to find editor version of that component
  if (isEditing) {
    component = components[componentDefinition.id + ".editor"];
  }

  // If it still missing, we try to find client version of that component
  if (!component) {
    component = components[componentDefinition.id + ".client"];
  }
  if (!component) {
    // In most cases we're going to pick component by its id
    component = components[componentDefinition.id];
  }
  return component;
}
function mapExternalProps(props, configId, componentDefinition, externalData) {
  const resultsProps = {};
  for (const propName in props) {
    const schemaProp = componentDefinition.schema.find(currentSchema => currentSchema.prop === propName);
    if (schemaProp) {
      const propValue = props[propName];
      if (schemaProp.type === "text" && resourcesUtils.isLocalTextReference(propValue, "text")) {
        resultsProps[propName] = propValue.value;
      } else if (
      // FIXME: this is a mess
      !isTrulyResponsiveValue.isTrulyResponsiveValue(propValue) && typeof propValue === "object" && "id" in propValue && "widgetId" in propValue && !("value" in propValue) || isTrulyResponsiveValue.isTrulyResponsiveValue(propValue) && responsiveValueValues.responsiveValueValues(propValue).every(v => typeof v === "object" && v && "id" in v && "widgetId" in v && !("value" in v))) {
        resultsProps[propName] = resourcesUtils.resolveExternalValue(propValue, configId, schemaProp, externalData);
      } else {
        resultsProps[propName] = props[propName];
      }
    } else {
      resultsProps[propName] = props[propName];
    }
  }
  return resultsProps;
}
function getFieldStatus(externalReference, externalData, configId, fieldName, devices) {
  return responsiveValueReduce.responsiveValueReduce(externalReference, (currentStatus, value, deviceId) => {
    if (!deviceId) {
      if (!value.id) {
        return {
          isLoading: false,
          renderable: false
        };
      }
      const externalValue = resourcesUtils.getResolvedExternalDataValue(externalData, configId, fieldName, value);
      return {
        isLoading: currentStatus.isLoading || externalValue === undefined,
        renderable: currentStatus.renderable && externalValue !== undefined && (externalValue.type === "object" ? value.key !== undefined : true)
      };
    }
    if (currentStatus.isLoading || !currentStatus.renderable) {
      return currentStatus;
    }
    const externalReferenceValue = responsiveValueGetDefinedValue.responsiveValueGetDefinedValue(value, deviceId, devices);
    if (!externalReferenceValue || externalReferenceValue.id === null) {
      return {
        isLoading: false,
        renderable: false
      };
    }
    const externalValue = resourcesUtils.getResolvedExternalDataValue(externalData, configId, fieldName, externalReferenceValue);
    return {
      isLoading: currentStatus.isLoading || externalValue === undefined,
      renderable: currentStatus.renderable && externalValue !== undefined && (externalValue.type === "object" ? externalReferenceValue.key !== undefined : true)
    };
  }, {
    renderable: true,
    isLoading: false
  }, devices);
}
function getComponentMainType(componentTypes) {
  let type;
  if (componentTypes.includes("action") || componentTypes.includes("actionLink")) {
    type = "action";
  } else if (componentTypes.includes("card")) {
    type = "card";
  } else if (componentTypes.includes("symbol")) {
    type = "icon";
  } else if (componentTypes.includes("button")) {
    type = "button";
  } else if (componentTypes.includes("section") || componentTypes.includes("token")) {
    type = "section";
  } else if (componentTypes.includes("item")) {
    type = "item";
  } else if (componentTypes.includes("image") || componentTypes.includes("$image")) {
    type = "image";
  } else if (componentTypes.includes("actionTextModifier")) {
    type = "actionTextModifier";
  } else {
    type = "item";
  }
  return type;
}

exports.ComponentBuilder = ComponentBuilder;
//# sourceMappingURL=ComponentBuilder.cjs.map
