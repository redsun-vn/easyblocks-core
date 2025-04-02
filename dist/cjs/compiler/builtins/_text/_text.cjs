/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utils = require('@easyblocks/utils');
var $text_styles = require('./_text.styles.cjs');

const textEditableComponent = {
  id: "@easyblocks/text",
  label: "Simple Text",
  styles: $text_styles.textStyles,
  type: "item",
  thumbnail: "https://shopstory.s3.eu-central-1.amazonaws.com/picker_icon_text.png",
  schema: [{
    prop: "value",
    label: "Text",
    type: "text"
  }, {
    prop: "color",
    label: "Color",
    type: "color"
  }, {
    prop: "font",
    label: "Font",
    type: "font"
  }, {
    prop: "accessibilityRole",
    type: "select",
    label: "Role",
    params: {
      options: [{
        value: "p",
        label: "Paragraph"
      }, ...utils.range(1, 6).map(index => ({
        value: `h${index}`,
        label: `Heading ${index}`
      }))]
    },
    group: "Accessibility and SEO"
  }]
};

exports.textEditableComponent = textEditableComponent;
