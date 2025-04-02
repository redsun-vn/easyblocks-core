/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var slate = require('slate');
var convertEditorValueToRichTextElements = require('./utils/convertEditorValueToRichTextElements.cjs');
var getFocusedRichTextPartsConfigPaths = require('./utils/getFocusedRichTextPartsConfigPaths.cjs');
var nonNullable = require('../../../utils/array/nonNullable.cjs');

function isEditorSelection(editor) {
  return editor.selection !== null;
}
function updateSelection(editor, key) {
  for (var _len = arguments.length, values = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    values[_key - 2] = arguments[_key];
  }
  if (!isEditorSelection(editor)) {
    return;
  }
  const isSelectionCollapsed = slate.Range.isCollapsed(editor.selection);
  if (values.length === 1) {
    if (key === "TextWrapper" && isSelectionCollapsed) {
      expandCurrentSelectionToWholeTextPart(editor);
    }

    // If `values` contains one element, we want to apply this value to all text nodes.
    slate.Editor.addMark(editor, key, values[0]);
    if (key === "TextWrapper") {
      if (values[0].length > 0) {
        const firstSelectedNodeEntry = slate.Node.first(editor, editor.selection.anchor.path);
        const lastSelectedNodeEntry = slate.Node.last(editor, editor.selection.focus.path);
        if (slate.Text.isText(firstSelectedNodeEntry[0])) {
          const firstSelectedNode = firstSelectedNodeEntry[0];
          const lastSelectedNode = lastSelectedNodeEntry[0];
          if (firstSelectedNode !== lastSelectedNode) {
            slate.Transforms.setNodes(editor, {
              color: firstSelectedNode.color,
              font: firstSelectedNode.font
            }, {
              match: slate.Text.isText
            });
          }
        }
      }
    }
  } else {
    // If `values` contains multiple values, we want to update each selected text node separately with its
    // corresponding value. To do that, we need to obtain selection range for each selected text node
    // and apply correct value.
    const selectedTextNodeEntries = Array.from(slate.Editor.nodes(editor, {
      match: slate.Text.isText
    }));
    const selectedTextNodesRanges = selectedTextNodeEntries.map(_ref => {
      let [, textNodePath] = _ref;
      return slate.Range.intersection(editor.selection, slate.Editor.range(editor, textNodePath));
    }).filter(nonNullable.nonNullable());
    slate.Editor.withoutNormalizing(editor, () => {
      selectedTextNodesRanges.reverse().forEach((range, index) => {
        slate.Transforms.setNodes(editor, {
          [key]: values[index]
        }, {
          at: range,
          match: slate.Text.isText,
          split: true
        });
      });
    });
  }
  const richTextElements = convertEditorValueToRichTextElements.convertEditorValueToRichTextElements(editor.children);
  const newFocusedRichTextParts = getFocusedRichTextPartsConfigPaths.getFocusedRichTextPartsConfigPaths(editor);
  return {
    elements: richTextElements,
    focusedRichTextParts: newFocusedRichTextParts
  };
}
function expandCurrentSelectionToWholeTextPart(editor) {
  const textPartPath = slate.Editor.path(editor, editor.selection.anchor.path);
  slate.Transforms.setSelection(editor, {
    anchor: slate.Editor.start(editor, textPartPath),
    focus: slate.Editor.end(editor, textPartPath)
  });
}

exports.updateSelection = updateSelection;
