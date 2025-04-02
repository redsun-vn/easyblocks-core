/* with love from shopstory */
import { getSchemaDefinition } from './definitions.js';

function compileFromSchema(value, schemaProp, compilationContext, cache, contextProps, meta, editingInfoComponent, configPrefix) {
  return getSchemaDefinition(schemaProp, compilationContext).compile(value, contextProps, meta, editingInfoComponent, configPrefix, cache);
}

export { compileFromSchema };
