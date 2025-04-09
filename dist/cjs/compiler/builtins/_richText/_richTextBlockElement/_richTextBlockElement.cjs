/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var $richTextLineElement = require('../_richTextLineElement/_richTextLineElement.cjs');
var $richTextBlockElement_styles = require('./_richTextBlockElement.styles.cjs');

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
    accepts: [$richTextLineElement.richTextLineElementEditableComponent.id]
  }],
  styles: $richTextBlockElement_styles.richTextBlockElementStyles
};

exports.RICH_TEXT_BLOCK_ELEMENT_TYPES = RICH_TEXT_BLOCK_ELEMENT_TYPES;
exports.richTextBlockElementEditableComponent = richTextBlockElementEditableComponent;
//# sourceMappingURL=_richTextBlockElement.cjs.map
