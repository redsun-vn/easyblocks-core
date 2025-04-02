/**
 * This function is necessary because if we have Stitches styles object, its breakpoint values should be only on the top level.
 * We can have them nested so we need to transform styles object so that responsive styles goes to the top level.
 */
export declare function flattenResponsiveStyles(styles: Record<string, any>): Record<string, any>;
//# sourceMappingURL=flattenResponsiveStyles.d.ts.map