/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var configTraverse = require('./configTraverse.cjs');
var traverseComponents = require('./traverseComponents.cjs');
var deepClone = require('../utils/deepClone.cjs');
var uniqueId = require('../utils/uniqueId.cjs');

function duplicateConfig(inputConfig, compilationContext) {
  // deep copy first
  const config = deepClone.deepClone(inputConfig);

  // refresh component ids
  traverseComponents.traverseComponents(config, compilationContext, _ref => {
    let {
      componentConfig
    } = _ref;
    componentConfig._id = uniqueId.uniqueId();
  });

  // every text must get new local id
  configTraverse.configTraverse(config, compilationContext, _ref2 => {
    let {
      value,
      schemaProp
    } = _ref2;
    if (schemaProp.type === "text") {
      value.id = "local." + uniqueId.uniqueId();
    }
  });
  return config;
}

exports.duplicateConfig = duplicateConfig;
