import { uniqueId } from "@easyblocks/utils";
import type { Text } from "slate";
import type { RichTextComponentConfig } from "../$richText";
import type { BlockElement } from "../$richText.types";
import type { RichTextBlockElementComponentConfig } from "../$richTextBlockElement/$richTextBlockElement";
import type { RichTextPartComponentConfig } from "../$richTextPart/$richTextPart";

function convertRichTextElementsToEditorValue(
  richTextElements: RichTextComponentConfig["elements"][string] | undefined
): Array<BlockElement> {
  if (!richTextElements || richTextElements.length === 0) {
    return getPlaceholderRichTextElements();
  }

  return richTextElements.map((richTextBlockElementComponentConfig) => {
    return convertRichTextBlockElementComponentConfigToEditorElement(
      richTextBlockElementComponentConfig
    );
  });
}

export { convertRichTextElementsToEditorValue };

function convertRichTextPartComponentConfigToEditorText(
  richTextPartComponentConfig: RichTextPartComponentConfig
): Text {
  return {
    color: richTextPartComponentConfig.color,
    font: richTextPartComponentConfig.font,
    id: richTextPartComponentConfig._id,
    text: richTextPartComponentConfig.value,
    TextWrapper: richTextPartComponentConfig.TextWrapper,
  };
}

function convertRichTextBlockElementComponentConfigToEditorElement(
  blockElementComponentConfig: RichTextBlockElementComponentConfig
): BlockElement {
  if (
    blockElementComponentConfig.type === "bulleted-list" ||
    blockElementComponentConfig.type === "numbered-list"
  ) {
    return {
      id: blockElementComponentConfig._id,
      type: blockElementComponentConfig.type,
      children: blockElementComponentConfig.elements.map(
        (lineElementComponentConfig) => {
          return {
            type: "list-item",
            id: lineElementComponentConfig._id,
            children: lineElementComponentConfig.elements.map(
              (childComponentConfig) => {
                return convertRichTextPartComponentConfigToEditorText(
                  childComponentConfig
                );
              }
            ),
          };
        }
      ),
    };
  }

  return {
    id: blockElementComponentConfig._id,
    type: blockElementComponentConfig.type,
    children: blockElementComponentConfig.elements.map(
      (lineElementComponentConfig) => {
        return {
          type: "text-line",
          id: lineElementComponentConfig._id,
          children: lineElementComponentConfig.elements.map(
            (childComponentConfig) => {
              return convertRichTextPartComponentConfigToEditorText(
                childComponentConfig
              );
            }
          ),
        };
      }
    ),
  };
}

function getPlaceholderRichTextElements(): Array<BlockElement> {
  return [
    {
      id: uniqueId(),
      type: "paragraph",
      children: [
        {
          id: uniqueId(),
          type: "text-line",
          children: [
            {
              id: uniqueId(),
              color: {
                tokenId: "black",
                value: "black",
                widgetId: "@easyblocks/color",
              },
              font: {
                tokenId: "$body",
                value: "",
              },
              text: "",
              TextWrapper: [],
            },
          ],
        },
      ],
    },
  ];
}
