/* with love from shopstory */
import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import { withEasyblocks } from '../withEasyblocks.js';

// Slate's transforms methods mutates given editor instance.
// By creating temporary editor instance we can apply all transformations without
// touching original editor and read result from `temporaryEditor.children`
function createTemporaryEditor(editor) {
  const temporaryEditor = withEasyblocks(withReact(createEditor()));
  temporaryEditor.children = [...editor.children];
  temporaryEditor.selection = editor.selection ? {
    ...editor.selection
  } : null;
  return temporaryEditor;
}

export { createTemporaryEditor };
