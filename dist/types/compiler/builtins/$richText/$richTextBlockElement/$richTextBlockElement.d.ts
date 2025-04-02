import { RichTextLineElementCompiledComponentConfig, RichTextLineElementComponentConfig } from "../$richTextLineElement/$richTextLineElement";
import { CompiledComponentConfigBase, NoCodeComponentDefinition } from "../../../../types";
import { EditableComponentToComponentConfig } from "../../../types";
import { RichTextBlockElementParams, RichTextBlockElementValues, richTextBlockElementStyles } from "./$richTextBlockElement.styles";
type RichTextBlockElementType = "bulleted-list" | "numbered-list" | "paragraph";
declare const RICH_TEXT_BLOCK_ELEMENT_TYPES: Array<RichTextBlockElementType>;
declare const richTextBlockElementEditableComponent: NoCodeComponentDefinition<RichTextBlockElementValues, RichTextBlockElementParams>;
type RichTextBlockElementComponentConfig = EditableComponentToComponentConfig<typeof richTextBlockElementEditableComponent> & {
    type: RichTextBlockElementType;
    elements: Array<RichTextLineElementComponentConfig>;
};
type RichTextBlockElementCompiledComponentConfig = CompiledComponentConfigBase<RichTextBlockElementComponentConfig["_component"], {
    type: RichTextBlockElementType;
}> & {
    styled: NonNullable<ReturnType<typeof richTextBlockElementStyles>["styled"]>;
} & {
    components: {
        elements: Array<RichTextLineElementCompiledComponentConfig>;
    };
};
export { RICH_TEXT_BLOCK_ELEMENT_TYPES, richTextBlockElementEditableComponent };
export type { RichTextBlockElementCompiledComponentConfig, RichTextBlockElementComponentConfig, RichTextBlockElementType, };
//# sourceMappingURL=$richTextBlockElement.d.ts.map