import { Devices, ResponsiveValue } from "../types";
export declare function responsiveValueSet<T>(responsiveValue: ResponsiveValue<T>, deviceId: string, value: T, devices: Devices): {
    [x: string]: true | T | undefined;
    $res: true;
};
//# sourceMappingURL=responsiveValueSet.d.ts.map