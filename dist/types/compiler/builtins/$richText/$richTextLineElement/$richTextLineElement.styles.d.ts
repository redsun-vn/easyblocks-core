import { Alignment } from "../$richText.types";
import type { RichTextBlockElementType } from "../$richTextBlockElement/$richTextBlockElement";
import { NoCodeComponentStylesFunctionInput, NoCodeComponentStylesFunctionResult } from "../../../../types";
export type RichTextLineCompiledComponentValues = {
    align: Alignment;
};
export type RichTextLineParams = {
    blockType: RichTextBlockElementType;
};
export declare function richTextLineElementStyles({ values, params, }: NoCodeComponentStylesFunctionInput<RichTextLineCompiledComponentValues, RichTextLineParams>): NoCodeComponentStylesFunctionResult;
//# sourceMappingURL=$richTextLineElement.styles.d.ts.map