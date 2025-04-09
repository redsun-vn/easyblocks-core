/* with love from shopstory */
function textStyles(_ref) {
  let {
    values,
    params
  } = _ref;
  const align = params.passedAlign || "left";
  const fontWithDefaults = {
    fontWeight: "initial",
    fontStyle: "initial",
    ...values.font
  };
  return {
    styled: {
      Text: {
        ...fontWithDefaults,
        __as: values.accessibilityRole,
        color: values.color,
        textAlign: align,
        "& textarea::placeholder": {
          color: "currentColor",
          opacity: 0.5
        },
        "& textarea": {
          // This is important when textarea is globally set in project, here we'll override any global styles.
          ...fontWithDefaults,
          color: values.color
        },
        border: values.value === "" ? "1px dotted grey" : "none"
      }
    }
  };
}

export { textStyles };
//# sourceMappingURL=_text.styles.js.map
