/* with love from shopstory */
import { isDocument, isComponentConfig } from '../checkers.js';

function validate(input) {
  const isValid = input === null || input === undefined || isDocument(input) || isLegacyInput(input);
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
  return isComponentConfig(input);
}

export { isLegacyInput, validate };
