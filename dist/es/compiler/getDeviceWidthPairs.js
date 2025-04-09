/* with love from shopstory */
import { responsiveValueForceGet } from '../responsiveness/responsiveValueGet.js';

function getDeviceWidthPairs(widths, devices) {
  const componentWidths = [];
  for (const key in widths) {
    if (key === "$res") {
      continue;
    }
    componentWidths.push({
      width: responsiveValueForceGet(widths, key),
      deviceId: key
    });
  }
  componentWidths.sort((x, y) => {
    if (x.width === y.width) {
      const xDevicesIndex = devices.findIndex(d => d.id === x.deviceId);
      const yDevicesIndex = devices.findIndex(d => d.id === y.deviceId);
      return xDevicesIndex > yDevicesIndex ? 1 : -1;
    }
    return x.width === y.width ? 0 : x.width > y.width ? 1 : -1;
  });
  return componentWidths;
}
function getDeviceWidthPairsFromDevices(devices) {
  return devices.map(d => ({
    width: d.w,
    deviceId: d.id
  }));
}

export { getDeviceWidthPairs, getDeviceWidthPairsFromDevices };
//# sourceMappingURL=getDeviceWidthPairs.js.map
