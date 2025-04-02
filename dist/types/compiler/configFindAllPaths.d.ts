import { NoCodeComponentEntry } from "../types";
import { CompilationContextType } from "./types";
declare function configFindAllPaths<T extends NoCodeComponentEntry>(config: NoCodeComponentEntry, editorContext: CompilationContextType, predicate: (config: NoCodeComponentEntry, editorContext: CompilationContextType) => config is T): Array<string>;
export { configFindAllPaths };
//# sourceMappingURL=configFindAllPaths.d.ts.map