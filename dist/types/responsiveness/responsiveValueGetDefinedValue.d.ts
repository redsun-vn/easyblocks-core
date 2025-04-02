import { Devices, ResponsiveValue, TrulyResponsiveValue } from "../types";
export declare function responsiveValueGetFirstHigherValue<T>(value: TrulyResponsiveValue<T>, breakpoint: string, devices: Devices, widths: TrulyResponsiveValue<number>): T | undefined;
export declare function responsiveValueGetFirstLowerValue<T>(value: TrulyResponsiveValue<T>, breakpoint: string, devices: Devices, widths: TrulyResponsiveValue<number>): T | undefined;
export declare function responsiveValueGetDefinedValue<T>(value: ResponsiveValue<T>, breakpoint: string, devices: Devices, widths?: TrulyResponsiveValue<number>): T | undefined;
//# sourceMappingURL=responsiveValueGetDefinedValue.d.ts.map