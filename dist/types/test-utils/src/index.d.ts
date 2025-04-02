/**
 * Mocks given method of `console` object. If `implementation` is not given, it defaults to noop.
 */
declare function mockConsoleMethod<ConsoleMethodName extends Exclude<keyof Console, "Console">>(methodName: ConsoleMethodName, implementation?: (...args: Array<any>) => void, options?: {
    debug: boolean;
}): {
    mockedFn: Required<Console>[ConsoleMethodName] extends (...args: any[]) => any ? jest.SpyInstance<ReturnType<Required<Console>[ConsoleMethodName]>, jest.ArgsType<Required<Console>[ConsoleMethodName]>> : never;
    unmock: () => void;
};
type MockedFn<Implementation extends (...args: any) => any> = jest.Mock<ReturnType<Implementation>, Parameters<Implementation>>;
/**
 * Wrapper for `jest.fn` function, but with types which automatically infer parameters type and return type.
 * This is more handy for cases where the mocked function has its dedicated type.
 */
declare function mock<Implementation extends (...args: any) => any>(implementation: Implementation): MockedFn<Implementation>;
export { mock, mockConsoleMethod };
export type { MockedFn };
//# sourceMappingURL=index.d.ts.map