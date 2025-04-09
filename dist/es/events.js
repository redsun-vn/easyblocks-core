/* with love from shopstory */
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

export { componentPickerOpened, itemInserted };
//# sourceMappingURL=events.js.map
