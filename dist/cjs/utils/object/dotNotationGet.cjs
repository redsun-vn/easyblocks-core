/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function dotNotationGet(obj, path) {
  if (path === "") {
    return obj;
  }
  return path.split(".").reduce((acc, curVal) => acc && acc[curVal], obj);
}

exports.dotNotationGet = dotNotationGet;
