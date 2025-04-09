/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var entries = require('../utils/object/entries.cjs');

function responsiveValueValues(value) {
  const values = [];
  entries.entries(value).forEach(_ref => {
    let [key, v] = _ref;
    if (key === "$res") return;
    values.push(v);
  });
  return values;
}

exports.responsiveValueValues = responsiveValueValues;
//# sourceMappingURL=responsiveValueValues.cjs.map
