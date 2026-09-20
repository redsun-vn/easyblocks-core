import {
  getDeviceWidthPairs,
  getDeviceWidthPairsFromDevices,
} from "../compiler/getDeviceWidthPairs";
import type { DeviceRange, Devices, TrulyResponsiveValue } from "../types";

export function responsiveValueFindHigherDeviceWithDefinedValue<T>(
  value: TrulyResponsiveValue<T>,
  breakpoint: string,
  devices: Devices,
  widths?: TrulyResponsiveValue<number>
): DeviceRange | undefined {
  const componentWidths = widths
    ? getDeviceWidthPairs(widths, devices)
    : getDeviceWidthPairsFromDevices(devices);

  const componentWidthIndex = componentWidths.findIndex(
    (x) => x.deviceId === breakpoint
  );
  const componentWidth = devices[componentWidthIndex];

  if (!componentWidth) {
    // A breakpoint id that is not among the config's devices. Both of these
    // functions already answer undefined for "no device found", and that is
    // the honest answer here too: a saved document, or a param handed down
    // from a parent's styles, can name a device the config no longer has, and
    // throwing turned that into a blank page rather than one unset property.
    console.warn(
      `easyblocks: breakpoint "${breakpoint}" is not one of the configured devices`
    );

    return undefined;
  }

  //
  // if (device.breakpoint === null) {
  //   return;
  // }

  for (let i = componentWidthIndex + 1; i <= componentWidths.length - 1; i++) {
    const deviceId = componentWidths[i].deviceId;

    if (value[deviceId] !== undefined) {
      return devices.find((d) => d.id === deviceId)!;
    }
  }

  return undefined;
}

export function responsiveValueFindLowerDeviceWithDefinedValue<T>(
  value: TrulyResponsiveValue<T>,
  breakpoint: string,
  devices: Devices,
  widths?: TrulyResponsiveValue<number>
): DeviceRange | undefined {
  const componentWidths = widths
    ? getDeviceWidthPairs(widths, devices)
    : getDeviceWidthPairsFromDevices(devices);
  const componentWidthIndex = componentWidths.findIndex(
    (x) => x.deviceId === breakpoint
  );
  const componentWidth = devices[componentWidthIndex];

  if (!componentWidth) {
    // A breakpoint id that is not among the config's devices. Both of these
    // functions already answer undefined for "no device found", and that is
    // the honest answer here too: a saved document, or a param handed down
    // from a parent's styles, can name a device the config no longer has, and
    // throwing turned that into a blank page rather than one unset property.
    console.warn(
      `easyblocks: breakpoint "${breakpoint}" is not one of the configured devices`
    );

    return undefined;
  }

  for (let i = componentWidthIndex - 1; i >= 0; i--) {
    const deviceId = componentWidths[i].deviceId;

    if (value[deviceId] !== undefined) {
      return devices.find((d) => d.id === deviceId)!;
    }
  }
  return undefined;
}

export function responsiveValueFindDeviceWithDefinedValue<T>(
  value: TrulyResponsiveValue<T>,
  breakpoint: string,
  devices: Devices,
  widths?: TrulyResponsiveValue<number>
): DeviceRange | undefined {
  if (value[breakpoint] !== undefined) {
    return devices.find((x) => x.id === breakpoint);
  }

  const higherDevice = responsiveValueFindHigherDeviceWithDefinedValue(
    value,
    breakpoint,
    devices,
    widths
  );

  if (higherDevice !== undefined) {
    return higherDevice;
  }

  const lowerDevice = responsiveValueFindLowerDeviceWithDefinedValue(
    value,
    breakpoint,
    devices,
    widths
  );

  if (lowerDevice !== undefined) {
    return lowerDevice;
  }

  return undefined;
}
