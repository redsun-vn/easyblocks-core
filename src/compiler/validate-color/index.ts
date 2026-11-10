/**
 * This is a copy of validate-color function from validate-color npm package. This package has problem with bundling, so I copied it here. It was modified 100 years ago anyway and had 32 stars, so nothing fancy really.
 */

// Good article on HTML Colors:
// https://dev.to/alvaromontoro/the-ultimate-guide-to-css-colors-2020-edition-1bh1#hsl

// Check if parameter is defined and a string
const isString = (color: string) => color && typeof color === "string";
// All existing HTML color names
const htmlColorNames = [
  "AliceBlue",
  "AntiqueWhite",
  "Aqua",
  "Aquamarine",
  "Azure",
  "Beige",
  "Bisque",
  "Black",
  "BlanchedAlmond",
  "Blue",
  "BlueViolet",
  "Brown",
  "BurlyWood",
  "CadetBlue",
  "Chartreuse",
  "Chocolate",
  "Coral",
  "CornflowerBlue",
  "Cornsilk",
  "Crimson",
  "Cyan",
  "DarkBlue",
  "DarkCyan",
  "DarkGoldenrod",
  "DarkGray",
  "DarkGreen",
  "DarkKhaki",
  "DarkMagenta",
  "DarkOliveGreen",
  "DarkOrange",
  "DarkOrchid",
  "DarkRed",
  "DarkSalmon",
  "DarkSeaGreen",
  "DarkSlateBlue",
  "DarkSlateGray",
  "DarkTurquoise",
  "DarkViolet",
  "DeepPink",
  "DeepSkyBlue",
  "DimGray",
  "DodgerBlue",
  "FireBrick",
  "FloralWhite",
  "ForestGreen",
  "Fuchsia",
  "Gainsboro",
  "GhostWhite",
  "Gold",
  "Goldenrod",
  "Gray",
  "Green",
  "GreenYellow",
  "HoneyDew",
  "HotPink",
  "IndianRed",
  "Indigo",
  "Ivory",
  "Khaki",
  "Lavender",
  "LavenderBlush",
  "LawnGreen",
  "LemonChiffon",
  "LightBlue",
  "LightCoral",
  "LightCyan",
  "LightGoldenrodYellow",
  "LightGray",
  "LightGreen",
  "LightPink",
  "LightSalmon",
  "LightSalmon",
  "LightSeaGreen",
  "LightSkyBlue",
  "LightSlateGray",
  "LightSteelBlue",
  "LightYellow",
  "Lime",
  "LimeGreen",
  "Linen",
  "Magenta",
  "Maroon",
  "MediumAquamarine",
  "MediumBlue",
  "MediumOrchid",
  "MediumPurple",
  "MediumSeaGreen",
  "MediumSlateBlue",
  "MediumSlateBlue",
  "MediumSpringGreen",
  "MediumTurquoise",
  "MediumVioletRed",
  "MidnightBlue",
  "MintCream",
  "MistyRose",
  "Moccasin",
  "NavajoWhite",
  "Navy",
  "OldLace",
  "Olive",
  "OliveDrab",
  "Orange",
  "OrangeRed",
  "Orchid",
  "PaleGoldenrod",
  "PaleGreen",
  "PaleTurquoise",
  "PaleVioletRed",
  "PapayaWhip",
  "PeachPuff",
  "Peru",
  "Pink",
  "Plum",
  "PowderBlue",
  "Purple",
  "RebeccaPurple",
  "Red",
  "RosyBrown",
  "RoyalBlue",
  "SaddleBrown",
  "Salmon",
  "SandyBrown",
  "SeaGreen",
  "SeaShell",
  "Sienna",
  "Silver",
  "SkyBlue",
  "SlateBlue",
  "SlateGray",
  "Snow",
  "SpringGreen",
  "SteelBlue",
  "Tan",
  "Teal",
  "Thistle",
  "Tomato",
  "Turquoise",
  "Violet",
  "Wheat",
  "White",
  "WhiteSmoke",
  "Yellow",
  "YellowGreen",
];
// These 3 values are valid, usable color names, which are special in their own way
const htmlColorNamesSpecial = ["currentColor", "inherit", "transparent"];

// Validate HTML color name (red, yellow, etc)
export const validateHTMLColorName = (color: string): boolean => {
  let status = false;
  if (isString(color)) {
    htmlColorNames.map((c) => {
      if (color.toLowerCase() === c.toLowerCase()) {
        status = true;
      }
      return null;
    });
  }
  return status;
};

// Validate HTML color special name (currentColor, inherit, etc)
export const validateHTMLColorSpecialName = (color: string): boolean => {
  let status = false;
  if (isString(color)) {
    htmlColorNamesSpecial.map((c) => {
      if (color.toLowerCase() === c.toLowerCase()) {
        status = true;
      }
      return null;
    });
  }
  return status;
};

// Validate HTML color 'hex'
export const validateHTMLColorHex = (color: string): boolean => {
  if (isString(color)) {
    const regex = /^#([\da-f]{3}){1,2}$|^#([\da-f]{4}){1,2}$/i;
    return !!color && regex.test(color);
  }
  return false;
};

// Validate HTML color 'rgb'
// -- legacy notation
// color: rgb(255, 255, 255);
// color: rgba(255, 255, 255, 1);
// -- new notation
// color: rgb(255 255 255);
// color: rgb(255 255 255 / 1);
// Note that 'rgba()' is now merged into 'rgb()'
export const validateHTMLColorRgb = (color: string): boolean => {
  if (isString(color)) {
    const regex =
      /(rgb)a?\((\s*\d+%?\s*?,?\s*){2}(\s*\d+%?\s*?,?\s*\)?)(\s*,?\s*\/?\s*(0?\.?\d+%?\s*)?|1|0)?\)$/i;
    return !!color && regex.test(color);
  }
  return false;
};

const optionalCommaOrRequiredSpace = `((\\s*,\\s*)|(\\s+))`;
const optionalDecimals = `(\\.\\d+)?`;
const anyPercentage = `((\\d*${optionalDecimals})%)`;
const hundredPercent = `(([0-9]|[1-9][0-9]|100)%)`;
const alphaPercentage = `(((${hundredPercent}))|(0?${optionalDecimals})|1))?`;
const endingWithAlphaPercentage = `\\s*?\\)?)(\\s*?(\\/?)\\s+${alphaPercentage}\\s*?\\)$`;

// Validate HTML color 'hsl'
// -- These units are valid for the first parameter
// 'deg': degrees | full circle = 360
// 'gra': gradians | full circle = 400
// 'radians': radians | full circle = 2π (approx. 6.28)
// 'turn': turns | full circle = 1
export const validateHTMLColorHsl = (color: string): boolean => {
  if (isString(color)) {
    // Validate each possible unit value separately, as their values differ
    const degRegex = `(-?([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-9][0-9]|3[0-5][0-9]|360)(deg)?)`;
    const graRegex = `(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-9][0-9]|3[0-9][0-9]|400)gra)`;
    const radRegex = `((([0-5])?\\.\\d+|6\\.([0-9]|1[0-9]|2[0-8])|[0-6])rad)`;
    const turnRegex = `((0?${optionalDecimals}|1)turn)`;
    const regexLogic = `(hsl)a?\\((\\s*?(${degRegex}|${graRegex}|${radRegex}|${turnRegex})${optionalCommaOrRequiredSpace})(\\s*?(0|${hundredPercent})${optionalCommaOrRequiredSpace})(\\s*?(0|${hundredPercent})\\s*?\\)?)(\\s*?(\\/?|,?)\\s*?(((${hundredPercent}))|(0?${optionalDecimals})|1))?\\)$`;
    const regex = new RegExp(regexLogic);
    return !!color && regex.test(color);
  }
  return false;
};

// Validate HTML color 'hwb'
// -- 'hwb' accepts 'deg' as unit in its 1st property, which stands for 'hue'
// 'deg': degrees | full circle = 360
export const validateHTMLColorHwb = (color: string): boolean => {
  if (isString(color)) {
    const degRegex = `(-?([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-9][0-9]|3[0-5][0-9]|360)(deg)?)`;
    const regexLogic = `(hwb\\(\\s*?${degRegex}\\s+)((0|${hundredPercent})\\s+)((0|${hundredPercent})${endingWithAlphaPercentage}`;
    const regex = new RegExp(regexLogic);
    return !!color && regex.test(color);
  }
  return false;
};

// Validate HTML color 'lab'
// -- 'lab' 2nd & 3rd parameters are any number between -160 & 160
export const validateHTMLColorLab = (color: string): boolean => {
  if (isString(color)) {
    const labParam = `(-?(([0-9]|[1-9][0-9]|1[0-5][0-9])${optionalDecimals}?|160))`;
    const regexLogic = `(lab\\(\\s*?${anyPercentage}\\s+${labParam}\\s+${labParam}${endingWithAlphaPercentage}`;
    const regex = new RegExp(regexLogic);
    return !!color && regex.test(color);
  }

  return false;
};

// Validate only HTML colors (`hex`, `rgb`, `rgba`, `hsl`, `hsla`, `hwb`, `lab`), without `name` og `special name`**
export const validateHTMLColor = (color: string): boolean => {
  if (
    (color && validateHTMLColorHex(color)) ||
    validateHTMLColorRgb(color) ||
    validateHTMLColorHsl(color) ||
    validateHTMLColorHwb(color) ||
    validateHTMLColorLab(color)
  ) {
    return true;
  }
  return false;
};

export function validateGradient(input: string): boolean {
  if (typeof input !== "string") return false;

  const value = input.trim();

  if (!isSafeInStyleRule(value)) return false;

  return validateSingleGradientLoosely(value) || validateGradientLayers(value);
}

/**
 * A colour is written straight into a style rule — on the page and in the
 * editor's own swatch. A bracket left open, or a `;`/brace/quote, makes the
 * browser read the rest of that stylesheet as part of this one value: the
 * half-typed `radial-gradient(…, rgb(1 2 3)` wiped out the editor panel's
 * styling. So every colour must close its brackets and carry none of those.
 */
function isSafeInStyleRule(value: string): boolean {
  return !/[;{}<>"'\\]/.test(value) && splitTopLevelCommas(value) !== null;
}

/**
 * The original check: starts with a gradient function, ends with `)`, has a
 * comma inside. Kept so every well-formed gradient a shop has already saved
 * still passes; `isSafeInStyleRule` adds the bracket and character guard.
 */
function validateSingleGradientLoosely(value: string): boolean {
  const gradientTypes = [
    "linear-gradient(",
    "radial-gradient(",
    "conic-gradient(",
  ];

  const type = gradientTypes.find((g) => value.startsWith(g));
  if (!type || !value.endsWith(")")) return false;

  const inside = value.slice(type.length, -1);
  const stops = inside.split(",");

  return stops.length >= 2;
}

const GRADIENT_FUNCTION =
  /^(repeating-)?(linear|radial|conic)-gradient\(/i;

/**
 * Splits a value on the commas that sit outside every bracket, which is where
 * CSS separates background layers. Returns null when the brackets do not pair
 * up, so a value the browser would also misread is refused rather than guessed.
 */
function splitTopLevelCommas(value: string): Array<string> | null {
  const parts: Array<string> = [];
  let depth = 0;
  let start = 0;

  for (let i = 0; i < value.length; i++) {
    const char = value[i];

    if (char === "(") {
      depth++;
    } else if (char === ")") {
      depth--;
      if (depth < 0) return null;
    } else if (char === "," && depth === 0) {
      parts.push(value.slice(start, i).trim());
      start = i + 1;
    }
  }

  if (depth !== 0) return null;
  parts.push(value.slice(start).trim());
  return parts;
}

/** One gradient layer: a gradient function whose own bracket closes the layer. */
function isSingleGradientLayer(layer: string): boolean {
  const match = layer.match(GRADIENT_FUNCTION);
  if (!match || !layer.endsWith(")")) return false;

  const inside = layer.slice(match[0].length, -1);
  const stops = splitTopLevelCommas(inside);

  // A bracket inside that closes early would make the trailing ")" belong to
  // something else, e.g. `linear-gradient(a, b) x(c)`.
  return stops !== null && stops.length >= 2 && stops.every(Boolean);
}

/**
 * Stacked background layers, the way designers write a mesh of glows:
 * `radial-gradient(…), radial-gradient(…), #280060`.
 *
 * Also covers a single `repeating-*-gradient`, which the original check never
 * knew about.
 *
 * Every layer must be a gradient, except the last, which may be a plain colour
 * — the same place CSS lets a `background` carry its colour.
 */
function validateGradientLayers(value: string): boolean {
  const layers = splitTopLevelCommas(value);
  if (!layers) return false;

  const last = layers[layers.length - 1];
  const rest = layers.slice(0, -1);

  return (
    rest.every(isSingleGradientLayer) &&
    (isSingleGradientLayer(last) || validatePlainColor(last))
  );
}

/** A single colour, without the gradient forms. */
function validatePlainColor(color: string): boolean {
  return (
    validateHTMLColorHex(color) ||
    validateHTMLColorName(color) ||
    validateHTMLColorSpecialName(color) ||
    validateHTMLColorRgb(color) ||
    validateHTMLColorHsl(color) ||
    validateHTMLColorHwb(color) ||
    validateHTMLColorLab(color)
  );
}

const validateColor = (color: string) => {
  // The single-colour regexes are not anchored at the start, so a half-typed
  // gradient ending in `rgb(1 2 3)` used to pass as an rgb colour.
  if (typeof color === "string" && !isSafeInStyleRule(color)) {
    return false;
  }

  if (
    (color && validateHTMLColorHex(color)) ||
    validateHTMLColorName(color) ||
    validateHTMLColorSpecialName(color) ||
    validateHTMLColorRgb(color) ||
    validateHTMLColorHsl(color) ||
    validateHTMLColorHwb(color) ||
    validateHTMLColorLab(color) ||
    validateGradient(color)
  ) {
    return true;
  }
  return false;
};

export { validateColor };
