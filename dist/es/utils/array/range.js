/* with love from shopstory */
function range(start, end) {
  const itemsCount = start === end ? 1 : end - start + 1;
  return Array.from({
    length: itemsCount
  }, (_, index) => {
    return start + index;
  });
}

export { range };
//# sourceMappingURL=range.js.map
