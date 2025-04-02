/* with love from shopstory */
import _extends from '@babel/runtime/helpers/extends';
import { dotNotationGet } from '@easyblocks/utils';
import React, { useState, useRef } from 'react';
import { flushSync } from 'react-dom';
import TextareaAutosize from 'react-textarea-autosize';
import { useTextValue } from '../useTextValue.js';

function InlineTextarea(_ref) {
  let {
    path,
    placeholder,
    stitches
  } = _ref;
  const [isEnabled, setIsEnabled] = useState(false);
  const textAreaRef = useRef(null);
  const {
    form,
    contextParams: {
      locale
    },
    locales
  } = window.parent.editorWindowAPI.editorContext;
  const valuePath = `${path}.value`;
  const value = dotNotationGet(form.values, valuePath);
  const inputProps = useTextValue(value, val => {
    form.change(valuePath, val);
  }, locale, locales, placeholder);
  const css = stitches.css({
    width: "100%",
    wordWrap: "break-word",
    display: "block",
    fontSize: "inherit",
    fontFamily: "inherit",
    fontWeight: "inherit",
    boxSizing: "border-box",
    color: "inherit",
    letterSpacing: "inherit",
    lineHeight: "inherit",
    margin: "0 auto",
    maxWidth: "inherit",
    textTransform: "inherit",
    backgroundColor: "inherit",
    textAlign: "inherit",
    outline: "none",
    resize: "none",
    border: "none",
    overflow: "visible",
    position: "relative",
    padding: 0,
    "-ms-overflow-style": "none",
    "&::-webkit-scrollbar": {
      display: "none"
    },
    pointerEvents: isEnabled ? "auto" : "none"
  })();
  return /*#__PURE__*/React.createElement("div", {
    onMouseDown: event => {
      if (event.detail === 2) {
        event.preventDefault();
        flushSync(() => {
          setIsEnabled(true);
        });
        textAreaRef.current?.select();
      }
    }
  }, /*#__PURE__*/React.createElement(TextareaAutosize, _extends({
    className: css,
    rows: 1
  }, inputProps, {
    ref: textAreaRef,
    onMouseDown: event => {
      if (isEnabled) {
        event.stopPropagation();
        return;
      }
    },
    onBlur: () => {
      setIsEnabled(false);
    }
  })));
}

export { InlineTextarea };
