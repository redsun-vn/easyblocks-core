/* with love from shopstory */
import { configTraverse } from './configTraverse.js';
import { traverseComponents } from './traverseComponents.js';
import { deepClone } from '../utils/deepClone.js';
import { uniqueId } from '../utils/uniqueId.js';

function duplicateConfig(inputConfig, compilationContext) {
  // deep copy first
  const config = deepClone(inputConfig);

  // refresh component ids
  traverseComponents(config, compilationContext, _ref => {
    let {
      componentConfig
    } = _ref;
    componentConfig._id = uniqueId();
  });

  // every text must get new local id
  configTraverse(config, compilationContext, _ref2 => {
    let {
      value,
      schemaProp
    } = _ref2;
    if (schemaProp.type === "text") {
      value.id = "local." + uniqueId();
    }
  });
  return config;
}

export { duplicateConfig };
