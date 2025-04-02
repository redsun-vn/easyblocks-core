import { NoCodeComponentEntry } from "../types";
import { CompilationContextType } from "./types";
type TraverseComponentsCallback = (arg: {
    path: string;
    componentConfig: NoCodeComponentEntry;
}) => void;
/**
 * Traverses given `config` by invoking given `callback` for each schema prop defined within components from `context`
 */
declare function traverseComponents(config: NoCodeComponentEntry, context: CompilationContextType, callback: TraverseComponentsCallback): void;
export { traverseComponents };
//# sourceMappingURL=traverseComponents.d.ts.map