/* with love from shopstory */
import { isTrulyResponsiveValue } from './isTrulyResponsiveValue.js';

function responsiveValueReduce(resVal, reducer, initialValue, devices) {
  if (!isTrulyResponsiveValue(resVal)) {
    return reducer(initialValue, resVal);
  }
  let result = initialValue;
  for (let i = 0; i < devices.length; i++) {
    const key = devices[i].id;
    if (resVal[key] === undefined) {
      continue;
    }
    result = reducer(result, resVal[key], key);
  }
  return result;
}

export { responsiveValueReduce };
//# sourceMappingURL=responsiveValueReduce.js.map
