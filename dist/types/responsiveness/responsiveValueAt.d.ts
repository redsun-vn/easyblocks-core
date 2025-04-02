import { TrulyResponsiveValue } from "../types";
/**
 * Because of how `TrulyResponsiveValue` is typed, if we try to access value at the current breakpoint it would return `true | T | undefined`.
 * The literal type `true` in this type shouldn't be included, because it makes no sense.
 * This comes from definition of `$res` property which is a special property that marks given object as responsive value instead of normal object.
 */
declare function responsiveValueAt<T>(responsiveValue: TrulyResponsiveValue<T>, breakpointIndex: string): T | undefined;
export { responsiveValueAt };
//# sourceMappingURL=responsiveValueAt.d.ts.map