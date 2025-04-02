/* with love from shopstory */
function richTextStyles(_ref) {
  let {
    values,
    params
  } = _ref;
  const align = params.passedAlign ?? values.align;
  return {
    styled: {
      Root: {
        display: "flex",
        justifyContent: mapAlignmentToFlexAlignment(align),
        textAlign: align
      }
    },
    components: {
      elements: {
        // We store values within $richText to allow for changing them from sidebar, but we use them inside of $richTextBlockElement.
        itemProps: values.elements.map(() => ({
          accessibilityRole: values.accessibilityRole,
          mainColor: values.mainColor,
          mainFont: values.mainFont,
          mainFontSize: values.mainFontSize,
          align
        }))
      }
    },
    props: {
      align
    }
  };
}
function mapAlignmentToFlexAlignment(align) {
  if (align === "center") {
    return "center";
  }
  if (align === "right") {
    return "flex-end";
  }
  return "flex-start";
}

export { mapAlignmentToFlexAlignment, richTextStyles };
