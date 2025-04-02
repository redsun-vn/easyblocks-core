/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var cssUnitConverter = require('./css-unit-converter.cjs');

function convertNodes(left, right, precision) {
  switch (left.type) {
    case "LengthValue":
    case "AngleValue":
    case "TimeValue":
    case "FrequencyValue":
    case "ResolutionValue":
      return convertAbsoluteLength(left, right, precision);
    default:
      return {
        left,
        right
      };
  }
}
function convertAbsoluteLength(left, right, precision) {
  if (right.type === left.type) {
    right = {
      type: left.type,
      value: cssUnitConverter.convertUnits(right.value, right.unit, left.unit, precision),
      unit: left.unit
    };
  }
  return {
    left,
    right
  };
}

exports.convert = convertNodes;
