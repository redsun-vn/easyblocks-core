import type { NoCodeComponentEntry, NoCodeComponentStylesFunctionInput, NoCodeComponentStylesFunctionResult } from "../../../../types";
export interface RichTextPartValues {
    color: string;
    font: Record<string, any>;
    value: string;
    TextWrapper: [NoCodeComponentEntry] | [];
}
export declare function richTextPartStyles({ values: { color, font, TextWrapper }, isEditing, }: NoCodeComponentStylesFunctionInput<RichTextPartValues>): NoCodeComponentStylesFunctionResult;
//# sourceMappingURL=$richTextPart.styles.d.ts.map