/* with love from shopstory */
/**
 * `Object.entries` is badly typed for its reasons and this function just fixes it.
 * https://stackoverflow.com/questions/55012174/why-doesnt-object-keys-return-a-keyof-type-in-typescript
 */
function entries(o) {
  return Object.entries(o);
}

export { entries };
