/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function isNoCodeComponentOfType(definition, type) {
  if (!definition.type) {
    return false;
  }
  if (typeof definition.type === "string") {
    return type === definition.type;
  }
  return definition.type.includes(type);
}

exports.isNoCodeComponentOfType = isNoCodeComponentOfType;
