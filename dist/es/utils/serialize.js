/* with love from shopstory */
function serialize(value) {
  if (value instanceof Error) {
    return JSON.parse(JSON.stringify(value, Object.getOwnPropertyNames(value)));
  }
  return JSON.parse(JSON.stringify(value));
}

export { serialize };
