/* with love from shopstory */
import { richTextPartEditableComponent } from '../_richTextPart/_richTextPart.js';
import { richTextLineElementStyles } from './_richTextLineElement.styles.js';

const richTextLineElementEditableComponent = {
  id: "@easyblocks/rich-text-line-element",
  schema: [{
    prop: "elements",
    type: "component-collection",
    accepts: [richTextPartEditableComponent.id]
  }],
  styles: richTextLineElementStyles
};

export { richTextLineElementEditableComponent };
