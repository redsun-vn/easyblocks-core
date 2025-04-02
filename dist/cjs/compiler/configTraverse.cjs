/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var findComponentDefinition = require('./findComponentDefinition.cjs');
var index = require('./schema/index.cjs');

/**
 * Traverses given `config` by invoking given `callback` for each schema prop defined within components from `context`
 */
function configTraverse(config, context, callback) {
  configTraverseInternal(config, context, callback, "");
}
function configTraverseArray(array, context, callback, path) {
  array.forEach((config, index) => {
    configTraverseInternal(config, context, callback, `${path}.${index}`);
  });
}
function configTraverseInternal(config, context, callback, path) {
  const componentDefinition = findComponentDefinition.findComponentDefinition(config, context);
  if (!componentDefinition) {
    console.warn(`[configTraverse] Unknown component definition for: ${config._component}`);
    return;
  }
  const pathPrefix = path === "" ? "" : path + ".";
  componentDefinition.schema.forEach(schemaProp => {
    if (index.isSchemaPropComponent(schemaProp) || schemaProp.type === "component-collection") {
      callback({
        config,
        value: config[schemaProp.prop],
        path: `${pathPrefix}${schemaProp.prop}`,
        schemaProp
      });
      configTraverseArray(config[schemaProp.prop], context, callback, `${pathPrefix}${schemaProp.prop}`);
    } else if (schemaProp.type === "component-collection-localised") {
      callback({
        config,
        value: config[schemaProp.prop],
        path: `${pathPrefix}${schemaProp.prop}`,
        schemaProp
      });
      for (const locale in config[schemaProp.prop]) {
        configTraverseArray(config[schemaProp.prop][locale], context, callback, `${pathPrefix}${schemaProp.prop}.${locale}`);
      }
    } else {
      const currentPath = `${pathPrefix}${schemaProp.prop}`;
      callback({
        config,
        path: currentPath,
        value: config[schemaProp.prop],
        schemaProp
      });
    }
  });
}

exports.configTraverse = configTraverse;
