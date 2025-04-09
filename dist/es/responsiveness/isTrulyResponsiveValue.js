/* with love from shopstory */
// Sorry for this name
function isTrulyResponsiveValue(x) {
  return typeof x === "object" && x !== null && !Array.isArray(x) && x.$res === true;
}

export { isTrulyResponsiveValue };
//# sourceMappingURL=isTrulyResponsiveValue.js.map
