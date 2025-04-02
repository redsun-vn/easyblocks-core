/* with love from shopstory */
function deepCompare() {
  for (let index = 0; index < arguments.length - 1; index++) {
    const currentObject = sortObject(index < 0 || arguments.length <= index ? undefined : arguments[index]);
    const nextObject = sortObject(index + 1 < 0 || arguments.length <= index + 1 ? undefined : arguments[index + 1]);
    const areObjectsHashesEqual = JSON.stringify(currentObject) === JSON.stringify(nextObject);
    if (!areObjectsHashesEqual) {
      return false;
    }
  }
  return true;
}
function sortObject(value) {
  if (typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return [...value].sort();
  }
  if (value === null) {
    return null;
  }
  const sortedObject = {};
  const objectKeys = Object.keys(value).sort();
  objectKeys.forEach(key => {
    sortedObject[key] = sortObject(value[key]);
  });
  return sortedObject;
}

export { deepCompare, sortObject };
