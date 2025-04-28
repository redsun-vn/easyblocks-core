import { Devices, TrulyResponsiveValue } from "../types";

export function getDevicesWidths(
  devices: Devices
): TrulyResponsiveValue<number> {
  const widths: TrulyResponsiveValue<number> = { $res: true };
  devices.forEach((device) => {
    widths[device.id] = device.w;
  });
  return widths;
}

export const DEFAULT_DEVICES: Devices = [
  {
    id: "xs",
    w: 375,
    h: 667,
    breakpoint: 640,
    label: "Mobile",
  },
  {
    id: "sm",
    w: 640,
    h: 375,
    breakpoint: 768,
    label: "Mobile SM - h",
  },
  {
    id: "md",
    w: 768,
    h: 1024,
    breakpoint: 1024,
    label: "Tablet",
  },
  {
    id: "lg",
    w: 1024,
    h: 768,
    breakpoint: 1280,
    label: "Small Desktop - Tablet H",
  },
  {
    id: "xl",
    w: 1280,
    h: 768,
    breakpoint: 1536,
    label: "Medium Desktop",
    isMain: true,
  },
  {
    id: "2xl",
    w: 1536,
    h: 920,
    label: "Large desktop",
    breakpoint: null,
  },
];