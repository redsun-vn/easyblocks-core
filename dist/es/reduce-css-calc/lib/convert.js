/* with love from shopstory */
import { convertUnits } from './css-unit-converter.js';

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
      value: convertUnits(right.value, right.unit, left.unit, precision),
      unit: left.unit
    };
  }
  return {
    left,
    right
  };
}

export { convertNodes as convert };
//# sourceMappingURL=convert.js.map
