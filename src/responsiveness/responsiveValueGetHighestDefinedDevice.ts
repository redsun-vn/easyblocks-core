import { DeviceRange, Devices, TrulyResponsiveValue } from "../types";

export function responsiveValueGetHighestDefinedDevice<T>(
  input: TrulyResponsiveValue<T>,
  devices: Devices
): DeviceRange {
  let highestDefinedDevice: DeviceRange | undefined;

  for (let i = devices.length - 1; i >= 0; i--) {
    const device = devices[i];

    if (input[device.id] !== undefined) {
      highestDefinedDevice = device;
      break;
    }
  }

  if (highestDefinedDevice === undefined) {
    // A responsive value with nothing defined at any width. It reaches here
    // from the output of a component's `auto` function and from params a
    // parent's `styles` passes down, both of which follow document data, so a
    // throw took the page out for one saved combination of values.
    //
    // The widest device is the honest answer to "which is the highest", and
    // the caller goes on to read `undefined` from it — the same as it would
    // have read for a property nobody set.
    console.warn(
      "easyblocks: a responsive value had nothing defined at any breakpoint; treating the widest as the highest",
    );

    return devices[devices.length - 1];
  }

  return highestDefinedDevice;
}
