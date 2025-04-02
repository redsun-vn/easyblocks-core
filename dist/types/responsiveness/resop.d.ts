import { Devices, ResponsiveValue } from "../types";
export declare function resop<Input extends Record<string, ResponsiveValue<unknown>>, ScalarResult extends Record<string, unknown>>(config: Input, callback: (scalarInput: Scalar<Input>, breakpointIndex: string) => ScalarResult, devices: Devices): Responsify<ScalarResult>;
type UnwrapResponsiveValue<T> = T extends ResponsiveValue<infer Value> ? Value : never;
type Scalar<Input extends Record<string, ResponsiveValue<unknown>>> = {
    [key in keyof Input]: UnwrapResponsiveValue<Input[key]>;
};
type Responsify<T extends Record<string, unknown>> = {
    [key in keyof T]: T[key] extends Record<string, unknown> ? Responsify<T[key]> : ResponsiveValue<T[key]>;
};
export {};
//# sourceMappingURL=resop.d.ts.map