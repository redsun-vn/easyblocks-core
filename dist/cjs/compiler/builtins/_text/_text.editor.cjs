'use client';
/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _extends = require('@babel/runtime/helpers/extends');
var React = require('react');
var InlineTextarea = require('./InlineTextarea.cjs');
var dotNotationGet = require('../../../utils/object/dotNotationGet.cjs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _extends__default = /*#__PURE__*/_interopDefaultLegacy(_extends);
var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

function TextEditor(props) {
  const {
    Text,
    value,
    __easyblocks: {
      path,
      runtime
    }
  } = props;
  const {
    form
  } = window.parent.editorWindowAPI.editorContext;
  const valuePath = `${path}.value`;
  const configValue = dotNotationGet.dotNotationGet(form.values, valuePath);
  const isLocalTextReference = configValue.id?.startsWith("local.");
  return /*#__PURE__*/React__default["default"].createElement(Text.type, _extends__default["default"]({}, Text.props, {
    as: "div"
  }), isLocalTextReference ? /*#__PURE__*/React__default["default"].createElement(InlineTextarea.InlineTextarea, {
    path: path,
    placeholder: "Here goes text content",
    stitches: runtime.stitches
  }) : value ?? /*#__PURE__*/React__default["default"].createElement("span", null, "\xA0"));
}

exports.TextEditor = TextEditor;
