import { Locale } from "../../../locales";
import { NoCodeComponentDefinition, ResponsiveValue, TokenValue } from "../../../types";
import { EditableComponentToComponentConfig } from "../../types";
import { RichTextBlockElementComponentConfig } from "./$richTextBlockElement/$richTextBlockElement";
type RichTextAccessibilityRole = "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
declare const richTextEditableComponent: NoCodeComponentDefinition;
type RichTextComponentConfig = EditableComponentToComponentConfig<typeof richTextEditableComponent> & {
    accessibilityRole: RichTextAccessibilityRole;
    isListStyleAuto: boolean;
    elements: Record<Locale["code"], Array<RichTextBlockElementComponentConfig>>;
    mainFont: ResponsiveValue<TokenValue<Record<string, any>>>;
    mainColor: ResponsiveValue<TokenValue<ResponsiveValue<string>>>;
};
export { richTextEditableComponent };
export type { RichTextAccessibilityRole, RichTextComponentConfig };
//# sourceMappingURL=$richText.d.ts.map