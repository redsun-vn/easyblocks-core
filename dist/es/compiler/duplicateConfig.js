/* with love from shopstory */
import { deepClone, uniqueId } from '@easyblocks/utils';
import { configTraverse } from './configTraverse.js';
import { traverseComponents } from './traverseComponents.js';

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
