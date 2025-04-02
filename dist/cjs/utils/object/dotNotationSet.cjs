/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function dotNotationSet(obj, path, value) {
  if (path === "") {
    throw new Error("Path can't be empty in dotNotationSetter");
  }
  if (typeof obj !== "object" || obj === null) {
    throw new Error("dotNotationSet - you're trying to set value for non-object");
  }
  const splitPath = typeof path === "string" ? path.split(".").map(x => {
    if (typeof x === "string" && !isNaN(parseInt(x))) {
      return parseInt(x);
    }
    return x;
  }) : path;
  if (splitPath.length === 1) {
    obj[splitPath[0]] = value;
  } else {
    if (!obj[splitPath[0]]) {
      if (typeof splitPath[1] === "number") {
        obj[splitPath[0]] = [];
      } else {
        obj[splitPath[0]] = {};
      }
    }
    dotNotationSet(obj[splitPath[0]], splitPath.slice(1), value);
  }
}

exports.dotNotationSet = dotNotationSet;
