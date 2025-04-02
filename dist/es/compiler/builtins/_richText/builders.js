/* with love from shopstory */
import { uniqueId } from '../../../utils/uniqueId.js';

function buildRichTextNoCodeEntry(options) {
  const {
    accessibilityRole,
    font,
    color,
    text,
    locale = "en"
  } = options ?? {};
  const colorTokenValue = {
    value: "#000000",
    widgetId: "@easyblocks/color"
  };
  if (color) {
    colorTokenValue.tokenId = color;
  }
  const fontTokenValue = {
    value: {
      fontFamily: "sans-serif",
      fontSize: "16px"
    }
  };
  if (font) {
    fontTokenValue.tokenId = font;
  }
  return {
    _id: uniqueId(),
    _component: "@easyblocks/rich-text",
    accessibilityRole: accessibilityRole ?? "div",
    elements: {
      [locale ?? "en"]: [buildRichTextBlockElementComponentConfig("paragraph", [buildRichTextLineElementComponentConfig({
        elements: [buildRichTextPartComponentConfig({
          color: colorTokenValue,
          font: fontTokenValue,
          value: text ?? "Lorem ipsum",
          TextWrapper: []
        })]
      })])]
    },
    isListStyleAuto: true,
    mainColor: colorTokenValue,
    mainFont: fontTokenValue
  };
}
function buildRichTextComponentConfig(_ref) {
  let {
    accessibilityRole,
    locale,
    elements,
    isListStyleAuto,
    mainColor,
    mainFont
  } = _ref;
  return {
    _id: uniqueId(),
    _component: "@easyblocks/rich-text",
    accessibilityRole: accessibilityRole ?? "div",
    elements: {
      [locale]: elements
    },
    isListStyleAuto: isListStyleAuto ?? true,
    mainColor,
    mainFont
  };
}
function buildRichTextBlockElementComponentConfig(type, elements) {
  return {
    _component: "@easyblocks/rich-text-block-element",
    elements,
    type,
    _id: uniqueId()
  };
}
function buildRichTextParagraphBlockElementComponentConfig(_ref2) {
  let {
    elements
  } = _ref2;
  return {
    _component: "@easyblocks/rich-text-block-element",
    elements,
    type: "paragraph",
    _id: uniqueId()
  };
}
function buildRichTextBulletedListBlockElementComponentConfig(_ref3) {
  let {
    elements
  } = _ref3;
  return {
    _component: "@easyblocks/rich-text-block-element",
    elements,
    type: "bulleted-list",
    _id: uniqueId()
  };
}
function buildRichTextLineElementComponentConfig(_ref4) {
  let {
    elements
  } = _ref4;
  return {
    _component: "@easyblocks/rich-text-line-element",
    elements,
    _id: uniqueId()
  };
}
function buildRichTextPartComponentConfig(_ref5) {
  let {
    color,
    font,
    value,
    id,
    TextWrapper
  } = _ref5;
  return {
    _id: id ?? uniqueId(),
    _component: "@easyblocks/rich-text-part",
    color,
    font,
    value,
    TextWrapper: TextWrapper ?? []
  };
}

export { buildRichTextBlockElementComponentConfig, buildRichTextBulletedListBlockElementComponentConfig, buildRichTextComponentConfig, buildRichTextLineElementComponentConfig, buildRichTextNoCodeEntry, buildRichTextParagraphBlockElementComponentConfig, buildRichTextPartComponentConfig };
