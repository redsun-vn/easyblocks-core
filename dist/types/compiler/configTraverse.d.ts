import { NoCodeComponentEntry, SchemaProp } from "../types";
import { CompilationContextType } from "./types";
type ConfigTraverseCallback = (arg: {
    path: string;
    value: any;
    schemaProp: SchemaProp;
    config: NoCodeComponentEntry;
}) => void;
/**
 * Traverses given `config` by invoking given `callback` for each schema prop defined within components from `context`
 */
declare function configTraverse(config: NoCodeComponentEntry, context: Pick<CompilationContextType, "definitions">, callback: ConfigTraverseCallback): void;
export { configTraverse };
//# sourceMappingURL=configTraverse.d.ts.map