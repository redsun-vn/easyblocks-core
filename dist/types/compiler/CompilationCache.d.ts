import { CompiledComponentConfig } from "../types";
import { InternalEditingInfo } from "./types";
type CompilationCacheItemValue = {
    /**
     * Values compared during compilation to determine if component has changed
     */
    values: {
        values: {
            _id: string;
            _component: string;
        } & Record<string, any>;
        params: Record<string, any>;
    };
    valuesAfterAuto: {
        values: {
            _id: string;
            _component: string;
        } & Record<string, any>;
        params: Record<string, any>;
    };
    compiledValues: Record<string, any>;
    compiledConfig: CompiledComponentConfig;
    contextProps: {
        [componentName in string]: Record<string, any>;
    };
    editingContextProps?: InternalEditingInfo["components"];
};
declare class CompilationCache {
    private cache;
    constructor();
    constructor(initialEntries: Array<[string, CompilationCacheItemValue]>);
    get(key: string): CompilationCacheItemValue | undefined;
    set(key: string, entry: CompilationCacheItemValue): void;
    get count(): number;
    remove(path: string): void;
    clear(): void;
}
export { CompilationCache };
export type { CompilationCacheItemValue };
//# sourceMappingURL=CompilationCache.d.ts.map