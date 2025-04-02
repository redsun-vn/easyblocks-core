import { ResponsiveValue, TrulyResponsiveValue } from "../types";
import { UnwrapResponsiveValue } from "./types";
type InferReturnType<Type extends ResponsiveValue<unknown>, MappedType> = Type extends TrulyResponsiveValue<unknown> ? TrulyResponsiveValue<MappedType> : MappedType;
export declare function responsiveValueMap<Input extends ResponsiveValue<unknown>, Output>(resVal: Input, mapper: (val: UnwrapResponsiveValue<Input>, breakpointIndex?: string) => Output): InferReturnType<Input, Output>;
export {};
//# sourceMappingURL=responsiveValueMap.d.ts.map