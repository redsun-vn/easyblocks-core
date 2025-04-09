/* with love from shopstory */
import { reduceCSSCalc } from './reduce-css-calc/index.js';

function parseSpacing(spacing) {
  if (spacing.endsWith("px")) {
    const value = parseFloat(spacing);
    if (isNaN(value)) {
      throw new Error(`incorrect spacing: ${spacing}`);
    }
    return {
      unit: "px",
      value
    };
  }
  if (spacing.endsWith("vw")) {
    const value = parseFloat(spacing);
    if (isNaN(value)) {
      throw new Error(`incorrect spacing: ${spacing}`);
    }
    return {
      unit: "vw",
      value
    };
  }
  throw new Error(`incorrect spacing: ${spacing}.`);
}
function spacingToPx(spacing, width) {
  const reducedSpacing = reduceCSSCalc(`calc(${spacing})` /* wrapping calc is necessary, otherwise max(10px,20px) doesn't work */, 5, {
    vw: width,
    percent: width
  });
  const parsed = parseSpacing(reducedSpacing);
  if (parsed.unit === "px") {
    return parsed.value;
  }
  throw new Error(`Error while running spacingToPx for spacing: ${spacing} and width: ${width}`);
}

export { parseSpacing, spacingToPx };
//# sourceMappingURL=spacingToPx.js.map
