/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const DEFAULT_FONT_VALUES = {
  fontWeight: "initial",
  fontStyle: "initial"
};
function richTextPartStyles(_ref) {
  let {
    values: {
      color,
      font,
      TextWrapper
    },
    isEditing
  } = _ref;
  const fontWithDefaults = {
    ...DEFAULT_FONT_VALUES,
    ...font
  };
  const hasTextWrapper = TextWrapper.length > 0;
  const textStyles = {
    __as: "span",
    color,
    ...fontWithDefaults
  };
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
      color: "inherit"
    };
  }
  return {
    styled: {
      Text: textStyles
    }
  };
}

exports.richTextPartStyles = richTextPartStyles;
//# sourceMappingURL=_richTextPart.styles.cjs.map
