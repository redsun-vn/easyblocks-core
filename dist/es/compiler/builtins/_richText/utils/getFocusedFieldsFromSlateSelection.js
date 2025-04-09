/* with love from shopstory */
import { getAbsoluteRichTextPartPath } from '../getAbsoluteRichTextPartPath.js';
import { getFocusedRichTextPartsConfigPaths } from './getFocusedRichTextPartsConfigPaths.js';

function getFocusedFieldsFromSlateSelection(editor, richTextComponentConfigPath, locale) {
  if (editor.selection === null) {
    return undefined;
  }
  const focusedRichTextPartPaths = getFocusedRichTextPartsConfigPaths(editor);
  const focusedFields = focusedRichTextPartPaths.map(richTextPartPath => getAbsoluteRichTextPartPath(richTextPartPath, richTextComponentConfigPath, locale));
  return focusedFields;
}

export { getFocusedFieldsFromSlateSelection };
//# sourceMappingURL=getFocusedFieldsFromSlateSelection.js.map
