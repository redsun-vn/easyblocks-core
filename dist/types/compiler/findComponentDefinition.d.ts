import { NoCodeComponentEntry } from "../types";
import { InternalComponentDefinition, InternalComponentDefinitions } from "./types";
type AnyContextWithDefinitions = {
    definitions: InternalComponentDefinitions;
};
/**
 * Versions with context and custom components sweep
 */
export declare function findComponentDefinition(config: NoCodeComponentEntry | undefined | null, context: AnyContextWithDefinitions): InternalComponentDefinition | undefined;
export declare function findComponentDefinitionById(id: string, context: AnyContextWithDefinitions): InternalComponentDefinition | undefined;
export declare function findComponentDefinitionsByType(tag: string, context: AnyContextWithDefinitions): InternalComponentDefinition[];
export {};
//# sourceMappingURL=findComponentDefinition.d.ts.map