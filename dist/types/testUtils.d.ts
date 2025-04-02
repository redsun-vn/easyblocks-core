import { Devices } from "./types";
export declare const testDevices: Devices;
declare function createFormMock(initialValues?: Record<PropertyKey, any>): {
    reset(): void;
    values: Record<PropertyKey, any>;
    change(path: string, value: any): void;
};
declare function createTestCompilationContext(): import("./_internals").CompilationContextType;
export { createFormMock, createTestCompilationContext };
//# sourceMappingURL=testUtils.d.ts.map