/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var definitions = require('./definitions.cjs');

function compileFromSchema(value, schemaProp, compilationContext, cache, contextProps, meta, editingInfoComponent, configPrefix) {
  return definitions.getSchemaDefinition(schemaProp, compilationContext).compile(value, contextProps, meta, editingInfoComponent, configPrefix, cache);
}

exports.compileFromSchema = compileFromSchema;
