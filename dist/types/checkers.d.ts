import { RenderableContent, NonEmptyRenderableContent, EmptyRenderableContent, Document, NoCodeComponentEntry, LocalValue, ExternalData, ExternalDataCompoundResourceResolvedResult, ExternalReference, ExternalReferenceEmpty } from "./types";
declare function isRenderableContent(input: unknown): input is RenderableContent;
declare function isNonEmptyRenderableContent(input: unknown): input is NonEmptyRenderableContent;
declare function isEmptyRenderableContent(input: unknown): input is EmptyRenderableContent;
declare function isDocument(value: unknown): value is Document;
declare function isComponentConfig(value: any): value is NoCodeComponentEntry;
declare function isLocalValue(value: any): value is LocalValue;
export declare function isResolvedCompoundExternalDataValue(value: ExternalData[string]): value is ExternalDataCompoundResourceResolvedResult;
export declare function isIdReferenceToDocumentExternalValue(id: NonNullable<ExternalReference["id"]>): boolean;
export declare function isEmptyExternalReference(externalDataConfigEntry: ExternalReference): externalDataConfigEntry is ExternalReferenceEmpty;
export { isRenderableContent, isNonEmptyRenderableContent, isEmptyRenderableContent, isDocument, isComponentConfig, isLocalValue, };
//# sourceMappingURL=checkers.d.ts.map