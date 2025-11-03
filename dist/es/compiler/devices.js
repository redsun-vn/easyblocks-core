/* with love from shopstory */
function getDevicesWidths(devices) {
  const widths = {
    $res: true
  };
  devices.forEach(device => {
    widths[device.id] = device.w;
  });
  return widths;
}
const DEFAULT_DEVICES = [{
  id: "xs",
  w: 375,
  h: 667,
  breakpoint: 639,
  label: "Mobile"
}, {
  id: "sm",
  w: 667,
  h: 375,
  breakpoint: 767,
  label: "Mobile SM - h"
}, {
  id: "md",
  w: 768,
  h: 1024,
  breakpoint: 1023,
  label: "Tablet"
}, {
  id: "lg",
  w: 1024,
  h: 768,
  breakpoint: 1279,
  label: "Small Desktop - Tablet H"
}, {
  id: "xl",
  w: 1366,
  h: 768,
  breakpoint: 1535,
  label: "Medium Desktop",
  isMain: true
}, {
  id: "2xl",
  w: 1920,
  h: 920,
  label: "Large desktop",
  breakpoint: null
}];

export { DEFAULT_DEVICES, getDevicesWidths };
//# sourceMappingURL=devices.js.map
