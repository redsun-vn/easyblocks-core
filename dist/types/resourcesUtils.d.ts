import type { ExternalData, ExternalReference, ExternalReferenceNonEmpty, ExternalSchemaProp, FetchOutputCompoundResources, NonNullish, ResponsiveValue } from "./types";
export declare function getExternalValue(externalDataValue: ExternalData[string]): NonNullish | undefined;
export declare function isLocalTextReference(resource: {
    id: string | null;
}, type: string): boolean;
export declare function getExternalReferenceLocationKey(configId: string, fieldName: string, deviceId?: string): string;
export declare function getResolvedExternalDataValue(externalData: ExternalData, configId: string, fieldName: string, value: ExternalReferenceNonEmpty): {
    type: string & Record<never, never>;
    value: NonNullish;
} | undefined;
export declare function resolveExternalValue(responsiveResource: ResponsiveValue<ExternalReference>, configId: string, schemaProp: ExternalSchemaProp, externalData: ExternalData): ResponsiveValue<NonNullish | undefined> | undefined;
export declare function isCompoundExternalDataValue(value: ExternalData[string]): value is FetchOutputCompoundResources[string];
//# sourceMappingURL=resourcesUtils.d.ts.map