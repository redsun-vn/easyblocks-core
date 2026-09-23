import type {
  NoCodeComponentEntry,
  NoCodeComponentStylesFunctionInput,
  NoCodeComponentStylesFunctionResult,
} from "../../../../types";
import { isGradientColor } from "../../../../utils/isGradientColor";

const DEFAULT_FONT_VALUES = {
  fontWeight: "initial",
  fontStyle: "initial",
};

export interface RichTextPartValues {
  color: string;
  font: Record<string, any>;
  value: string;
  TextWrapper: [NoCodeComponentEntry] | [];
  fontStyle: "normal" | "italic" | "oblique";
}

export function richTextPartStyles({
  values: { color, font, TextWrapper, fontStyle },
  isEditing,
}: NoCodeComponentStylesFunctionInput<RichTextPartValues>): NoCodeComponentStylesFunctionResult {
  const fontWithDefaults = {
    ...DEFAULT_FONT_VALUES,
    ...font,
  };

  const hasTextWrapper = TextWrapper.length > 0;

  /*
   * A flat colour goes into `color`; only a gradient is clipped to the glyphs.
   *
   * Everything used to take the clipped path, which draws the letters
   * transparent and paints them from behind. Selecting them then showed the
   * highlight and nothing else — the words an author had just selected became
   * invisible, in the one moment they most need to see them. The list markers
   * beside this already made the same distinction; the words themselves had
   * not.
   */
  const colorStyles = isGradientColor(color)
    ? { background: color, backgroundClip: "text", color: "transparent" }
    : { color };

  const textStyles: Record<string, any> = {
    __as: "span",
    ...colorStyles,
    ...fontWithDefaults,
    fontStyle: fontStyle ?? "normal",
  };

  if (isGradientColor(color)) {
    /*
     * A gradient has nowhere else to go, so its glyphs stay transparent — and
     * a selection would swallow them. The fill is only asked for while the
     * text is selected, which is exactly when the browser is painting a
     * highlight behind it, and a dark fill reads on every default highlight
     * any of the browsers use.
     */
    textStyles["&::selection"] = { WebkitTextFillColor: "#111111" };
  }

  if (hasTextWrapper && !isEditing) {
    // Force pointer events to be enabled on the text when text wrapper is attached and we're not editing
    textStyles.pointerEvents = "auto";
  }

  if (isEditing) {
    // When editing, we're going to have nested spans rendered by Slate so we need to make sure they inherit the font
    // styles defined on Text component
    textStyles['& [data-slate-string="true"]'] = {
      fontFamily: "inherit",
      fontStyle: "inherit",
      color: "inherit",
    };
  }

  return {
    styled: {
      Text: textStyles,
    },
  };
}
