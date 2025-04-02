import type { RichTextAccessibilityRole } from "../$richText";
import { Alignment } from "../$richText.types";
import type { RichTextPartCompiledComponentConfig } from "../$richTextPart/$richTextPart";
import { NoCodeComponentStylesFunctionInput, NoCodeComponentStylesFunctionResult } from "../../../../types";
import type { RichTextBlockElementType } from "./$richTextBlockElement";
export type RichTextBlockElementValues = {
    elements: Array<{
        elements: Array<RichTextPartCompiledComponentConfig>;
    }>;
    type: RichTextBlockElementType;
};
export type RichTextBlockElementParams = {
    accessibilityRole: RichTextAccessibilityRole;
    align: Alignment;
    mainColor: string;
    mainFont: Record<string, any>;
    mainFontSize: string | number;
};
export declare function richTextBlockElementStyles({ values: { elements, type }, params: { accessibilityRole, align, mainColor, mainFont, mainFontSize }, }: NoCodeComponentStylesFunctionInput<RichTextBlockElementValues, RichTextBlockElementParams>): NoCodeComponentStylesFunctionResult;
//# sourceMappingURL=$richTextBlockElement.styles.d.ts.map