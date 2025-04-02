/**
 * This compilation function doesn't take schema. It means that it assumes couple of things:
 * 1. That input is NoCodeComponentEntry or 1-item array of. NoCodeComponentEntry. Basically it's a single component.
 * 2. Return format
 */
import { CompilationCache } from "./CompilationCache";
import { CompilationContextType, InternalComponentDefinition } from "./types";
export declare function compileComponentValues(inputValues: Record<string, any>, componentDefinition: InternalComponentDefinition, compilationContext: CompilationContextType, cache: CompilationCache): Record<string, any>;
//# sourceMappingURL=compileComponentValues.d.ts.map