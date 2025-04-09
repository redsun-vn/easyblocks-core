/* with love from shopstory */
import { parseFocusedRichTextPartConfigPath } from './parseRichTextPartConfigPath.js';
import { last } from '../../../../utils/array/last.js';
import { dotNotationGet } from '../../../../utils/object/dotNotationGet.js';

function getEditorSelectionFromFocusedFields(focusedFields, form) {
  try {
    const anchorFocusedField = focusedFields[0];
    const focusFocusedField = last(focusedFields);
    const parsedAnchorField = parseFocusedRichTextPartConfigPath(anchorFocusedField);
    const parsedFocusedField = parseFocusedRichTextPartConfigPath(focusFocusedField);
    if (!parsedAnchorField.path.length || !parsedFocusedField.path.length) {
      return null;
    }
    return {
      anchor: {
        offset: parsedAnchorField.range ? parsedAnchorField.range[0] : 0,
        path: parsedAnchorField.path
      },
      focus: {
        offset: parsedFocusedField.range ? parsedFocusedField.range[1] : dotNotationGet(form.values, focusFocusedField).value.length,
        path: parsedFocusedField.path
      }
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

export { getEditorSelectionFromFocusedFields };
//# sourceMappingURL=getEditorSelectionFromFocusedFields.js.map
