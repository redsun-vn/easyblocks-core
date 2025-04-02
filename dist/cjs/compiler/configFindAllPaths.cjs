/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var traverseComponents = require('./traverseComponents.cjs');

function configFindAllPaths(config, editorContext, predicate) {
  const matchedConfigPaths = [];
  traverseComponents.traverseComponents(config, editorContext, _ref => {
    let {
      path,
      componentConfig
    } = _ref;
    if (predicate(componentConfig, editorContext)) {
      matchedConfigPaths.push(path);
    }
  });
  return matchedConfigPaths;
}

exports.configFindAllPaths = configFindAllPaths;
