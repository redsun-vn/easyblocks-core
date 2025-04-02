import { Devices, NoCodeComponentStylesFunctionResult, ResponsiveValue, SchemaProp } from "../types";
import type { InternalComponentDefinition } from "./types";
type Config = {
    [key: string]: any;
};
export declare function scalarizeConfig(config: Config, breakpoint: string, devices: Devices, schema: SchemaProp[]): any;
type Resop2Result = Required<NoCodeComponentStylesFunctionResult>;
export declare function resop2(input: {
    values: Record<string, ResponsiveValue<any>>;
    params: Record<string, ResponsiveValue<any>>;
}, callback: (scalarInput: {
    values: Record<string, any>;
    params: Record<string, any>;
}, breakpointIndex: string) => NoCodeComponentStylesFunctionResult, devices: Devices, componentDefinition?: InternalComponentDefinition): Resop2Result;
export {};
//# sourceMappingURL=resop.d.ts.map