/* with love from shopstory */
import { uniqueId } from '../../../../utils/uniqueId.js';

function convertRichTextElementsToEditorValue(richTextElements) {
  if (!richTextElements || richTextElements.length === 0) {
    return getPlaceholderRichTextElements();
  }
  return richTextElements.map(richTextBlockElementComponentConfig => {
    return convertRichTextBlockElementComponentConfigToEditorElement(richTextBlockElementComponentConfig);
  });
}
function convertRichTextPartComponentConfigToEditorText(richTextPartComponentConfig) {
  return {
    color: richTextPartComponentConfig.color,
    font: richTextPartComponentConfig.font,
    id: richTextPartComponentConfig._id,
    text: richTextPartComponentConfig.value,
    TextWrapper: richTextPartComponentConfig.TextWrapper
  };
}
function convertRichTextBlockElementComponentConfigToEditorElement(blockElementComponentConfig) {
  if (blockElementComponentConfig.type === "bulleted-list" || blockElementComponentConfig.type === "numbered-list") {
    return {
      id: blockElementComponentConfig._id,
      type: blockElementComponentConfig.type,
      children: blockElementComponentConfig.elements.map(lineElementComponentConfig => {
        return {
          type: "list-item",
          id: lineElementComponentConfig._id,
          children: lineElementComponentConfig.elements.map(childComponentConfig => {
            return convertRichTextPartComponentConfigToEditorText(childComponentConfig);
          })
        };
      })
    };
  }
  return {
    id: blockElementComponentConfig._id,
    type: blockElementComponentConfig.type,
    children: blockElementComponentConfig.elements.map(lineElementComponentConfig => {
      return {
        type: "text-line",
        id: lineElementComponentConfig._id,
        children: lineElementComponentConfig.elements.map(childComponentConfig => {
          return convertRichTextPartComponentConfigToEditorText(childComponentConfig);
        })
      };
    })
  };
}
function getPlaceholderRichTextElements() {
  return [{
    id: uniqueId(),
    type: "paragraph",
    children: [{
      id: uniqueId(),
      type: "text-line",
      children: [{
        id: uniqueId(),
        color: {
          tokenId: "black",
          value: "black",
          widgetId: "@easyblocks/color"
        },
        font: {
          tokenId: "$body",
          value: ""
        },
        text: "",
        TextWrapper: []
      }]
    }]
  }];
}

export { convertRichTextElementsToEditorValue };
//# sourceMappingURL=convertRichTextElementsToEditorValue.js.map
