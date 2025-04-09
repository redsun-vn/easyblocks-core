/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function componentPickerOpened(path) {
  return {
    type: "@easyblocks-editor/component-picker-opened",
    payload: {
      path
    }
  };
}
function itemInserted(payload) {
  return {
    type: "@easyblocks-editor/item-inserted",
    payload
  };
}

exports.componentPickerOpened = componentPickerOpened;
exports.itemInserted = itemInserted;
//# sourceMappingURL=events.cjs.map
