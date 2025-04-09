/* with love from shopstory */
import { traverseComponents } from './traverseComponents.js';

function configFindAllPaths(config, editorContext, predicate) {
  const matchedConfigPaths = [];
  traverseComponents(config, editorContext, _ref => {
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

export { configFindAllPaths };
//# sourceMappingURL=configFindAllPaths.js.map
