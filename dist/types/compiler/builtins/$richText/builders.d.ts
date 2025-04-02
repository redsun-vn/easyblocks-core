import { SetOptional } from "type-fest";
import type { TokenValue } from "../../../types";
import type { RichTextComponentConfig } from "./$richText";
import type { RichTextBlockElementComponentConfig, RichTextBlockElementType } from "./$richTextBlockElement/$richTextBlockElement";
import type { RichTextLineElementComponentConfig } from "./$richTextLineElement/$richTextLineElement";
import type { RichTextPartComponentConfig } from "./$richTextPart/$richTextPart";
interface Identity {
    id: string;
}
declare function buildRichTextNoCodeEntry(options?: {
    text?: string;
    font?: string;
    color?: string;
    accessibilityRole?: string;
    locale?: string;
}): {
    _id: string;
    _component: string;
    accessibilityRole: string;
    elements: {
        [x: string]: RichTextBlockElementComponentConfig[];
    };
    isListStyleAuto: boolean;
    mainColor: TokenValue;
    mainFont: TokenValue;
};
declare function buildRichTextComponentConfig({ accessibilityRole, locale, elements, isListStyleAuto, mainColor, mainFont, }: Pick<RichTextComponentConfig, "mainColor" | "mainFont"> & Partial<Pick<RichTextComponentConfig, "accessibilityRole" | "isListStyleAuto">> & {
    locale: string;
    elements: RichTextComponentConfig["elements"][string];
}): RichTextComponentConfig;
declare function buildRichTextBlockElementComponentConfig(type: RichTextBlockElementType, elements: RichTextBlockElementComponentConfig["elements"]): RichTextBlockElementComponentConfig;
declare function buildRichTextParagraphBlockElementComponentConfig({ elements, }: Pick<RichTextBlockElementComponentConfig, "elements">): RichTextBlockElementComponentConfig;
declare function buildRichTextBulletedListBlockElementComponentConfig({ elements, }: Pick<RichTextBlockElementComponentConfig, "elements">): RichTextBlockElementComponentConfig;
declare function buildRichTextLineElementComponentConfig({ elements, }: Pick<RichTextLineElementComponentConfig, "elements">): RichTextLineElementComponentConfig;
declare function buildRichTextPartComponentConfig({ color, font, value, id, TextWrapper, }: SetOptional<Omit<RichTextPartComponentConfig, "_id" | "_component"> & Partial<Identity>, "TextWrapper">): RichTextPartComponentConfig;
export { buildRichTextBlockElementComponentConfig, buildRichTextBulletedListBlockElementComponentConfig, buildRichTextComponentConfig, buildRichTextLineElementComponentConfig, buildRichTextNoCodeEntry, buildRichTextParagraphBlockElementComponentConfig, buildRichTextPartComponentConfig, };
//# sourceMappingURL=builders.d.ts.map