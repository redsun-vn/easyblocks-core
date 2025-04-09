/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var zod = require('zod');
var isCompiledComponentConfig = require('./isCompiledComponentConfig.cjs');

function isRenderableContent(input) {
  return typeof input === "object" && input !== null && "renderableContent" in input && (isCompiledComponentConfig.isCompiledComponentConfig(input.renderableContent) || input.renderableContent === null);
}
function isNonEmptyRenderableContent(input) {
  return typeof input === "object" && input !== null && "renderableContent" in input && isCompiledComponentConfig.isCompiledComponentConfig(input.renderableContent);
}
function isEmptyRenderableContent(input) {
  return typeof input === "object" && input !== null && "renderableContent" in input && input.renderableContent === null;
}
const documentSchema = zod.z.object({
  documentId: zod.z.string(),
  projectId: zod.z.string(),
  rootContainer: zod.z.string().optional(),
  preview: zod.z.object({}).optional(),
  config: zod.z.optional(zod.z.object({}))
});
function isDocument(value) {
  return documentSchema.safeParse(value).success;
}
function isComponentConfig(value) {
  return typeof value === "object" && typeof value?._component === "string" && typeof value?._id === "string";
}
const localValueSchema = zod.z.object({
  value: zod.z.any(),
  widgetId: zod.z.string()
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

exports.isComponentConfig = isComponentConfig;
exports.isDocument = isDocument;
exports.isEmptyExternalReference = isEmptyExternalReference;
exports.isEmptyRenderableContent = isEmptyRenderableContent;
exports.isIdReferenceToDocumentExternalValue = isIdReferenceToDocumentExternalValue;
exports.isLocalValue = isLocalValue;
exports.isNonEmptyRenderableContent = isNonEmptyRenderableContent;
exports.isRenderableContent = isRenderableContent;
exports.isResolvedCompoundExternalDataValue = isResolvedCompoundExternalDataValue;
//# sourceMappingURL=checkers.cjs.map
