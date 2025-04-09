/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var findComponentDefinition = require('./findComponentDefinition.cjs');
var index = require('./schema/index.cjs');

/**
 * Traverses given `config` by invoking given `callback` for each schema prop defined within components from `context`
 */
function traverseComponents(config, context, callback) {
  traverseComponentsInternal(config, context, callback, "");
}
function traverseComponentsArray(array, context, callback, path) {
  array.forEach((config, index) => {
    traverseComponentsInternal(config, context, callback, `${path}.${index}`);
  });
}
function traverseComponentsInternal(componentConfig, context, callback, path) {
  const componentDefinition = findComponentDefinition.findComponentDefinition(componentConfig, context);
  if (!componentDefinition) {
    console.warn("[traverseComponents] Unknown component definition", componentConfig);
    return;
  }
  const pathPrefix = path === "" ? "" : path + ".";
  callback({
    componentConfig,
    path
  });
  componentDefinition.schema.forEach(schemaProp => {
    if (index.isSchemaPropComponent(schemaProp) || schemaProp.type === "component-collection") {
      traverseComponentsArray(componentConfig[schemaProp.prop], context, callback, `${pathPrefix}${schemaProp.prop}`);
    } else if (schemaProp.type === "component-collection-localised") {
      for (const locale in componentConfig[schemaProp.prop]) {
        traverseComponentsArray(componentConfig[schemaProp.prop][locale], context, callback, `${pathPrefix}${schemaProp.prop}.${locale}`);
      }
    }
  });
}

exports.traverseComponents = traverseComponents;
//# sourceMappingURL=traverseComponents.cjs.map
