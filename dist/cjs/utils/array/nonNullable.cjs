/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Returns a new function that filters nullable elements to be used as callback of `.filter` method.
 * It's useful because it has already defined guard which otherwise would be repeated in many places
 * and also it automatically changes the return value of filter function by extracting `null` and `undefined` types.
 *
 * Usage:
 * ```
 * const onlyNonNullable = nullableElements.filter<TypeOfCollectionItem>(nonNullable())
 * ```
 */
function nonNullable() {
  return function (value) {
    return value != null;
  };
}

exports.nonNullable = nonNullable;
//# sourceMappingURL=nonNullable.cjs.map
