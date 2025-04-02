/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utils = require('@easyblocks/utils');
var configTraverse = require('./configTraverse.cjs');
var traverseComponents = require('./traverseComponents.cjs');

function duplicateConfig(inputConfig, compilationContext) {
  // deep copy first
  const config = utils.deepClone(inputConfig);

  // refresh component ids
  traverseComponents.traverseComponents(config, compilationContext, _ref => {
    let {
      componentConfig
    } = _ref;
    componentConfig._id = utils.uniqueId();
  });

  // every text must get new local id
  configTraverse.configTraverse(config, compilationContext, _ref2 => {
    let {
      value,
      schemaProp
    } = _ref2;
    if (schemaProp.type === "text") {
      value.id = "local." + utils.uniqueId();
    }
  });
  return config;
}

exports.duplicateConfig = duplicateConfig;
