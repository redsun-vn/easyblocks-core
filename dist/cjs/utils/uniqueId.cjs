/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function uniqueId() {
  const id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0,
      v = c == "x" ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
  return id;
}

exports.uniqueId = uniqueId;
exports.uuidv4 = uniqueId;
