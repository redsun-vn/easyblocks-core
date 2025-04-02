/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var isTrulyResponsiveValue = require('./isTrulyResponsiveValue.cjs');
var responsiveValueEntries = require('./responsiveValueEntries.cjs');

function responsiveValueMap(resVal, mapper) {
  if (!isTrulyResponsiveValue.isTrulyResponsiveValue(resVal)) {
    return mapper(resVal);
  }
  const ret = {
    $res: true
  };
  responsiveValueEntries.responsiveValueEntries(resVal).forEach(_ref => {
    let [key, value] = _ref;
    ret[key] = mapper(value, key);
  });
  return ret;
}

exports.responsiveValueMap = responsiveValueMap;
