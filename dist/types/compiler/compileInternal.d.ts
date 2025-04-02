import { CompilationMetadata, CompiledShopstoryComponentConfig, NoCodeComponentEntry } from "../types";
import { CompilationCache } from "./CompilationCache";
import { CompilationContextType } from "./types";
type CompileInternalReturnType = {
    compiled: CompiledShopstoryComponentConfig;
    meta: CompilationMetadata;
    configAfterAuto?: NoCodeComponentEntry;
};
export declare function compileInternal(configComponent: NoCodeComponentEntry, compilationContext: CompilationContextType, cache?: CompilationCache): CompileInternalReturnType;
export {};
//# sourceMappingURL=compileInternal.d.ts.map