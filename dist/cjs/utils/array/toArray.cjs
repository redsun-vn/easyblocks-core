/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// eslint-disable-next-line @typescript-eslint/ban-types
function toArray(scalarOrCollection) {
  if (Array.isArray(scalarOrCollection)) {
    return scalarOrCollection;
  }
  return [scalarOrCollection];
}

exports.toArray = toArray;
