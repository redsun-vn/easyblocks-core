/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var serialize = require('./utils/serialize.cjs');

function selectionFramePositionChanged(target, container) {
  return {
    type: "@easyblocks-editor/selection-frame-position-changed",
    payload: {
      target,
      container
    }
  };
}
function richTextChangedEvent(payload) {
  return {
    type: "@easyblocks-editor/rich-text-changed",
    payload: serialize.serialize(payload)
  };
}
function componentPickerOpened(path) {
  return {
    type: "@easyblocks-editor/component-picker-opened",
    payload: {
      path
    }
  };
}
function componentPickerClosed(config) {
  return {
    type: "@easyblocks-editor/component-picker-closed",
    payload: {
      config
    }
  };
}
function itemInserted(payload) {
  return {
    type: "@easyblocks-editor/item-inserted",
    payload
  };
}
function itemMoved(payload) {
  return {
    type: "@easyblocks-editor/item-moved",
    payload
  };
}

exports.componentPickerClosed = componentPickerClosed;
exports.componentPickerOpened = componentPickerOpened;
exports.itemInserted = itemInserted;
exports.itemMoved = itemMoved;
exports.richTextChangedEvent = richTextChangedEvent;
exports.selectionFramePositionChanged = selectionFramePositionChanged;
