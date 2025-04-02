import { ResponsiveValue } from "../types";
export type UnwrapResponsiveValue<T> = T extends ResponsiveValue<infer Value> ? Value : never;
//# sourceMappingURL=types.d.ts.map