import type { NoCodeComponentEntry, NoCodeComponentStylesFunctionInput, NoCodeComponentStylesFunctionResult } from "../../../../types";
export interface RichTextPartValues {
    color: string;
    font: Record<string, any>;
    value: string;
    TextWrapper: [NoCodeComponentEntry] | [];
    fontStyle: "normal" | "italic" | "oblique";
}
export declare function richTextPartStyles({ values: { color, font, TextWrapper, fontStyle }, isEditing, }: NoCodeComponentStylesFunctionInput<RichTextPartValues>): NoCodeComponentStylesFunctionResult;
//# sourceMappingURL=$richTextPart.styles.d.ts.map