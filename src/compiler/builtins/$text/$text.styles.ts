import type {
  NoCodeComponentStylesFunctionInput,
  NoCodeComponentStylesFunctionResult,
} from "../../../types";

export function textStyles({
  values,
  params,
}: NoCodeComponentStylesFunctionInput<
  {
    color: string;
    value: string;
    accessibilityRole: string;
    font: Record<string, any>;
  },
  { passedAlign: string }
>): NoCodeComponentStylesFunctionResult {
  const align = params.passedAlign || "left";

  const fontWithDefaults = {
    background: values.color,
    backgroundClip: "text",
    color: "transparent",
    fontWeight: "initial",
    fontStyle: "initial",
    ...values.font,
  };

  return {
    styled: {
      Text: {
        ...fontWithDefaults,
        __as: values.accessibilityRole,
        textAlign: align,
        "& textarea::placeholder": {
          color: "currentColor",
          opacity: 0.5,
        },
        "& textarea": {
          // This is important when textarea is globally set in project, here we'll override any global styles.
          ...fontWithDefaults,
        },
        border: values.value === "" ? "1px dotted grey" : "none",
      },
    },
  };
}
