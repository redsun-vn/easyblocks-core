/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var checkers = require('../checkers.cjs');
var validation = require('./validation.cjs');

function normalizeInput(input) {
  if (validation.isLegacyInput(input)) {
    return input;
  }
  if (checkers.isDocument(input) && input.entry) {
    return input.entry;
  }
  throw new Error("Internal error: Can't obtain config from remote document.");
}

exports.normalizeInput = normalizeInput;
//# sourceMappingURL=normalizeInput.cjs.map
