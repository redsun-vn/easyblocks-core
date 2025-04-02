import { RichTextPartCompiledComponentConfig, RichTextPartComponentConfig } from "../$richTextPart/$richTextPart";
import { CompiledComponentConfigBase, NoCodeComponentDefinition } from "../../../../types";
import { EditableComponentToComponentConfig } from "../../../types";
import { RichTextLineCompiledComponentValues, RichTextLineParams, richTextLineElementStyles } from "./$richTextLineElement.styles";
declare const richTextLineElementEditableComponent: NoCodeComponentDefinition<RichTextLineCompiledComponentValues, RichTextLineParams>;
type RichTextLineElementComponentConfig = EditableComponentToComponentConfig<typeof richTextLineElementEditableComponent> & {
    elements: Array<RichTextPartComponentConfig>;
};
type RichTextLineElementCompiledComponentConfig = CompiledComponentConfigBase<RichTextLineElementComponentConfig["_component"]> & {
    styled: NonNullable<ReturnType<typeof richTextLineElementStyles>["styled"]>;
} & {
    components: {
        elements: Array<RichTextPartCompiledComponentConfig | RichTextLineElementCompiledComponentConfig>;
    };
};
export { richTextLineElementEditableComponent };
export type { RichTextLineElementCompiledComponentConfig, RichTextLineElementComponentConfig, };
//# sourceMappingURL=$richTextLineElement.d.ts.map