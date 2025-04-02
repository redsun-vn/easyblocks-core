/* with love from shopstory */
import { textStyles } from './_text.styles.js';
import { range } from '../../../utils/array/range.js';

const textEditableComponent = {
  id: "@easyblocks/text",
  label: "Simple Text",
  styles: textStyles,
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
      }, ...range(1, 6).map(index => ({
        value: `h${index}`,
        label: `Heading ${index}`
      }))]
    },
    group: "Accessibility and SEO"
  }]
};

export { textEditableComponent };
