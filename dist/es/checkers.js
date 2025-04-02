/* with love from shopstory */
import { z } from 'zod';
import { isCompiledComponentConfig } from './isCompiledComponentConfig.js';

function isRenderableContent(input) {
  return typeof input === "object" && input !== null && "renderableContent" in input && (isCompiledComponentConfig(input.renderableContent) || input.renderableContent === null);
}
function isNonEmptyRenderableContent(input) {
  return typeof input === "object" && input !== null && "renderableContent" in input && isCompiledComponentConfig(input.renderableContent);
}
function isEmptyRenderableContent(input) {
  return typeof input === "object" && input !== null && "renderableContent" in input && input.renderableContent === null;
}
const documentSchema = z.object({
  documentId: z.string(),
  projectId: z.string(),
  rootContainer: z.string().optional(),
  preview: z.object({}).optional(),
  config: z.optional(z.object({}))
});
function isDocument(value) {
  return documentSchema.safeParse(value).success;
}
function isComponentConfig(value) {
  return typeof value === "object" && typeof value?._component === "string" && typeof value?._id === "string";
}
const localValueSchema = z.object({
  value: z.any(),
  widgetId: z.string()
});
function isLocalValue(value) {
  return localValueSchema.safeParse(value).success;
}
function isResolvedCompoundExternalDataValue(value) {
  return "type" in value && value.type === "object" && "value" in value;
}
function isIdReferenceToDocumentExternalValue(id) {
  return typeof id === "string" && id.startsWith("$.");
}
function isEmptyExternalReference(externalDataConfigEntry) {
  return externalDataConfigEntry.id === null;
}

export { isComponentConfig, isDocument, isEmptyExternalReference, isEmptyRenderableContent, isIdReferenceToDocumentExternalValue, isLocalValue, isNonEmptyRenderableContent, isRenderableContent, isResolvedCompoundExternalDataValue };
