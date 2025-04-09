/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');
var cleanString = require('../../../utils/cleanString.cjs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

function TextClient(props) {
  const {
    value,
    Text
  } = props;

  // We need to transform new lines into <br />
  const lines = cleanString.cleanString(value || "").split(/(?:\r\n|\r|\n)/g);
  const elements = [];
  lines.forEach((line, index) => {
    elements.push(/*#__PURE__*/React__default["default"].createElement(React__default["default"].Fragment, {
      key: index
    }, line));
    if (index !== lines.length - 1) {
      elements.push(/*#__PURE__*/React__default["default"].createElement("br", {
        key: "br" + index
      }));
    }
  });
  return /*#__PURE__*/React__default["default"].createElement(Text.type, Text.props, elements);
}

exports.TextClient = TextClient;
//# sourceMappingURL=_text.client.cjs.map
