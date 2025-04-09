/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function isCompiledComponentConfig(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
arg) {
  return typeof arg === "object" && arg !== null && typeof arg._component === "string" && typeof arg._id === "string" && typeof arg.actions === "object" && typeof arg.components === "object";
}

exports.isCompiledComponentConfig = isCompiledComponentConfig;
//# sourceMappingURL=isCompiledComponentConfig.cjs.map
