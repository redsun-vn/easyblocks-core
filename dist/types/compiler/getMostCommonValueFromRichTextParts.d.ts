import { CompilationCache } from "./CompilationCache";
import { RichTextComponentConfig } from "./builtins/$richText/$richText";
import { RichTextPartComponentConfig } from "./builtins/$richText/$richTextPart/$richTextPart";
import { CompilationContextType } from "./types";
/**
 * Returns the most common value for given `prop` parameter among all @easyblocks/rich-text-part components from `richTextComponentConfig`.
 */
declare function getMostCommonValueFromRichTextParts<RichTextPartProperty extends Extract<keyof RichTextPartComponentConfig, "color" | "font">>(richTextComponentConfig: RichTextComponentConfig, prop: RichTextPartProperty, compilationContext: CompilationContextType, cache: CompilationCache): {
    $res: boolean;
} | undefined;
export { getMostCommonValueFromRichTextParts };
//# sourceMappingURL=getMostCommonValueFromRichTextParts.d.ts.map