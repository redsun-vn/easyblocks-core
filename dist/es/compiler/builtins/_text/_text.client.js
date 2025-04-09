/* with love from shopstory */
import React from 'react';
import { cleanString } from '../../../utils/cleanString.js';

function TextClient(props) {
  const {
    value,
    Text
  } = props;

  // We need to transform new lines into <br />
  const lines = cleanString(value || "").split(/(?:\r\n|\r|\n)/g);
  const elements = [];
  lines.forEach((line, index) => {
    elements.push(/*#__PURE__*/React.createElement(React.Fragment, {
      key: index
    }, line));
    if (index !== lines.length - 1) {
      elements.push(/*#__PURE__*/React.createElement("br", {
        key: "br" + index
      }));
    }
  });
  return /*#__PURE__*/React.createElement(Text.type, Text.props, elements);
}

export { TextClient };
//# sourceMappingURL=_text.client.js.map
