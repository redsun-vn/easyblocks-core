import type {
  NoCodeComponentStylesFunctionInput,
  NoCodeComponentStylesFunctionResult,
} from "../../../types";
import { isGradientColor } from "../../../utils/isGradientColor";

export function textStyles({
  values,
  params,
}: NoCodeComponentStylesFunctionInput<
  {
    color: string;
    value: string;
    accessibilityRole: string;
    font: Record<string, any>;
    fontStyle: "normal" | "italic" | "oblique";
  },
  { passedAlign: string }
>): NoCodeComponentStylesFunctionResult {
  const align = params.passedAlign || "left";

  // Flat colours go into `color`, gradients are clipped to the glyphs. Drawing
  // a flat colour the clipped way leaves the letters transparent, and a
  // selection then shows its highlight with nothing legible inside it.
  const colorStyles = isGradientColor(values.color)
    ? {
        background: values.color,
        backgroundClip: "text",
        color: "transparent",
      }
    : { color: values.color };

  const fontWithDefaults = {
    ...colorStyles,
    fontWeight: "initial",
    fontStyle: "initial",
    ...values.font,
  };

  return {
    styled: {
      Text: {
        ...fontWithDefaults,
        fontStyle: values.fontStyle ?? "normal",
        __as: values.accessibilityRole,
        textAlign: align,
        "& textarea::placeholder": {
          color: "currentColor",
          opacity: 0.5,
        },
        "& textarea": {
          // This is important when textarea is globally set in project, here we'll override any global styles.
          ...fontWithDefaults,
          fontStyle: values.fontStyle ?? "normal",
        },
        border: values.value === "" ? "1px dotted grey" : "none",
      },
    },
  };
}
