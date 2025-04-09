/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var checkers = require('../checkers.cjs');

function validate(input) {
  const isValid = input === null || input === undefined || checkers.isDocument(input) || isLegacyInput(input);
  if (!isValid) {
    return {
      isValid: false
    };
  }
  return {
    isValid: true,
    input: input
  };
}
function isLegacyInput(input) {
  return checkers.isComponentConfig(input);
}

exports.isLegacyInput = isLegacyInput;
exports.validate = validate;
//# sourceMappingURL=validation.cjs.map
