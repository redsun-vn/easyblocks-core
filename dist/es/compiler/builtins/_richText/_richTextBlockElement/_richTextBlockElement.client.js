/* with love from shopstory */
import _extends from '@babel/runtime/helpers/extends';
import React from 'react';

function RichTextBlockElementClient(props) {
  const {
    type,
    BulletedList,
    elements: Elements,
    NumberedList,
    Paragraph
  } = props;
  const elements = Elements.map((Element, index) => /*#__PURE__*/React.createElement(Element.type, _extends({}, Element.props, {
    key: index
  })));
  if (type === "paragraph") {
    return /*#__PURE__*/React.createElement(Paragraph.type, Paragraph.props, elements);
  }
  if (type === "bulleted-list") {
    return /*#__PURE__*/React.createElement(BulletedList.type, BulletedList.props, elements);
  }
  if (type === "numbered-list") {
    return /*#__PURE__*/React.createElement(NumberedList.type, NumberedList.props, elements);
  }
  if (process.env.NODE_ENV === "development") {
    console.warn(`Unknown @easyblocks/rich-text-block-element type "${type}"`);
  }
  return /*#__PURE__*/React.createElement("div", null, elements);
}

export { RichTextBlockElementClient };
