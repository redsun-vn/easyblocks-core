/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

function RichTextPartClient(props) {
  const {
    value,
    Text,
    TextWrapper
  } = props;
  const textValue = value || "\uFEFF";
  if (TextWrapper) {
    return /*#__PURE__*/React__default["default"].createElement(Text.type, Text.props, /*#__PURE__*/React__default["default"].createElement(TextWrapper.type, TextWrapper.props, textValue));
  }
  return /*#__PURE__*/React__default["default"].createElement(Text.type, Text.props, textValue);
}

exports.RichTextPartClient = RichTextPartClient;
//# sourceMappingURL=_richTextPart.client.cjs.map
