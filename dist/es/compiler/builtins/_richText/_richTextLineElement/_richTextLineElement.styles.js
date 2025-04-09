/* with love from shopstory */
import { mapAlignmentToFlexAlignment } from '../_richText.styles.js';

function richTextLineElementStyles(_ref) {
  let {
    values,
    params
  } = _ref;
  return {
    styled: {
      TextLine: {
        lineHeight: "initial",
        wordBreak: "break-word"
      },
      ListItem: {
        __as: "li",
        display: "flex",
        justifyContent: mapAlignmentToFlexAlignment(values.align),
        alignItems: "baseline",
        paddingLeft: 0,
        lineHeight: "initial",
        wordBreak: "break-word",
        listStyle: "none",
        counterIncrement: "list-item",
        // Allows flex items to break when text is overflowing
        "& > *": {
          minWidth: 0
        }
      }
    },
    props: {
      blockType: params.blockType
    }
  };
}

export { richTextLineElementStyles };
//# sourceMappingURL=_richTextLineElement.styles.js.map
