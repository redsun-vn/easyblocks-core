/* with love from shopstory */
function bubbleDown(matcher, items) {
  const originalOrder = [];
  const bubbledDown = [];
  items.forEach(item => {
    if (matcher(item)) {
      bubbledDown.push(item);
    } else {
      originalOrder.push(item);
    }
  });
  return [...originalOrder, ...bubbledDown];
}

export { bubbleDown };
