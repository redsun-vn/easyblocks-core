/* with love from shopstory */
import { serialize } from '@easyblocks/utils';

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
    payload: serialize(payload)
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

export { componentPickerClosed, componentPickerOpened, itemInserted, itemMoved, richTextChangedEvent, selectionFramePositionChanged };
