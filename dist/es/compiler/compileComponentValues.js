/* with love from shopstory */
import { compileFromSchema } from './compileFromSchema.js';
import { isSchemaPropComponentOrComponentCollection } from './schema/index.js';

/**
 * This compilation function doesn't take schema. It means that it assumes couple of things:
 * 1. That input is NoCodeComponentEntry or 1-item array of. NoCodeComponentEntry. Basically it's a single component.
 * 2. Return format
 */
function compileComponentValues(inputValues, componentDefinition, compilationContext, cache) {
  const values = {};
  componentDefinition.schema.forEach(schemaProp => {
    if (!isSchemaPropComponentOrComponentCollection(schemaProp)) {
      values[schemaProp.prop] = compileFromSchema(inputValues[schemaProp.prop], schemaProp, compilationContext, cache);
    }
  });
  return values;
}

export { compileComponentValues };
