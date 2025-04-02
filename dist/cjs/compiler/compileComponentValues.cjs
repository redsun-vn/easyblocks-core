/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var compileFromSchema = require('./compileFromSchema.cjs');
var index = require('./schema/index.cjs');

/**
 * This compilation function doesn't take schema. It means that it assumes couple of things:
 * 1. That input is NoCodeComponentEntry or 1-item array of. NoCodeComponentEntry. Basically it's a single component.
 * 2. Return format
 */
function compileComponentValues(inputValues, componentDefinition, compilationContext, cache) {
  const values = {};
  componentDefinition.schema.forEach(schemaProp => {
    if (!index.isSchemaPropComponentOrComponentCollection(schemaProp)) {
      values[schemaProp.prop] = compileFromSchema.compileFromSchema(inputValues[schemaProp.prop], schemaProp, compilationContext, cache);
    }
  });
  return values;
}

exports.compileComponentValues = compileComponentValues;
