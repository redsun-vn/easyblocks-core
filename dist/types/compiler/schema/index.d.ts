import { ComponentCollectionLocalisedSchemaProp, ComponentCollectionSchemaProp, ComponentPickerType, ComponentSchemaProp, ExternalSchemaProp, Field, SchemaProp as CoreSchemaProp, SchemaPropShared, LocalSchemaProp } from "../../types";
import { EditorContextType, InternalComponentDefinition } from "../types";
type SchemaProp = CoreSchemaProp | Component$$$SchemaProp;
export type Component$$$SchemaProp = SchemaPropShared<"component$$$"> & {
    definition: InternalComponentDefinition;
    picker?: ComponentPickerType;
    required?: boolean;
};
export type InternalAnyField = InternalField & {
    [key: string]: any;
};
export type InternalAnyTinaField = InternalAnyField;
export type InternalField = Omit<Field, "schemaProp" | "parse" | "format"> & {
    parse?: (value: any, name: string, field: InternalAnyField) => any;
    format?: (value: any, name: string, field: InternalAnyField) => any;
    schemaProp: Field["schemaProp"] | Component$$$SchemaProp;
};
export declare function isSchemaPropComponentCollectionLocalised(schemaProp: SchemaProp): schemaProp is ComponentCollectionLocalisedSchemaProp;
export declare function isSchemaPropCollection(schemaProp: SchemaProp): schemaProp is ComponentCollectionLocalisedSchemaProp | ComponentCollectionSchemaProp;
export declare function isSchemaPropComponent(schemaProp: SchemaProp): schemaProp is ComponentSchemaProp;
export declare function isSchemaPropComponentOrComponentCollection(schemaProp: SchemaProp): schemaProp is ComponentCollectionLocalisedSchemaProp | ComponentCollectionSchemaProp | ComponentSchemaProp;
export declare function isSchemaPropActionTextModifier(schemaProp: SchemaProp): boolean;
export declare function isSchemaPropTextModifier(schemaProp: SchemaProp): boolean;
export declare function isCustomSchemaProp(schemaProp: SchemaProp): schemaProp is ExternalSchemaProp | LocalSchemaProp;
export declare function isExternalSchemaProp(schemaProp: SchemaProp, types: EditorContextType["types"]): schemaProp is ExternalSchemaProp;
type TextModifierSchemaPropOptions = Omit<ComponentSchemaProp, "type" | "accepts" | "hidden"> & Partial<Pick<ComponentSchemaProp, "accepts">>;
export declare function textModifierSchemaProp(options: TextModifierSchemaPropOptions): ComponentSchemaProp;
export {};
//# sourceMappingURL=index.d.ts.map