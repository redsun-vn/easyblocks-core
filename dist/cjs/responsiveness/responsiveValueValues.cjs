/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utils = require('@easyblocks/utils');

function responsiveValueValues(value) {
  const values = [];
  utils.entries(value).forEach(_ref => {
    let [key, v] = _ref;
    if (key === "$res") return;
    values.push(v);
  });
  return values;
}

exports.responsiveValueValues = responsiveValueValues;
