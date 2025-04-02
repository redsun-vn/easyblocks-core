/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function range(start, end) {
  const itemsCount = start === end ? 1 : end - start + 1;
  return Array.from({
    length: itemsCount
  }, (_, index) => {
    return start + index;
  });
}

exports.range = range;
