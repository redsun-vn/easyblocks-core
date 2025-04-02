import type { RichTextProps } from "../$richText.editor";
import type { RichTextBlockElementCompiledComponentConfig } from "../$richTextBlockElement/$richTextBlockElement";
import type { RichTextLineElementCompiledComponentConfig } from "../$richTextLineElement/$richTextLineElement";
import type { RichTextPartCompiledComponentConfig } from "../$richTextPart/$richTextPart";
declare function traverseCompiledRichTextComponentConfig(config: RichTextProps, callback: (compiledConfig: RichTextBlockElementCompiledComponentConfig | RichTextLineElementCompiledComponentConfig | RichTextPartCompiledComponentConfig) => void): void;
export { traverseCompiledRichTextComponentConfig };
//# sourceMappingURL=traverseCompiledRichTextComponentConfig.d.ts.map