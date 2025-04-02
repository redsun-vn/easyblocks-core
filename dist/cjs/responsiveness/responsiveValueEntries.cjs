/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utils = require('@easyblocks/utils');

function responsiveValueEntries(value) {
  const values = [];
  utils.entries(value).forEach(_ref => {
    let [key, v] = _ref;
    if (key === "$res") return;
    values.push([key, v]);
  });
  return values;
}

exports.responsiveValueEntries = responsiveValueEntries;
