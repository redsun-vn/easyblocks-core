/* with love from shopstory */
import { isTrulyResponsiveValue } from './isTrulyResponsiveValue.js';
import { responsiveValueEntries } from './responsiveValueEntries.js';

function responsiveValueMap(resVal, mapper) {
  if (!isTrulyResponsiveValue(resVal)) {
    return mapper(resVal);
  }
  const ret = {
    $res: true
  };
  responsiveValueEntries(resVal).forEach(_ref => {
    let [key, value] = _ref;
    ret[key] = mapper(value, key);
  });
  return ret;
}

export { responsiveValueMap };
//# sourceMappingURL=responsiveValueMap.js.map
