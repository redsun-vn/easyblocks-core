/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var $richText_styles = require('../_richText.styles.cjs');

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
        justifyContent: $richText_styles.mapAlignmentToFlexAlignment(values.align),
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

exports.richTextLineElementStyles = richTextLineElementStyles;
//# sourceMappingURL=_richTextLineElement.styles.cjs.map
