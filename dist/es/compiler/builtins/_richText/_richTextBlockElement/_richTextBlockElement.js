/* with love from shopstory */
import { richTextLineElementEditableComponent } from '../_richTextLineElement/_richTextLineElement.js';
import { richTextBlockElementStyles } from './_richTextBlockElement.styles.js';

const RICH_TEXT_BLOCK_ELEMENT_TYPES = ["bulleted-list", "numbered-list", "paragraph"];
const RICH_TEXT_BLOCK_ELEMENT_TYPE_OPTIONS = [{
  value: RICH_TEXT_BLOCK_ELEMENT_TYPES[0],
  label: "Bulleted"
}, {
  value: RICH_TEXT_BLOCK_ELEMENT_TYPES[1],
  label: "Numbered"
}, {
  value: RICH_TEXT_BLOCK_ELEMENT_TYPES[2],
  label: "No list"
}];
const richTextBlockElementEditableComponent = {
  id: "@easyblocks/rich-text-block-element",
  schema: [{
    prop: "type",
    type: "select",
    params: {
      options: RICH_TEXT_BLOCK_ELEMENT_TYPE_OPTIONS
    },
    defaultValue: RICH_TEXT_BLOCK_ELEMENT_TYPES[2],
    label: "Type",
    group: "Text"
  }, {
    prop: "elements",
    type: "component-collection",
    accepts: [richTextLineElementEditableComponent.id]
  }],
  styles: richTextBlockElementStyles
};

export { RICH_TEXT_BLOCK_ELEMENT_TYPES, richTextBlockElementEditableComponent };
