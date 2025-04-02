import { Devices, TrulyResponsiveValue } from "../types";
type DeviceWidthPair = {
    width: number;
    deviceId: string;
};
type DeviceWidthPairs = DeviceWidthPair[];
export declare function getDeviceWidthPairs(widths: TrulyResponsiveValue<number>, devices: Devices): DeviceWidthPairs;
export declare function getDeviceWidthPairsFromDevices(devices: Devices): {
    width: number;
    deviceId: string;
}[];
export {};
//# sourceMappingURL=getDeviceWidthPairs.d.ts.map