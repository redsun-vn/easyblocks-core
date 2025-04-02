import { SetOptional } from "type-fest";
import { BooleanSchemaProp, CompiledComponentConfig, CompiledLocalTextReference, ComponentCollectionLocalisedSchemaProp, ComponentCollectionSchemaProp, ComponentSchemaProp, Devices, ExternalReference, ExternalSchemaProp, LocalSchemaProp, LocalTextReference, LocalValue, NoCodeComponentEntry, NumberSchemaProp, Position, PositionSchemaProp, RadioGroupSchemaProp, ResponsiveValue, SchemaProp, SelectSchemaProp, SerializedComponentDefinitions, StringSchemaProp, TextSchemaProp, TokenSchemaProp, TokenValue } from "../types";
import { CompilationCache } from "./CompilationCache";
import { Component$$$SchemaProp } from "./schema";
import { CompilationContextType, ContextProps, EditingInfoComponent, EditingInfoComponentCollection } from "./types";
type SchemaPropDefinition<Type, CompiledType = Type> = {
    compile: (value: Type, contextProps: ContextProps, serializedDefinitions: SerializedComponentDefinitions, editingInfoComponent: EditingInfoComponent | EditingInfoComponentCollection | undefined, configPrefix: string, cache: CompilationCache) => CompiledType;
    normalize: (value: any) => Type;
    getHash: (value: Type, breakpointIndex: string, devices: Devices) => string | undefined;
};
type TextSchemaPropDefinition = SchemaPropDefinition<LocalTextReference | ExternalReference<string>, CompiledLocalTextReference | ExternalReference<string>>;
type StringSchemaPropDefinition = SchemaPropDefinition<ResponsiveValue<string>, ResponsiveValue<string>>;
type NumberSchemaPropDefinition = SchemaPropDefinition<number, number>;
type BooleanSchemaPropDefinition = SchemaPropDefinition<ResponsiveValue<boolean>, ResponsiveValue<boolean>>;
type SelectSchemaPropDefinition = SchemaPropDefinition<ResponsiveValue<string>, ResponsiveValue<string>>;
type RadioGroupSchemaPropDefinition = SchemaPropDefinition<ResponsiveValue<string>, ResponsiveValue<string>>;
export type ConfigComponentCompilationOutput = {
    compiledComponentConfig: CompiledComponentConfig;
    configAfterAuto: NoCodeComponentEntry;
};
type ComponentSchemaPropDefinition = SchemaPropDefinition<Array<NoCodeComponentEntry>, Array<ConfigComponentCompilationOutput>>;
type ComponentCollectionSchemaPropDefinition = SchemaPropDefinition<Array<NoCodeComponentEntry>, Array<ConfigComponentCompilationOutput>>;
type ComponentCollectionLocalisedSchemaPropDefinition = SchemaPropDefinition<{
    [locale: string]: NoCodeComponentEntry[];
}, Array<ConfigComponentCompilationOutput>>;
type Component$$$SchemaPropDefinition = SchemaPropDefinition<NoCodeComponentEntry, NoCodeComponentEntry>;
export type SchemaPropDefinitionProviders = {
    text: (schemaProp: TextSchemaProp, compilationContext: CompilationContextType) => TextSchemaPropDefinition;
    string: (schemaProp: StringSchemaProp, compilationContext: CompilationContextType) => StringSchemaPropDefinition;
    number: (schemaProp: NumberSchemaProp, compilationContext: CompilationContextType) => NumberSchemaPropDefinition;
    boolean: (schemaProp: BooleanSchemaProp, compilationContext: CompilationContextType) => BooleanSchemaPropDefinition;
    select: (schemaProp: SelectSchemaProp, compilationContext: CompilationContextType) => SelectSchemaPropDefinition;
    "radio-group": (schemaProp: RadioGroupSchemaProp, compilationContext: CompilationContextType) => RadioGroupSchemaPropDefinition;
    component: (schemaProp: ComponentSchemaProp, compilationContext: CompilationContextType) => ComponentSchemaPropDefinition;
    "component-collection": (schemaProp: ComponentCollectionSchemaProp, compilationContext: CompilationContextType) => ComponentCollectionSchemaPropDefinition;
    "component-collection-localised": (schemaProp: ComponentCollectionLocalisedSchemaProp, compilationContext: CompilationContextType) => ComponentCollectionLocalisedSchemaPropDefinition;
    component$$$: (schemaProp: Component$$$SchemaProp, compilationContext: CompilationContextType) => Component$$$SchemaPropDefinition;
    position: (schemaProp: PositionSchemaProp, compilationContext: CompilationContextType) => SchemaPropDefinition<ResponsiveValue<Position>, ResponsiveValue<Position>>;
    custom: (schemaProp: ExternalSchemaProp | LocalSchemaProp | TokenSchemaProp, compilationContext: CompilationContextType) => SchemaPropDefinition<ResponsiveValue<ExternalReference | LocalValue | TokenValue>, ExternalReference | string>;
};
type SchemaPropDefinitionProvider = SchemaPropDefinitionProviders[keyof SchemaPropDefinitionProviders];
export declare const schemaPropDefinitions: SchemaPropDefinitionProviders;
export declare function normalizeComponent(configComponent: SetOptional<NoCodeComponentEntry, "_id">, compilationContext: CompilationContextType): NoCodeComponentEntry;
export declare function getSchemaDefinition<T extends SchemaProp | Component$$$SchemaProp>(schemaProp: T, compilationContext: CompilationContextType): ReturnType<SchemaPropDefinitionProvider>;
export declare function resolveLocalisedValue<T>(localisedValue: Record<string, T>, compilationContext: CompilationContextType): {
    value: T;
    locale: string;
} | undefined;
export {};
//# sourceMappingURL=definitions.d.ts.map