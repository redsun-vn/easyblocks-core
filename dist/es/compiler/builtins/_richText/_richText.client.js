/* with love from shopstory */
import _extends from '@babel/runtime/helpers/extends';
import React from 'react';

function RichTextClient(props) {
  const {
    elements: Elements,
    Root
  } = props;
  return /*#__PURE__*/React.createElement(Root.type, Root.props, Elements.map((Element, index) => {
    return /*#__PURE__*/React.createElement(Element.type, _extends({}, Element.props, {
      key: index
    }));
  }));
}

export { RichTextClient };
//# sourceMappingURL=_richText.client.js.map
