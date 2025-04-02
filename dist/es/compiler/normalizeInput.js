/* with love from shopstory */
import { isDocument } from '../checkers.js';
import { isLegacyInput } from './validation.js';

function normalizeInput(input) {
  if (isLegacyInput(input)) {
    return input;
  }
  if (isDocument(input) && input.entry) {
    return input.entry;
  }
  throw new Error("Internal error: Can't obtain config from remote document.");
}

export { normalizeInput };
