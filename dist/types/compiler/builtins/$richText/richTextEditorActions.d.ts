import { Editor } from "slate";
import { RichTextComponentConfig } from "./$richText";
import { RichTextPartComponentConfig } from "./$richTextPart/$richTextPart";
declare function updateSelection<T extends keyof Omit<RichTextPartComponentConfig, "_id" | "_component" | "value">>(editor: Editor, key: T, ...values: Array<RichTextPartComponentConfig[T]>): {
    elements: RichTextComponentConfig["elements"][string];
    focusedRichTextParts: Array<string>;
} | undefined;
export { updateSelection };
//# sourceMappingURL=richTextEditorActions.d.ts.map