import { NoCodeComponentEntry, CompiledComponentConfig } from "../types";
import type { CompilationCache } from "./CompilationCache";
import { CompilationContextType, ContextProps, EditingInfoComponent, EditingInfoComponentCollection } from "./types";
type ComponentCompilationArtifacts = {
    compiledComponentConfig: CompiledComponentConfig;
    configAfterAuto: NoCodeComponentEntry;
};
export declare function compileComponent(editableElement: NoCodeComponentEntry, compilationContext: CompilationContextType, contextProps: ContextProps, // contextProps are already compiled! They're result of compilation function.
meta: any, cache: CompilationCache, parentComponentEditingInfo?: EditingInfoComponent | EditingInfoComponentCollection, configPrefix?: string): ComponentCompilationArtifacts;
export {};
//# sourceMappingURL=compileComponent.d.ts.map