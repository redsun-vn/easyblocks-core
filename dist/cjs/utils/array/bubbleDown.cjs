/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function bubbleDown(matcher, items) {
  const originalOrder = [];
  const bubbledDown = [];
  items.forEach(item => {
    if (matcher(item)) {
      bubbledDown.push(item);
    } else {
      originalOrder.push(item);
    }
  });
  return [...originalOrder, ...bubbledDown];
}

exports.bubbleDown = bubbleDown;
//# sourceMappingURL=bubbleDown.cjs.map
