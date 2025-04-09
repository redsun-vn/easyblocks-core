/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var slate = require('slate');
var slateReact = require('slate-react');
var withEasyblocks = require('../withEasyblocks.cjs');

// Slate's transforms methods mutates given editor instance.
// By creating temporary editor instance we can apply all transformations without
// touching original editor and read result from `temporaryEditor.children`
function createTemporaryEditor(editor) {
  const temporaryEditor = withEasyblocks.withEasyblocks(slateReact.withReact(slate.createEditor()));
  temporaryEditor.children = [...editor.children];
  temporaryEditor.selection = editor.selection ? {
    ...editor.selection
  } : null;
  return temporaryEditor;
}

exports.createTemporaryEditor = createTemporaryEditor;
//# sourceMappingURL=createTemporaryEditor.cjs.map
