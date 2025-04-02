/* with love from shopstory */
function areWidthsFullyDefined(widths, devices) {
  let areWidthsFullyDefined = true;
  devices.forEach(device => {
    if (widths[device.id] === -1) {
      areWidthsFullyDefined = false;
    }
  });
  return areWidthsFullyDefined;
}

export { areWidthsFullyDefined };
