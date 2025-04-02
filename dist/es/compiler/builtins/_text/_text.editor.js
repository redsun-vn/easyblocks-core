'use client';
/* with love from shopstory */
import _extends from '@babel/runtime/helpers/extends';
import React from 'react';
import { InlineTextarea } from './InlineTextarea.js';
import { dotNotationGet } from '../../../utils/object/dotNotationGet.js';

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
  const configValue = dotNotationGet(form.values, valuePath);
  const isLocalTextReference = configValue.id?.startsWith("local.");
  return /*#__PURE__*/React.createElement(Text.type, _extends({}, Text.props, {
    as: "div"
  }), isLocalTextReference ? /*#__PURE__*/React.createElement(InlineTextarea, {
    path: path,
    placeholder: "Here goes text content",
    stitches: runtime.stitches
  }) : value ?? /*#__PURE__*/React.createElement("span", null, "\xA0"));
}

export { TextEditor };
