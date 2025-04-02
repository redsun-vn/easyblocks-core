declare function assertDefined<T>(value: T, message?: string): Exclude<T, undefined>;
declare function assertNonNullable<T>(value: T): Exclude<T, null>;
export { assertDefined, assertNonNullable };
//# sourceMappingURL=assert.d.ts.map