import type { DeviceRange, Devices, TrulyResponsiveValue } from "../types";
export declare function responsiveValueFindHigherDeviceWithDefinedValue<T>(value: TrulyResponsiveValue<T>, breakpoint: string, devices: Devices, widths?: TrulyResponsiveValue<number>): DeviceRange | undefined;
export declare function responsiveValueFindLowerDeviceWithDefinedValue<T>(value: TrulyResponsiveValue<T>, breakpoint: string, devices: Devices, widths?: TrulyResponsiveValue<number>): DeviceRange | undefined;
export declare function responsiveValueFindDeviceWithDefinedValue<T>(value: TrulyResponsiveValue<T>, breakpoint: string, devices: Devices, widths?: TrulyResponsiveValue<number>): DeviceRange | undefined;
//# sourceMappingURL=responsiveValueFindDeviceWithDefinedValue.d.ts.map