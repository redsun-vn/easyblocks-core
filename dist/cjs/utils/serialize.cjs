/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function serialize(value) {
  if (value instanceof Error) {
    return JSON.parse(JSON.stringify(value, Object.getOwnPropertyNames(value)));
  }
  return JSON.parse(JSON.stringify(value));
}

exports.serialize = serialize;
