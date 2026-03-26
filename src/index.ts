export { box } from "./box";
export { buildDocument } from "./buildDocument";
export { buildEntry } from "./buildEntry";
export {
  isComponentConfig,
  isDocument,
  isEmptyExternalReference,
  isEmptyRenderableContent,
  isIdReferenceToDocumentExternalValue,
  isLocalValue,
  isNonEmptyRenderableContent,
  isRenderableContent,
  isResolvedCompoundExternalDataValue,
} from "./checkers";

export {
  compile,
  compileInternal,
  createCompilationContext,
  findExternals,
  getSchemaDefinition,
  mergeCompilationMeta,
  normalize,
  normalizeInput,
  validate,
} from "./compiler";
export type {
  CompilationCache,
  CompilationCacheItemValue,
  SchemaPropDefinitionProviders,
  TemplateQueryType,
  TGlobalSectionChange,
} from "./compiler";

export { buildRichTextNoCodeEntry } from "./compiler/builtins/$richText/builders";
export { resolveLocalisedValue } from "./compiler/definitions";
export { getDevicesWidths } from "./compiler/devices";
export { validateColor } from "./compiler/validate-color";
export { Easyblocks } from "./components/Easyblocks";
export type {
  ComponentOverrides,
  EasyblocksProps,
} from "./components/Easyblocks";
export { easyblocksGetCssText, easyblocksGetStyleTag } from "./components/ssr";
export type {
  AssetDTO,
  ConfigDTO,
  DocumentDTO,
  DocumentWithResolvedConfigDTO,
} from "./EasyblocksBackend";
export { isNoCodeComponentOfType } from "./isNoCodeComponentOfType";

export {
  getDefaultLocale,
  getFallbackForLocale,
  getFallbackLocaleForLocale,
} from "./locales";
export type { Locale } from "./locales";

export {
  getExternalReferenceLocationKey,
  getExternalValue,
  getResolvedExternalDataValue,
  isCompoundExternalDataValue,
  isLocalTextReference,
  resolveExternalValue,
} from "./resourcesUtils";
export {
  isTrulyResponsiveValue,
  responsiveValueAt,
  responsiveValueEntries,
  responsiveValueFill,
  responsiveValueFindDeviceWithDefinedValue,
  responsiveValueFindHigherDeviceWithDefinedValue,
  responsiveValueFindLowerDeviceWithDefinedValue,
  responsiveValueFlatten,
  responsiveValueForceGet,
  responsiveValueGet,
  responsiveValueGetDefinedValue,
  responsiveValueGetFirstHigherValue,
  responsiveValueGetFirstLowerValue,
  responsiveValueGetHighestDefinedDevice,
  responsiveValueMap,
  responsiveValueNormalize,
  responsiveValueReduce,
  responsiveValueSet,
  responsiveValueValues,
} from "./responsiveness";
export { parseSpacing, spacingToPx } from "./spacingToPx";
export type * from "./types";
export { getBrightnessColor } from "./utils/colors";
export {
  defaultFontFamily,
  defaultFontSize,
  defaultFontWeight,
  defaultLineHeight,
  fontFamilies,
  getFontFamilies,
  getFontSizes,
  getFontWeights,
  getLineHeights,
  loadGoogleFonts,
} from "./utils/fonts";
export { globalSectionGroups } from "./utils/globalSections";
