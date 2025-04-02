/* with love from shopstory */
function assertDefined(value, message) {
  if (value === undefined) {
    throw new Error(message ?? "Value is undefined");
  }
  return value;
}

export { assertDefined };
