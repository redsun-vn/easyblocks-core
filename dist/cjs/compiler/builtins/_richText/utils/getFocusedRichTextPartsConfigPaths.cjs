/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var slate = require('slate');

function getFocusedRichTextPartsConfigPaths(editor) {
  if (editor.selection !== null) {
    const isBackward = slate.Range.isBackward(editor.selection);
    const anchorProperty = isBackward ? "focus" : "anchor";
    const focusProperty = isBackward ? "anchor" : "focus";
    const anchor = editor.selection[anchorProperty];
    const focus = editor.selection[focusProperty];
    const selectedTextNodes = Array.from(slate.Editor.nodes(editor, {
      match: slate.Text.isText
    }));
    if (selectedTextNodes.length === 1) {
      const range = {
        start: anchor.offset,
        end: focus.offset
      };
      const [textNode, textPath] = selectedTextNodes[0];
      return [buildFocusedRichTextPartConfigPath(textNode, textPath, range)];
    }
    const focusedRichTextPartsConfigPaths = selectedTextNodes.map((_ref, textEntryIndex) => {
      let [textNode, textPath] = _ref;
      if (textNode.text === "") {
        return null;
      }
      let range = null;
      if (textEntryIndex === 0) {
        range = {
          start: anchor.offset,
          end: textNode.text.length
        };
      }
      if (textEntryIndex === selectedTextNodes.length - 1) {
        range = {
          start: 0,
          end: focus.offset
        };
      }
      return buildFocusedRichTextPartConfigPath(textNode, textPath, range);
    }).filter(configPath => {
      return configPath !== null;
    });
    return focusedRichTextPartsConfigPaths;
  }
  return [];
}
function buildFocusedRichTextPartConfigPath(textNode, path, range) {
  let focusedRichTextPartConfigPath = path.join(".elements.");
  if (range !== null && (isPartialSelection(range, textNode) || isCaretSelection(range))) {
    focusedRichTextPartConfigPath += `.{${range.start},${range.end}}`;
  }
  return focusedRichTextPartConfigPath;
}
function isPartialSelection(range, textNode) {
  return range.end - range.start !== textNode.text.length;
}
function isCaretSelection(range) {
  return range.end - range.start === 0;
}

exports.getFocusedRichTextPartsConfigPaths = getFocusedRichTextPartsConfigPaths;
//# sourceMappingURL=getFocusedRichTextPartsConfigPaths.cjs.map
