/* with love from shopstory */
/**
 * `Object.keys` is badly typed for its reasons and this function just fixes it.
 * https://stackoverflow.com/questions/55012174/why-doesnt-object-keys-return-a-keyof-type-in-typescript
 */
function keys(o) {
  return Object.keys(o);
}

export { keys };
