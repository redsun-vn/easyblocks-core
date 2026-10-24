import { isCompiledComponentConfig } from "./isCompiledComponentConfig";
import {
  RenderableContent,
  NonEmptyRenderableContent,
  EmptyRenderableContent,
  Document,
  NoCodeComponentEntry,
  LocalValue,
  ExternalData,
  ExternalDataCompoundResourceResolvedResult,
  ExternalReference,
  ExternalReferenceEmpty,
} from "./types";

function isRenderableContent(input: unknown): input is RenderableContent {
  return (
    typeof input === "object" &&
    input !== null &&
    "renderableContent" in input &&
    (isCompiledComponentConfig(
      (input as { renderableContent: unknown }).renderableContent
    ) ||
      (input as { renderableContent: unknown }).renderableContent === null)
  );
}

function isNonEmptyRenderableContent(
  input: unknown
): input is NonEmptyRenderableContent {
  return (
    typeof input === "object" &&
    input !== null &&
    "renderableContent" in input &&
    isCompiledComponentConfig(
      (input as { renderableContent: unknown }).renderableContent
    )
  );
}

function isEmptyRenderableContent(
  input: unknown
): input is EmptyRenderableContent {
  return (
    typeof input === "object" &&
    input !== null &&
    "renderableContent" in input &&
    (input as { renderableContent: unknown }).renderableContent === null
  );
}

/**
 * What `z.object(...)` accepts as an object: anything zod's type detection calls "object",
 * which leaves out null, arrays, dates, maps, sets and promises (thenables).
 *
 * These guards used to be zod schemas. They are written out by hand because this module is
 * shared by every entry of the package, the client one included, and importing zod here put
 * all of zod into every storefront page for two shape checks. `checkers.test.ts` holds them
 * to the schemas they replace.
 */
function isZodObjectLike(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  if (
    typeof (value as { then?: unknown }).then === "function" &&
    typeof (value as { catch?: unknown }).catch === "function"
  ) {
    return false;
  }

  return !(
    (typeof Map !== "undefined" && value instanceof Map) ||
    (typeof Set !== "undefined" && value instanceof Set) ||
    (typeof Date !== "undefined" && value instanceof Date)
  );
}

function isOptional<T>(
  value: unknown,
  check: (value: unknown) => value is T
): value is T | undefined {
  return value === undefined || check(value);
}

const isString = (value: unknown): value is string => typeof value === "string";

function isDocument(value: unknown): value is Document {
  return (
    isZodObjectLike(value) &&
    isString(value.documentId) &&
    isString(value.projectId) &&
    isOptional(value.rootContainer, isString) &&
    isOptional(value.preview, isZodObjectLike) &&
    isOptional(value.config, isZodObjectLike)
  );
}

function isComponentConfig(value: any): value is NoCodeComponentEntry {
  return (
    typeof value === "object" &&
    typeof value?._component === "string" &&
    typeof value?._id === "string"
  );
}

function isLocalValue(value: any): value is LocalValue {
  // `value: z.any()` accepted a missing `value` too, so only `widgetId` is checked.
  return isZodObjectLike(value) && isString(value.widgetId);
}

export function isResolvedCompoundExternalDataValue(
  value: ExternalData[string]
): value is ExternalDataCompoundResourceResolvedResult {
  return "type" in value && value.type === "object" && "value" in value;
}

export function isIdReferenceToDocumentExternalValue(
  id: NonNullable<ExternalReference["id"]>
) {
  return typeof id === "string" && id.startsWith("$.");
}

export function isEmptyExternalReference(
  externalDataConfigEntry: ExternalReference
): externalDataConfigEntry is ExternalReferenceEmpty {
  return externalDataConfigEntry.id === null;
}

export {
  isRenderableContent,
  isNonEmptyRenderableContent,
  isEmptyRenderableContent,
  isDocument,
  isComponentConfig,
  isLocalValue,
};
