/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var parseRichTextPartConfigPath = require('./parseRichTextPartConfigPath.cjs');
var last = require('../../../../utils/array/last.cjs');
var dotNotationGet = require('../../../../utils/object/dotNotationGet.cjs');

function getEditorSelectionFromFocusedFields(focusedFields, form) {
  try {
    const anchorFocusedField = focusedFields[0];
    const focusFocusedField = last.last(focusedFields);
    const parsedAnchorField = parseRichTextPartConfigPath.parseFocusedRichTextPartConfigPath(anchorFocusedField);
    const parsedFocusedField = parseRichTextPartConfigPath.parseFocusedRichTextPartConfigPath(focusFocusedField);
    if (!parsedAnchorField.path.length || !parsedFocusedField.path.length) {
      return null;
    }
    return {
      anchor: {
        offset: parsedAnchorField.range ? parsedAnchorField.range[0] : 0,
        path: parsedAnchorField.path
      },
      focus: {
        offset: parsedFocusedField.range ? parsedFocusedField.range[1] : dotNotationGet.dotNotationGet(form.values, focusFocusedField).value.length,
        path: parsedFocusedField.path
      }
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

exports.getEditorSelectionFromFocusedFields = getEditorSelectionFromFocusedFields;
//# sourceMappingURL=getEditorSelectionFromFocusedFields.cjs.map
