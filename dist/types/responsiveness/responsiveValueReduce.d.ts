import { Devices, ResponsiveValue } from "../types";
export declare function responsiveValueReduce<T, AccT>(resVal: ResponsiveValue<T>, reducer: (previousValue: AccT, currentVal: T, deviceId?: string) => AccT, initialValue: AccT, devices: Devices): AccT;
//# sourceMappingURL=responsiveValueReduce.d.ts.map