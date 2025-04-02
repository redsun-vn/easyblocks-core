/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var $richTextPart = require('../_richTextPart/_richTextPart.cjs');
var $richTextLineElement_styles = require('./_richTextLineElement.styles.cjs');

const richTextLineElementEditableComponent = {
  id: "@easyblocks/rich-text-line-element",
  schema: [{
    prop: "elements",
    type: "component-collection",
    accepts: [$richTextPart.richTextPartEditableComponent.id]
  }],
  styles: $richTextLineElement_styles.richTextLineElementStyles
};

exports.richTextLineElementEditableComponent = richTextLineElementEditableComponent;
