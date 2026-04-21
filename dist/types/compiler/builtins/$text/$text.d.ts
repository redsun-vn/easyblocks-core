import { Color, ExternalReference, Font, NoCodeComponentDefinition, ResponsiveValue, TokenValue } from "../../../types";
import { EditableComponentToComponentConfig } from "../../types";
declare const textEditableComponent: NoCodeComponentDefinition<{
    color: string;
    value: string;
    accessibilityRole: string;
    font: Record<string, any>;
    fontStyle: "normal" | "italic" | "oblique";
}, {
    passedAlign: string;
}>;
type TextComponentConfig = EditableComponentToComponentConfig<typeof textEditableComponent> & {
    color: ResponsiveValue<TokenValue<Color>>;
    font: ResponsiveValue<TokenValue<ResponsiveValue<Font>>>;
    value: ExternalReference;
    accessibilityRole: string;
    fontStyle: "normal" | "italic" | "oblique";
};
export { textEditableComponent };
export type { TextComponentConfig };
//# sourceMappingURL=$text.d.ts.map