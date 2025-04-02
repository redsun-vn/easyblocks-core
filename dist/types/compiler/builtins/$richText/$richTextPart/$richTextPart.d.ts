import { CompiledComponentConfig, CompiledComponentConfigBase, NoCodeComponentEntry, NoCodeComponentDefinition } from "../../../../types";
import { EditableComponentToComponentConfig } from "../../../types";
import { RichTextPartValues, richTextPartStyles } from "./$richTextPart.styles";
declare const richTextPartEditableComponent: NoCodeComponentDefinition<RichTextPartValues>;
type RichTextPartComponentConfig = EditableComponentToComponentConfig<typeof richTextPartEditableComponent> & {
    value: string;
    color: Record<string, any>;
    font: Record<string, any>;
    TextWrapper: [NoCodeComponentEntry] | [];
};
type RichTextPartCompiledComponentConfig = CompiledComponentConfigBase<RichTextPartComponentConfig["_component"], {
    value: string;
    color: Record<string, any>;
    font: Record<string, any>;
}> & {
    styled: NonNullable<ReturnType<typeof richTextPartStyles>["styled"]>;
    components: {
        Text: Record<string, any>;
        TextWrapper: Array<CompiledComponentConfig>;
    };
};
export { richTextPartEditableComponent };
export type { RichTextPartCompiledComponentConfig, RichTextPartComponentConfig, };
//# sourceMappingURL=$richTextPart.d.ts.map