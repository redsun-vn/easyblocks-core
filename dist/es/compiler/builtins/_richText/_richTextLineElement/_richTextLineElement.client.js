/* with love from shopstory */
import _extends from '@babel/runtime/helpers/extends';
import React from 'react';

function RichTextLineElementClient(props) {
  const {
    blockType,
    elements: Elements,
    ListItem,
    TextLine
  } = props;
  const elements = Elements.map((Element, index) => /*#__PURE__*/React.createElement(Element.type, _extends({}, Element.props, {
    key: index
  })));
  if (blockType === "paragraph") {
    return /*#__PURE__*/React.createElement(TextLine.type, TextLine.props, elements);
  }
  if (blockType === "bulleted-list" || blockType === "numbered-list") {
    return /*#__PURE__*/React.createElement(ListItem.type, ListItem.props, /*#__PURE__*/React.createElement("div", null, elements));
  }
  if (process.env.NODE_ENV === "development") {
    console.warn(`Unknown @easyblocks/rich-text-line-element blockType "${blockType}"`);
  }
  return /*#__PURE__*/React.createElement("div", null, elements);
}

export { RichTextLineElementClient };
//# sourceMappingURL=_richTextLineElement.client.js.map
