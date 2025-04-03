/* with love from shopstory */
import { a3 as deepClone, a4 as traverseComponents, e as configTraverse, a5 as uniqueId, a6 as buildRichTextBlockElementComponentConfig, a7 as buildRichTextLineElementComponentConfig, a8 as buildRichTextPartComponentConfig, j as cleanString, a9 as nonNullable, aa as deepCompare, ab as dotNotationGet, ac as dotNotationSet, I as getFallbackForLocale, N as responsiveValueFill, o as getDevicesWidths, ad as compileBox, ae as getBoxStyles, af as Box, R as RichTextPartClient, C as ComponentBuilder, G as getDefaultLocale, c as createCompilationContext, a2 as EasyblocksBackend } from './EasyblocksBackend-fd68f091.js';
export { D as CompilationCache, C as ComponentBuilder, E as EasyblocksMetadataProvider, a6 as buildRichTextBlockElementComponentConfig, aB as buildRichTextBulletedListBlockElementComponentConfig, aC as buildRichTextComponentConfig, a7 as buildRichTextLineElementComponentConfig, l as buildRichTextNoCodeEntry, aD as buildRichTextParagraphBlockElementComponentConfig, a8 as buildRichTextPartComponentConfig, ad as compileBox, d as compileInternal, av as componentPickerClosed, aw as componentPickerOpened, e as configTraverse, ag as findComponentDefinition, ah as findComponentDefinitionById, am as findPathOfFirstAncestorOfType, ae as getBoxStyles, F as getSchemaDefinition, at as isCustomSchemaProp, g as isExternalSchemaProp, ar as isSchemaPropActionTextModifier, ao as isSchemaPropCollection, ap as isSchemaPropComponent, an as isSchemaPropComponentCollectionLocalised, aq as isSchemaPropComponentOrComponentCollection, as as isSchemaPropTextModifier, ax as itemInserted, ay as itemMoved, n as normalize, al as parsePath, az as richTextChangedEvent, ai as scalarizeConfig, aA as selectionFramePositionChanged, ak as stripRichTextPartSelection, au as textModifierSchemaProp, a4 as traverseComponents, aj as useEasyblocksMetadata } from './EasyblocksBackend-fd68f091.js';
import _extends from '@babel/runtime/helpers/extends';
import throttle from 'lodash/throttle';
import React, { useState, useRef, useLayoutEffect, useEffect, useCallback, useMemo } from 'react';
import { flushSync } from 'react-dom';
import { Element, Range, Editor, Text, Node, Transforms, createEditor } from 'slate';
import { withReact, ReactEditor, Slate, Editable } from 'slate-react';
import TextareaAutosize from 'react-textarea-autosize';
import debounce from 'lodash/debounce';
import 'js-xxhash';
import 'postcss-value-parser';
import 'zod';
import '@stitches/core';

function last(collection) {
  return collection[collection.length - 1];
}

/**
 * `Object.keys` is badly typed for its reasons and this function just fixes it.
 * https://stackoverflow.com/questions/55012174/why-doesnt-object-keys-return-a-keyof-type-in-typescript
 */
function keys(o) {
  return Object.keys(o);
}

function duplicateConfig(inputConfig, compilationContext) {
  // deep copy first
  const config = deepClone(inputConfig);

  // refresh component ids
  traverseComponents(config, compilationContext, _ref => {
    let {
      componentConfig
    } = _ref;
    componentConfig._id = uniqueId();
  });

  // every text must get new local id
  configTraverse(config, compilationContext, _ref2 => {
    let {
      value,
      schemaProp
    } = _ref2;
    if (schemaProp.type === "text") {
      value.id = "local." + uniqueId();
    }
  });
  return config;
}

const RICH_TEXT_CONFIG_SYNC_THROTTLE_TIMEOUT = 150;
const RICH_TEXT_FOCUSED_FIELDS_SYNC_THROTTLE_TIMEOUT = 100;

function getAbsoluteRichTextPartPath(relativeRichTextPartPath, richTextPath, locale) {
  return `${richTextPath}.elements.${locale}.${relativeRichTextPartPath}`;
}

function convertEditorValueToRichTextElements(editorValue) {
  return editorValue.map(blockElement => {
    if (Element.isElementType(blockElement, "bulleted-list")) {
      return convertEditorListElementToRichTextListBlockElement("bulleted-list", blockElement);
    }
    if (Element.isElementType(blockElement, "numbered-list")) {
      return convertEditorListElementToRichTextListBlockElement("numbered-list", blockElement);
    }
    if (Element.isElementType(blockElement, "paragraph")) {
      return convertEditorParagraphElementToRichTextParagraphBlockElement(blockElement);
    }
    throw new Error("Unknown block element");
  });
}
function convertEditorElementToRichTextLineElement(editorElement) {
  const lineElement = buildRichTextLineElementComponentConfig({
    elements: editorElement.children.map(child => {
      return buildRichTextPartComponentConfig({
        value: cleanString(child.text),
        color: child.color,
        font: child.font,
        id: child.id,
        TextWrapper: child.TextWrapper
      });
    })
  });
  lineElement._id = editorElement.id;
  return lineElement;
}
function convertEditorListElementToRichTextListBlockElement(type, editorElement) {
  const listBlockElement = buildRichTextBlockElementComponentConfig(type, editorElement.children.map(child => {
    return convertEditorElementToRichTextLineElement(child);
  }));
  listBlockElement._id = editorElement.id;
  return listBlockElement;
}
function convertEditorParagraphElementToRichTextParagraphBlockElement(editorElement) {
  const paragraphBlockElement = buildRichTextBlockElementComponentConfig("paragraph", editorElement.children.map(child => {
    return convertEditorElementToRichTextLineElement(child);
  }));
  paragraphBlockElement._id = editorElement.id;
  return paragraphBlockElement;
}

function getFocusedRichTextPartsConfigPaths(editor) {
  if (editor.selection !== null) {
    const isBackward = Range.isBackward(editor.selection);
    const anchorProperty = isBackward ? "focus" : "anchor";
    const focusProperty = isBackward ? "anchor" : "focus";
    const anchor = editor.selection[anchorProperty];
    const focus = editor.selection[focusProperty];
    const selectedTextNodes = Array.from(Editor.nodes(editor, {
      match: Text.isText
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
  const isSelectionCollapsed = Range.isCollapsed(editor.selection);
  if (values.length === 1) {
    if (key === "TextWrapper" && isSelectionCollapsed) {
      expandCurrentSelectionToWholeTextPart(editor);
    }

    // If `values` contains one element, we want to apply this value to all text nodes.
    Editor.addMark(editor, key, values[0]);
    if (key === "TextWrapper") {
      if (values[0].length > 0) {
        const firstSelectedNodeEntry = Node.first(editor, editor.selection.anchor.path);
        const lastSelectedNodeEntry = Node.last(editor, editor.selection.focus.path);
        if (Text.isText(firstSelectedNodeEntry[0])) {
          const firstSelectedNode = firstSelectedNodeEntry[0];
          const lastSelectedNode = lastSelectedNodeEntry[0];
          if (firstSelectedNode !== lastSelectedNode) {
            Transforms.setNodes(editor, {
              color: firstSelectedNode.color,
              font: firstSelectedNode.font
            }, {
              match: Text.isText
            });
          }
        }
      }
    }
  } else {
    // If `values` contains multiple values, we want to update each selected text node separately with its
    // corresponding value. To do that, we need to obtain selection range for each selected text node
    // and apply correct value.
    const selectedTextNodeEntries = Array.from(Editor.nodes(editor, {
      match: Text.isText
    }));
    const selectedTextNodesRanges = selectedTextNodeEntries.map(_ref => {
      let [, textNodePath] = _ref;
      return Range.intersection(editor.selection, Editor.range(editor, textNodePath));
    }).filter(nonNullable());
    Editor.withoutNormalizing(editor, () => {
      selectedTextNodesRanges.reverse().forEach((range, index) => {
        Transforms.setNodes(editor, {
          [key]: values[index]
        }, {
          at: range,
          match: Text.isText,
          split: true
        });
      });
    });
  }
  const richTextElements = convertEditorValueToRichTextElements(editor.children);
  const newFocusedRichTextParts = getFocusedRichTextPartsConfigPaths(editor);
  return {
    elements: richTextElements,
    focusedRichTextParts: newFocusedRichTextParts
  };
}
function expandCurrentSelectionToWholeTextPart(editor) {
  const textPartPath = Editor.path(editor, editor.selection.anchor.path);
  Transforms.setSelection(editor, {
    anchor: Editor.start(editor, textPartPath),
    focus: Editor.end(editor, textPartPath)
  });
}

function convertRichTextElementsToEditorValue(richTextElements) {
  if (!richTextElements || richTextElements.length === 0) {
    return getPlaceholderRichTextElements();
  }
  return richTextElements.map(richTextBlockElementComponentConfig => {
    return convertRichTextBlockElementComponentConfigToEditorElement(richTextBlockElementComponentConfig);
  });
}
function convertRichTextPartComponentConfigToEditorText(richTextPartComponentConfig) {
  return {
    color: richTextPartComponentConfig.color,
    font: richTextPartComponentConfig.font,
    id: richTextPartComponentConfig._id,
    text: richTextPartComponentConfig.value,
    TextWrapper: richTextPartComponentConfig.TextWrapper
  };
}
function convertRichTextBlockElementComponentConfigToEditorElement(blockElementComponentConfig) {
  if (blockElementComponentConfig.type === "bulleted-list" || blockElementComponentConfig.type === "numbered-list") {
    return {
      id: blockElementComponentConfig._id,
      type: blockElementComponentConfig.type,
      children: blockElementComponentConfig.elements.map(lineElementComponentConfig => {
        return {
          type: "list-item",
          id: lineElementComponentConfig._id,
          children: lineElementComponentConfig.elements.map(childComponentConfig => {
            return convertRichTextPartComponentConfigToEditorText(childComponentConfig);
          })
        };
      })
    };
  }
  return {
    id: blockElementComponentConfig._id,
    type: blockElementComponentConfig.type,
    children: blockElementComponentConfig.elements.map(lineElementComponentConfig => {
      return {
        type: "text-line",
        id: lineElementComponentConfig._id,
        children: lineElementComponentConfig.elements.map(childComponentConfig => {
          return convertRichTextPartComponentConfigToEditorText(childComponentConfig);
        })
      };
    })
  };
}
function getPlaceholderRichTextElements() {
  return [{
    id: uniqueId(),
    type: "paragraph",
    children: [{
      id: uniqueId(),
      type: "text-line",
      children: [{
        id: uniqueId(),
        color: {
          tokenId: "black",
          value: "black",
          widgetId: "@easyblocks/color"
        },
        font: {
          tokenId: "$body",
          value: ""
        },
        text: "",
        TextWrapper: []
      }]
    }]
  }];
}

/**
 * Tracks which ids were used during current normalization run
 */
const USED_IDS = new Set();

/**
 * Keeps track what was the previous id before generating the unique id. This is needed because Slate rerenders before
 * our config updates and it wouldn't know which compiled component to render.
 */
const NORMALIZED_IDS_TO_IDS = new Map();
function withEasyblocks(editor) {
  const {
    /*insertText,*/normalizeNode
  } = editor;

  // editor.insertText = (text) => {
  //   // Verify if the current selection is placed at the end of an inline element. If yes, set the selection to start of
  //   // the next element before adding new text. This allows to break out from the inline element if it's placed at the end of line.
  //   if (editor.selection && Range.isCollapsed(editor.selection)) {
  //     const selectedNodeParent = Editor.parent(
  //       editor,
  //       editor.selection.focus.path
  //     );

  //     if (selectedNodeParent) {
  //       const [parentNode, parentNodePath] = selectedNodeParent;

  //       if (SlateElement.isElement(parentNode) && editor.isInline(parentNode)) {
  //         const isCursorSetAtTheEnd = Editor.isEnd(
  //           editor,
  //           editor.selection.focus,
  //           parentNodePath
  //         );

  //         const nodePointAfterInlineElement = Editor.after(
  //           editor,
  //           parentNodePath
  //         );

  //         if (isCursorSetAtTheEnd && nodePointAfterInlineElement) {
  //           Transforms.setSelection(editor, {
  //             anchor: nodePointAfterInlineElement,
  //             focus: nodePointAfterInlineElement,
  //           });
  //         }
  //       }
  //     }
  //   }

  //   insertText(text);
  // };

  editor.normalizeNode = entry => {
    // When copying text content from content editable element, Slate wraps pasted content into top most element.
    // We need to unwrap each block element that is nested within another block element.
    if (unwrapBlockElementsNestedWithinBlockElement(editor, entry)) {
      return;
    }

    // Slate by default compares text elements and merges them, but to compare them it uses strict equality comparison algorithm.
    // We need to compare them using our own algorithm.
    if (mergeVisuallyTheSameOrEmptyTextNodes(editor, entry)) {
      return;
    }

    // if (normalizeEmptyTextNodesAfterInlineElements(editor, entry)) {
    //   return;
    // }

    // Rich text and its elements contains collections. Each item of collection should have unique id.
    if (updateNonUniqueIds(editor, entry)) {
      return;
    }

    // Slate normalizes fields from deepest to lowest. The lowest element is editor element which has empty path.
    if (entry[1].length === 0) {
      USED_IDS.clear();
    }
    normalizeNode(entry);
  };
  return editor;
}
function unwrapBlockElementsNestedWithinBlockElement(editor, entry) {
  const [node, path] = entry;
  if (Element.isElement(node) &&
  // This cast is fine since `RichTextBlockElementType` overlaps with type of `node.type`.
  ["bulleted-list", "numbered-list", "paragraph"].includes(node.type)) {
    const nodeParent = Node.parent(editor, path);
    if (Element.isElement(nodeParent)) {
      if (nodeParent.type === node.type) {
        Transforms.unwrapNodes(editor, {
          at: path
        });
        return true;
      }

      // For now there is only one case where block element can be nested within block element of different type,
      // it can happen while pasting content from one $richText to another. We want to keep the type of pasted content
      // so instead of unwrapping nodes, we lift them one level up.
      if (nodeParent.type !== node.type && ["bulleted-list", "numbered-list", "paragraph"].includes(nodeParent.type)) {
        Transforms.liftNodes(editor, {
          at: path
        });
        return true;
      }
    }
  }
  return false;
}
function updateNonUniqueIds(editor, entry) {
  const [node, path] = entry;
  if (Text.isText(node) || Element.isElement(node)) {
    if (USED_IDS.has(node.id)) {
      const newId = uniqueId();
      NORMALIZED_IDS_TO_IDS.set(newId, node.id);
      Transforms.setNodes(editor, {
        id: newId
      }, {
        at: path,
        match: n => (Text.isText(n) || Element.isElement(n)) && n.id === node.id
      });
      return true;
    } else {
      USED_IDS.add(node.id);
    }
  }
  return false;
}
function mergeVisuallyTheSameOrEmptyTextNodes(editor, entry) {
  const [node, path] = entry;
  if (Element.isElement(node) && (node.type === "text-line" || node.type === "list-item")) {
    const textLineChildren = Array.from(Node.children(editor, path));
    if (textLineChildren.length > 1) {
      for (let childIndex = 0; childIndex < textLineChildren.length - 1; childIndex++) {
        const [currentChildNode, currentChildPath] = textLineChildren[childIndex];
        const [nextChildNode, nextChildPath] = textLineChildren[childIndex + 1];
        if (Text.isText(currentChildNode) && Text.isText(nextChildNode)) {
          if (compareText(currentChildNode, nextChildNode)) {
            Transforms.mergeNodes(editor, {
              at: nextChildPath,
              match: node => Text.isText(node)
            });
            return true;
          }
          if (nextChildNode.text.trim() === "" && childIndex + 1 < textLineChildren.length - 1 && currentChildNode.TextWrapper.length === 0) {
            Transforms.mergeNodes(editor, {
              at: nextChildPath,
              match: node => Text.isText(node)
            });
            return true;
          }

          // `Transforms.mergeNodes` always merges node/nodes at given position into PREVIOUS node.
          // In this case, we want to merge node at current position into next one.
          if (currentChildNode.text.trim() === "" && nextChildNode !== undefined) {
            Transforms.setNodes(editor, {
              color: nextChildNode.color,
              font: nextChildNode.font
            }, {
              at: currentChildPath,
              match: node => Text.isText(node)
            });
          }
        }
      }
    }
  }
  return false;
}

// This function might be useful in the future, but right now it's not needed.

// Slate normalization rules states that an inline element cannot be first or last child of block element.
// Slate during its own normalization will add empty Text nodes before or/and after inline element.
// Those Text nodes will be missing properties we add during constructing Slate value based on Shopstory config
// thus it will make compilation error because of missing schema prop values.
// function normalizeEmptyTextNodesAfterInlineElements(
//   editor: Editor,
//   entry: NodeEntry<SlateNode>
// ): boolean {
//   const [node, path] = entry;

//   if (
//     SlateElement.isElement(node) &&
//     (node.type === "text-line" || node.type === "list-item")
//   ) {
//     for (let index = 0; index < node.children.length; index++) {
//       const childNode = node.children[index];
//       const previousNode = node.children[index - 1];
//       const nextNode = node.children[index + 1];

//       if (
//         previousNode &&
//         nextNode &&
//         isElementInlineWrapperElement(previousNode) &&
//         isElementInlineWrapperElement(nextNode)
//       ) {
//         if (Text.isText(childNode) && childNode.text === "") {
//           Transforms.removeNodes(editor, {
//             at: [...path, index],
//           });
//           return true;
//         }
//       }

//       if (
//         childNode &&
//         nextNode &&
//         isElementInlineWrapperElement(childNode) &&
//         isElementInlineWrapperElement(nextNode)
//       ) {
//         const nextNodePath = [...path, index + 1];

//         Transforms.mergeNodes(editor, {
//           at: nextNodePath,
//         });

//         return true;
//       }
//     }
//   }

//   return false;
// }

function filterNonComparableProperties(obj) {
  return keys(obj).filter(key => ["color", "font", "TextWrapper"].includes(key)).reduce((filteredObject, currentKey) => {
    filteredObject[currentKey] = obj[currentKey];
    return filteredObject;
  }, {});
}
function compareText(text1, text2) {
  let areEqual = true;
  const part1Keys = keys(filterNonComparableProperties(text1));
  const part2Keys = keys(filterNonComparableProperties(text2));
  if (part1Keys.length !== part2Keys.length) {
    return false;
  }
  for (let index = 0; index < part1Keys.length; index++) {
    const key = part1Keys[index];
    const part1Value = text1[key];
    const part2Value = text2[key];
    const areValuesEqual = deepCompare(part1Value, part2Value);
    if (!areValuesEqual) {
      areEqual = false;
      break;
    }
  }
  return areEqual;
}

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

function traverseCompiledRichTextComponentConfig(config, callback) {
  config.elements.forEach(reactElement => {
    callback(reactElement.props.compiled);
    reactElement.props.compiled.components.elements.forEach(compiledLineElement => {
      callback(compiledLineElement);
      compiledLineElement.components.elements.forEach(compiledTextPart => {
        callback(compiledTextPart);
      });
    });
  });
}

function extractElementsFromCompiledComponents(compiledRichText) {
  const extractedCompiledElementComponents = [];
  traverseCompiledRichTextComponentConfig(compiledRichText, compiledConfig => {
    if (compiledConfig._component === "@easyblocks/rich-text-block-element" || compiledConfig._component === "@easyblocks/rich-text-line-element") {
      extractedCompiledElementComponents.push(compiledConfig);
    }
  });
  return extractedCompiledElementComponents;
}

function extractTextPartsFromCompiledComponents(compiledRichText) {
  const extractedTextPartComponents = [];
  traverseCompiledRichTextComponentConfig(compiledRichText, compiledConfig => {
    if (compiledConfig._component === "@easyblocks/rich-text-part") {
      extractedTextPartComponents.push(compiledConfig);
    }
  });
  return extractedTextPartComponents;
}

function parseFocusedRichTextPartConfigPath(focusedRichTextPartConfigPath) {
  const focusedRichTextPartConfigPathMatch = focusedRichTextPartConfigPath.match(/\d+(\.elements\.\d+){2,3}/);
  if (focusedRichTextPartConfigPathMatch === null) {
    throw new Error("Invalid @easyblocks/rich-text-part config path");
  }
  const [richTextPartConfigPath] = focusedRichTextPartConfigPathMatch;
  const path = richTextPartConfigPath.split(".elements.").map(index => +index);
  const rangeMatch = focusedRichTextPartConfigPath.match(/\.\{(\d+),(\d+)\}$/);
  const range = rangeMatch !== null ? [+rangeMatch[1], +rangeMatch[2]] : null;
  return {
    path: path,
    range
  };
}

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

function getFocusedFieldsFromSlateSelection(editor, richTextComponentConfigPath, locale) {
  if (editor.selection === null) {
    return undefined;
  }
  const focusedRichTextPartPaths = getFocusedRichTextPartsConfigPaths(editor);
  const focusedFields = focusedRichTextPartPaths.map(richTextPartPath => getAbsoluteRichTextPartPath(richTextPartPath, richTextComponentConfigPath, locale));
  return focusedFields;
}

/**
 * When selecting text within $richText, we keep information about which text parts are selected
 * within focused fields. If the text part is partially selected, we add information about the selection.
 * This selection has format: ".{textPartCharacterSelectionStartIndex,textPartCharacterSelectionEndIndex}".
 * We often want to query related to selection text part component config and to do that correctly we need to
 * strip information about selection.
 */
function stripRichTextPartSelection(value) {
  return value.replace(/\.\{\d+,\d+\}$/g, "");
}

function getRichTextComponentConfigFragment(sourceRichTextComponentConfig, editorContext) {
  const {
    focussedField,
    form,
    contextParams
  } = editorContext;
  const newRichTextComponentConfig = {
    ...sourceRichTextComponentConfig,
    elements: {
      [contextParams.locale]: []
    }
  };
  focussedField.forEach(focusedField => {
    const textPartConfig = dotNotationGet(form.values, stripRichTextPartSelection(focusedField));
    const {
      path,
      range
    } = parseFocusedRichTextPartConfigPath(focusedField);
    const newTextPartConfig = duplicateConfig(textPartConfig, editorContext);
    if (range) {
      newTextPartConfig.value = textPartConfig.value.slice(...range);
    }
    let lastParentConfigPath = `elements.${contextParams.locale}`;
    path.slice(0, -1).forEach((pathIndex, index) => {
      let currentConfigPath = lastParentConfigPath;
      if (index === 0) {
        currentConfigPath += `.${pathIndex}`;
      } else {
        const parentConfig = dotNotationGet(newRichTextComponentConfig, lastParentConfigPath);
        currentConfigPath += `.elements.${Math.min(parentConfig.elements.length, pathIndex)}`;
      }
      const currentConfig = dotNotationGet(newRichTextComponentConfig, currentConfigPath);
      if (!currentConfig) {
        const sourceConfigPath = lastParentConfigPath + (index === 0 ? `.${pathIndex}` : `.elements.${pathIndex}`);
        const sourceConfig = dotNotationGet(sourceRichTextComponentConfig, sourceConfigPath);
        const configCopy = {
          ...sourceConfig,
          elements: []
        };
        dotNotationSet(newRichTextComponentConfig, currentConfigPath, configCopy);
      }
      lastParentConfigPath = currentConfigPath;
    });
    const textPartParentConfig = dotNotationGet(newRichTextComponentConfig, lastParentConfigPath);
    dotNotationSet(newRichTextComponentConfig, lastParentConfigPath, {
      ...textPartParentConfig,
      elements: [...textPartParentConfig.elements, newTextPartConfig]
    });
  });
  return newRichTextComponentConfig;
}

function RichTextEditor(props) {
  const {
    editorContext
  } = window.parent.editorWindowAPI;
  const {
    actions,
    contextParams,
    form,
    focussedField,
    locales,
    setFocussedField
  } = editorContext;
  const {
    __easyblocks: {
      path,
      runtime: {
        resop,
        stitches,
        devices
      }
    },
    align
  } = props;
  let richTextConfig = dotNotationGet(form.values, path);
  const [editor] = useState(() => withEasyblocks(withReact(createEditor())));
  const localizedRichTextElements = richTextConfig.elements[contextParams.locale];
  const fallbackRichTextElements = getFallbackForLocale(richTextConfig.elements, contextParams.locale, locales);
  const richTextElements = localizedRichTextElements ?? fallbackRichTextElements;
  const richTextElementsConfigPath = `${path}.elements.${contextParams.locale}`;
  const [editorValue, setEditorValue] = useState(() => convertRichTextElementsToEditorValue(richTextElements));

  // If rich text has no value, we initialize it with default config by updating it during first render
  // This is only possible when we open entry for non main locale without fallback, this is total edge case
  if (richTextElements.length === 0 && !fallbackRichTextElements) {
    // We only want to show rich text for default config within this component, we don't want to update raw content
    // To prevent implicit update of raw content we make a deep copy.
    richTextConfig = deepClone(richTextConfig);
    richTextConfig.elements[contextParams.locale] = convertEditorValueToRichTextElements(editorValue);
  }

  /**
   * Controls the visibility of decoration imitating browser selection of
   * the selected text after the user has blurred the content editable element.
   */
  const [isDecorationActive, setIsDecorationActive] = useState(false);

  /**
   * Keeps track what caused last change to editor value.
   * This is used in two cases:
   * - text-only changes of editable content shouldn't trigger update of `editor.children` ("text-input")
   * - changes from outside of editable content shouldn't trigger writing to editor's history within change callback ("external")
   */
  const lastChangeReason = useRef("text-input");

  /**
   * Whether the content editable is enabled or not. We enable it through double click.
   */
  const [isEnabled, setIsEnabled] = useState(false);
  const previousRichTextComponentConfig = useRef();
  const currentSelectionRef = useRef(null);
  const isConfigChanged = !isConfigEqual(previousRichTextComponentConfig.current, richTextConfig);
  if (previousRichTextComponentConfig.current && isConfigChanged) {
    if (lastChangeReason.current !== "paste") {
      lastChangeReason.current = "external";
    }
    previousRichTextComponentConfig.current = richTextConfig;
    const nextEditorValue = convertRichTextElementsToEditorValue(richTextElements);
    // React bails out the render if state setter function is invoked during the render phase.
    // Doing it makes Slate always up-to date with the latest config if it's changed from outside.
    // https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops
    setEditorValue(nextEditorValue);
    editor.children = nextEditorValue;
    if (isEnabled) {
      const newEditorSelection = getEditorSelectionFromFocusedFields(focussedField, form);
      if (isDecorationActive) {
        currentSelectionRef.current = newEditorSelection;
      } else {
        // Slate gives us two methods to update its selection:
        // - `setSelection` updates current selection, so `editor.selection` must be not null
        // - `select` sets the selection, so `editor.selection` must be null
        if (newEditorSelection !== null && editor.selection !== null) {
          Transforms.setSelection(editor, newEditorSelection);
        } else if (newEditorSelection !== null && editor.selection === null) {
          Transforms.select(editor, newEditorSelection);
        } else {
          Transforms.deselect(editor);
        }
      }
    }
  }
  useLayoutEffect(() => {
    if (isDecorationActive && currentSelectionRef.current !== null && !Range.isCollapsed(currentSelectionRef.current)) {
      splitStringNodes(editor, currentSelectionRef.current);
      return () => {
        unwrapStringNodesContent(editor);
      };
    }
  }, [editor, isDecorationActive, richTextConfig]);
  const isRichTextActive = focussedField.some(focusedField => focusedField.startsWith(path));
  useLayoutEffect(() => {
    // When rich text becomes inactive we want to restore all original [data-slate-string] nodes
    // by removing all span wrappers that we added to show the mocked browser selection.
    if (!isRichTextActive) {
      unwrapStringNodesContent(editor);
    }
  }, [editor, isRichTextActive]);
  useEffect(() => {
    // We set previous value of rich text only once, then we manually assign it when needed.
    previousRichTextComponentConfig.current = richTextConfig;
  }, []);
  useEffect(
  // Component is blurred when the user selects other component in editor. This is different from blurring content editable.
  // Content editable can be blurred, but the component can remain active ex. when we select some text within content editable
  // and want to update its color from the sidebar.
  function handleRichTextBlur() {
    if (!isRichTextActive && isEnabled) {
      // editor.children = deepClone(editorValue);
      setIsEnabled(false);
      currentSelectionRef.current = null;
    }
    if (!editor.selection) {
      return;
    }
    if (!isRichTextActive) {
      Transforms.deselect(editor);
      const isSlateValueEmpty = isEditorValueEmpty(editor.children);

      // When value for current locale is empty we want to show value from fallback value instead of placeholder
      // if the fallback value is present.
      if (isSlateValueEmpty && fallbackRichTextElements !== undefined) {
        const nextRichTextElement = deepClone(richTextConfig);
        delete nextRichTextElement.elements[contextParams.locale];
        editor.children = convertRichTextElementsToEditorValue(fallbackRichTextElements);
        form.change(path, nextRichTextElement);
      }
    }
  }, [focussedField, isEnabled, isRichTextActive]);
  useEffect(() => {
    // If editor has been refocused and it was blurred earlier we have to disable the decoration to show only browser selection
    if (ReactEditor.isFocused(editor) && isDecorationActive) {
      setIsDecorationActive(false);
    }
  });
  useEffect(() => {
    function handleRichTextChanged(event) {
      if (!editor.selection) {
        return;
      }
      if (event.data.type === "@easyblocks-editor/rich-text-changed") {
        const {
          payload
        } = event.data;
        const {
          editorContext
        } = window.parent.editorWindowAPI;

        // Slate is an uncontrolled component and we don't have an easy access to control it.
        // It keeps its state internally and on each change we convert this state to our format.
        // This works great because changing content of editable element is easy, we append or remove things.
        // When we change the color/font of selected text there are many questions:
        // - is the current selection partial or does it span everything?
        // - how to split text chunks when selection is partial?
        // - how to update selection?
        //
        // `Editor.addMark` method automatically will split (or not) text chunks, update selection etc.
        // It will just do all the painful things. After the Slate do its job, we take its current state after the update
        // and convert it to entry and correct focused fields.
        const temporaryEditor = createTemporaryEditor(editor);
        const updateSelectionResult = updateSelection(temporaryEditor, payload.prop, ...payload.values);
        if (!updateSelectionResult) {
          return;
        }
        currentSelectionRef.current = temporaryEditor.selection;
        actions.runChange(() => {
          const newRichTextElement = {
            ...richTextConfig,
            elements: {
              ...richTextConfig.elements,
              [editorContext.contextParams.locale]: updateSelectionResult.elements
            }
          };
          form.change(path, newRichTextElement);
          const newFocusedFields = updateSelectionResult.focusedRichTextParts.map(focusedRichTextPart => getAbsoluteRichTextPartPath(focusedRichTextPart, path, editorContext.contextParams.locale));
          return newFocusedFields;
        });
      }
    }
    window.addEventListener("message", handleRichTextChanged);
    return () => {
      window.removeEventListener("message", handleRichTextChanged);
    };
  }, [richTextConfig, path]);
  const decorate = createTextSelectionDecorator(editor);
  const Elements = extractElementsFromCompiledComponents(props);
  function renderElement(_ref) {
    let {
      attributes,
      children,
      element
    } = _ref;
    const Element = Elements.find(Element => Element._id === element.id || NORMALIZED_IDS_TO_IDS.get(element.id) === Element._id);
    if (!Element) {
      // This can only happen if the current locale has no value and has no fallback
      if (Elements.length === 0) {
        if (element.type === "list-item") {
          return /*#__PURE__*/React.createElement("div", attributes, /*#__PURE__*/React.createElement("div", null, children));
        }
        return /*#__PURE__*/React.createElement("div", attributes, children);
      }
      throw new Error("Missing element");
    }
    const compiledStyles = (() => {
      if (Element._component === "@easyblocks/rich-text-block-element") {
        if (Element.props.type === "bulleted-list") {
          return Element.styled.BulletedList;
        } else if (Element.props.type === "numbered-list") {
          return Element.styled.NumberedList;
        } else if (Element.props.type === "paragraph") {
          return Element.styled.Paragraph;
        }
      } else if (Element._component === "@easyblocks/rich-text-line-element") {
        if (element.type === "text-line") {
          return Element.styled.TextLine;
        } else if (element.type === "list-item") {
          return Element.styled.ListItem;
        }
      }
    })();
    if (compiledStyles === undefined) {
      throw new Error("Unknown element type");
    }
    return /*#__PURE__*/React.createElement(Box, _extends({
      __compiled: compiledStyles,
      devices: devices,
      stitches: stitches
    }, attributes, process.env.NODE_ENV === "development" && {
      "data-shopstory-element-type": element.type,
      "data-shopstory-id": element.id
    }), element.type === "list-item" ? /*#__PURE__*/React.createElement("div", null, children) : children);
  }
  const TextParts = extractTextPartsFromCompiledComponents(props);
  function renderLeaf(_ref2) {
    let {
      attributes,
      children,
      leaf
    } = _ref2;
    let TextPart = TextParts.find(TextPart => {
      return TextPart._id === leaf.id;
    });
    if (!TextPart) {
      TextPart = TextParts.find(TextPart => {
        return NORMALIZED_IDS_TO_IDS.get(leaf.id) === TextPart._id;
      });
    }
    if (!TextPart) {
      // This can only happen if the current locale has no value and has no fallback
      if (TextParts.length === 0) {
        return /*#__PURE__*/React.createElement("span", attributes, children);
      }
      throw new Error("Missing part");
    }
    const TextPartComponent = /*#__PURE__*/React.createElement(RichTextPartClient, {
      value: children,
      Text: /*#__PURE__*/React.createElement(Box, _extends({
        __compiled: TextPart.styled.Text,
        devices: devices,
        stitches: stitches
      }, attributes)),
      TextWrapper: TextPart.components.TextWrapper[0] ? /*#__PURE__*/React.createElement(ComponentBuilder, {
        compiled: TextPart.components.TextWrapper[0],
        path: path,
        components: editorContext.components,
        passedProps: {
          __isSelected: leaf.isHighlighted && leaf.highlightType === "textWrapper"
        }
      }) : undefined
    });
    return TextPartComponent;
  }

  // Setting `display: flex` for element's aligning on `Editable` component makes default styles
  // of placeholder insufficient thus they require to explicitly set `top` and `left`.
  function renderPlaceholder(_ref3) {
    let {
      attributes,
      children
    } = _ref3;
    return /*#__PURE__*/React.createElement("span", _extends({}, attributes, {
      style: {
        ...attributes.style,
        top: 0,
        left: 0
      }
    }), children);
  }
  const scheduleConfigSync = useCallback(throttle(nextValue => {
    setEditorValue(nextValue);
    const nextElements = convertEditorValueToRichTextElements(nextValue);
    actions.runChange(() => {
      const newRichTextElement = {
        ...richTextConfig,
        elements: {
          ...richTextConfig.elements,
          [editorContext.contextParams.locale]: nextElements
        }
      };
      form.change(path, newRichTextElement);
      previousRichTextComponentConfig.current = newRichTextElement;
      if (editor.selection) {
        const nextFocusedFields = getFocusedFieldsFromSlateSelection(editor, path, contextParams.locale);
        return nextFocusedFields;
      }
    });
  }, RICH_TEXT_CONFIG_SYNC_THROTTLE_TIMEOUT), [isConfigChanged, editorContext.contextParams.locale]);
  const scheduleFocusedFieldsChange = useCallback(
  // Slate internally throttles the invocation of DOMSelectionChange for performance reasons.
  // We also throttle update of our focused fields state for the same reason.
  // This gives us a good balance between perf and showing updated fields within the sidebar.
  throttle(focusedFields => {
    setFocussedField(focusedFields);
  }, RICH_TEXT_FOCUSED_FIELDS_SYNC_THROTTLE_TIMEOUT), [setFocussedField]);
  function handleEditableChange(value) {
    if (!isEnabled) {
      return;
    }

    // Editor's value can be changed from outside ex. sidebar or history undo/redo. If the last reason for change
    // was "external", we skip this change. In case we would like to start typing immediately after undo/redo we
    // set last change reason to `text-input`.
    if (lastChangeReason.current === "external" || lastChangeReason.current === "paste") {
      lastChangeReason.current = "text-input";
      return;
    }
    const isValueSame = deepCompare(value, editorValue);

    // Slate runs `onChange` callback on any change, even when the text haven't changed.
    // If value haven't changed, it must be a selection change.
    if (isValueSame) {
      const nextFocusedFields = getFocusedFieldsFromSlateSelection(editor, path, contextParams.locale);
      if (nextFocusedFields) {
        scheduleFocusedFieldsChange(nextFocusedFields);
      }
      return;
    }
    lastChangeReason.current = "text-input";
    scheduleConfigSync(value);
  }
  function handleEditableFocus() {
    if (!isEnabled) {
      return;
    }
    lastChangeReason.current = "text-input";

    // When value for current locale is empty we present the value from fallback.
    // If user focuses editable element, we present the value of fallback unless it's also empty.
    if (!localizedRichTextElements) {
      let nextSlateValue = editor.children;
      let nextRichTextComponentConfig;
      if (fallbackRichTextElements) {
        nextRichTextComponentConfig = richTextConfig;
        const fallbackFirstTextPart = fallbackRichTextElements[0].elements[0].elements[0];

        // Keep only one line element with single empty rich text
        nextRichTextComponentConfig.elements[contextParams.locale] = [{
          ...fallbackRichTextElements[0],
          elements: [{
            ...fallbackRichTextElements[0].elements[0],
            elements: [{
              ...fallbackFirstTextPart,
              value: ""
            }]
          }]
        }];
        nextSlateValue = convertRichTextElementsToEditorValue(nextRichTextComponentConfig.elements[contextParams.locale]);
        editor.children = nextSlateValue;
        Transforms.select(editor, {
          anchor: Editor.start(editor, []),
          focus: Editor.start(editor, [])
        });
        form.change(path, nextRichTextComponentConfig);
      } else {
        // If current and fallback value is missing we have:
        // - empty Slate value
        // - empty config within component-collection-localised
        // We will build next $richText component config based on current Slate value
        nextRichTextComponentConfig = richTextConfig;
        nextRichTextComponentConfig.elements[contextParams.locale] = convertEditorValueToRichTextElements(editor.children);
        form.change(path, nextRichTextComponentConfig);
      }
      previousRichTextComponentConfig.current = nextRichTextComponentConfig;
      if (editor.selection) {
        const nextFocusedFields = getFocusedRichTextPartsConfigPaths(editor).map(richTextPartPath => getAbsoluteRichTextPartPath(richTextPartPath, path, contextParams.locale));
        setFocussedField(nextFocusedFields);
      }
    }
    if (isDecorationActive) {
      const root = ReactEditor.findDocumentOrShadowRoot(editor);
      const slateStringElements = root.querySelectorAll("[data-slate-string]");
      slateStringElements.forEach(element => {
        element.replaceChildren(document.createTextNode(element.textContent));
      });
    }
  }
  useEffect(() => {
    function saveLatestSelection() {
      const root = ReactEditor.findDocumentOrShadowRoot(editor);
      const selection = root.getSelection();
      if (selection && selection.type === "Range") {
        currentSelectionRef.current = ReactEditor.toSlateRange(editor, selection, {
          exactMatch: false,
          suppressThrow: true
        });
      } else {
        currentSelectionRef.current = null;
      }
    }
    const throttledSaveLatestSelection = throttle(saveLatestSelection, 100);
    if (isEnabled) {
      window.document.addEventListener("selectionchange", throttledSaveLatestSelection);
      return () => {
        window.document.removeEventListener("selectionchange", throttledSaveLatestSelection);
      };
    }
  }, [editor, isEnabled]);
  function handleEditableBlur() {
    lastChangeReason.current = "external";
    setIsDecorationActive(true);
  }

  // When copying content from content editable, Slate will copy HTML content of selected nodes
  // and this is not what we want. Instead we set clipboard data to contain selected content
  // in form of rich text editable component config.
  function handleEditableCopy(event) {
    const selectedRichTextComponentConfig = getRichTextComponentConfigFragment(richTextConfig, editorContext);
    event.clipboardData.setData("text/x-shopstory", JSON.stringify(selectedRichTextComponentConfig));
  }
  function handleEditablePaste(event) {
    const selectedRichTextComponentConfigClipboardData = event.clipboardData.getData("text/x-shopstory");
    if (selectedRichTextComponentConfigClipboardData) {
      const selectedRichTextComponentConfig = JSON.parse(selectedRichTextComponentConfigClipboardData);

      // Preventing the default action will also prevent Slate from handling this event on his own.
      event.preventDefault();
      const nextSlateValue = convertRichTextElementsToEditorValue(duplicateConfig(selectedRichTextComponentConfig, editorContext).elements[contextParams.locale]);
      const temporaryEditor = createTemporaryEditor(editor);
      Editor.insertFragment(temporaryEditor, nextSlateValue);
      const nextElements = convertEditorValueToRichTextElements(temporaryEditor.children);
      actions.runChange(() => {
        form.change(richTextElementsConfigPath, nextElements);
        const nextFocusedFields = getFocusedFieldsFromSlateSelection(temporaryEditor, path, contextParams.locale);
        return nextFocusedFields;
      });
      lastChangeReason.current = "paste";
    } else if (
    // Slate only handles pasting if the clipboardData contains text/plain type.
    // When copying text from the Contentful's rich text editor, the clipboardData contains
    // more than one type, so we have to handle this case manually.
    event.clipboardData.types.length > 1 && event.clipboardData.types.some(type => type === "text/plain")) {
      Editor.insertText(editor, event.clipboardData.getData("text/plain"));
      event.preventDefault();
    }
  }
  const contentEditableClassName = useMemo(() => {
    const responsiveAlignmentStyles = mapResponsiveAlignmentToStyles(align, {
      devices: editorContext.devices,
      resop
    });
    const isFallbackValueShown = localizedRichTextElements === undefined && fallbackRichTextElements !== undefined;

    // When we make a selection of text within editable container and then blur
    // sometimes the browser selection changes and shows incorrectly selected chunks.
    const getStyles = stitches.css({
      display: "flex",
      ...responsiveAlignmentStyles,
      cursor: !isEnabled ? "inherit" : "text",
      "& *": {
        pointerEvents: isEnabled ? "auto" : "none",
        userSelect: isEnabled ? "auto" : "none"
      },
      "& *::selection": {
        backgroundColor: "#b4d5fe"
      },
      ...(isDecorationActive && {
        "& *::selection": {
          backgroundColor: "transparent"
        },
        "& *[data-easyblocks-rich-text-selection]": {
          backgroundColor: "#b4d5fe"
        }
      }),
      ...(isFallbackValueShown && {
        opacity: 0.5
      }),
      // Remove any text decoration from slate nodes that are elements. We only need text decoration on text elements.
      "[data-slate-node]": {
        textDecoration: "none"
      }
    });
    return getStyles().className;
  }, [align, isDecorationActive, localizedRichTextElements, fallbackRichTextElements, isEnabled]);
  return /*#__PURE__*/React.createElement(Slate, {
    editor: editor,
    value: editorValue,
    onChange: handleEditableChange
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Editable, {
    className: contentEditableClassName,
    placeholder: "Here goes text content",
    renderElement: renderElement,
    renderLeaf: renderLeaf,
    renderPlaceholder: renderPlaceholder,
    decorate: decorate,
    onFocus: handleEditableFocus,
    onBlur: handleEditableBlur,
    onCopy: handleEditableCopy,
    onPaste: handleEditablePaste,
    onMouseDown: event => {
      if (isEnabled) {
        event.stopPropagation();
        return;
      }
      if (event.detail === 2) {
        event.preventDefault();
        flushSync(() => {
          setIsEnabled(true);
        });
        ReactEditor.focus(editor);
        if (isEditorValueEmpty(editor.children)) {
          return;
        }
        const editorSelectionRange = {
          anchor: Editor.start(editor, []),
          focus: Editor.end(editor, [])
        };
        Transforms.setSelection(editor, editorSelectionRange);
        const editorSelectionDOMRange = ReactEditor.toDOMRange(editor, editorSelectionRange);
        window.getSelection()?.setBaseAndExtent(editorSelectionDOMRange.startContainer, editorSelectionDOMRange.startOffset, editorSelectionDOMRange.endContainer, editorSelectionDOMRange.endOffset);
      }
    },
    readOnly: !isEnabled
  })));
}
function isEditorValueEmpty(editorValue) {
  return editorValue.length === 1 && editorValue[0].children.length === 1 && editorValue[0].children[0].children.length === 1 && Text.isText(editorValue[0].children[0].children[0]) && editorValue[0].children[0].children[0].text === "";
}
function isConfigEqual(newConfig, oldConfig) {
  return deepCompare(newConfig, oldConfig);
}
function mapResponsiveAlignmentToStyles(align, _ref4) {
  let {
    devices,
    resop
  } = _ref4;
  function mapAlignmentToFlexAlignment(align) {
    if (align === "center") {
      return "center";
    }
    if (align === "right") {
      return "flex-end";
    }
    return "flex-start";
  }
  const responsiveStyles = resop({
    align: responsiveValueFill(align, devices, getDevicesWidths(devices))
  }, values => {
    return {
      justifyContent: mapAlignmentToFlexAlignment(values.align),
      textAlign: values.align
    };
  }, devices);
  const compiledStyles = compileBox(responsiveStyles, devices);
  return getBoxStyles(compiledStyles, devices);
}
function createTextSelectionDecorator(editor) {
  return _ref5 => {
    let [node, path] = _ref5;
    const decorations = [];
    if (Text.isText(node) && editor.selection !== null && node.TextWrapper.length > 0 && Range.isCollapsed(editor.selection)) {
      const textRange = Editor.range(editor, path);
      const intersection = Range.intersection(editor.selection, textRange);
      if (intersection !== null) {
        const range = {
          isHighlighted: true,
          highlightType: "textWrapper",
          ...textRange
        };
        decorations.push(range);
      }
    }
    return decorations;
  };
}
function splitStringNodes(editor, selection) {
  const nodes = Editor.nodes(editor, {
    at: selection,
    match: Text.isText
  });
  const domNodes = Array.from(nodes).map(_ref6 => {
    let [node] = _ref6;
    const domNode = ReactEditor.toDOMNode(editor, node);
    return domNode;
  });
  if (domNodes.length === 1) {
    const slateString = domNodes[0].querySelector("[data-slate-string]");
    const textContent = slateString.textContent;
    const newChild = document.createDocumentFragment();

    // Selection made within whole text node
    if (textContent.length === selection.focus.offset - selection.anchor.offset || textContent.length === selection.anchor.offset - selection.focus.offset) {
      const selectedTextNode = document.createElement("span");
      selectedTextNode.textContent = textContent;
      selectedTextNode.dataset.easyblocksRichTextSelection = "true";
      newChild.appendChild(selectedTextNode);
      slateString.replaceChildren(newChild);
    } else {
      const selectedTextNode = document.createElement("span");
      selectedTextNode.textContent = textContent.slice(selection.anchor.offset, selection.focus.offset);
      selectedTextNode.dataset.easyblocksRichTextSelection = "true";
      newChild.appendChild(document.createTextNode(textContent.slice(0, selection.anchor.offset)));
      newChild.appendChild(selectedTextNode);
      newChild.appendChild(document.createTextNode(textContent.slice(selection.focus.offset)));
      slateString.replaceChildren(newChild);
    }
    return;
  }
  domNodes.forEach((node, index) => {
    const slateString = node.querySelector("[data-slate-string]");
    if (slateString) {
      const textContent = slateString.textContent;
      const newChild = document.createDocumentFragment();
      if (index === 0) {
        newChild.appendChild(document.createTextNode(slateString.textContent.slice(0, selection.anchor.offset)));
        const selectedTextNode = document.createElement("span");
        selectedTextNode.textContent = textContent.slice(selection.anchor.offset);
        selectedTextNode.dataset.easyblocksRichTextSelection = "true";
        newChild.appendChild(selectedTextNode);
        slateString.replaceChildren(newChild);
      } else if (index === domNodes.length - 1) {
        const selectedTextNode = document.createElement("span");
        selectedTextNode.textContent = textContent.slice(0, selection.focus.offset);
        selectedTextNode.dataset.easyblocksRichTextSelection = "true";
        newChild.appendChild(selectedTextNode);
        newChild.appendChild(document.createTextNode(textContent.slice(selection.focus.offset)));
        slateString.replaceChildren(newChild);
      } else {
        const selectedTextNode = document.createElement("span");
        selectedTextNode.textContent = textContent;
        selectedTextNode.dataset.easyblocksRichTextSelection = "true";
        newChild.appendChild(selectedTextNode);
        slateString.replaceChildren(newChild);
      }
    }
  });
}
function unwrapStringNodesContent(editor) {
  const root = ReactEditor.findDocumentOrShadowRoot(editor);
  const slateStringElements = root.querySelectorAll("[data-slate-string]");
  slateStringElements.forEach(element => {
    element.replaceChildren(document.createTextNode(element.textContent));
  });
}

function useTextValue(value, onChange, locale, locales, defaultPlaceholder, normalize) {
  const isExternal = typeof value === "object" && value !== null;
  const fallbackValue = isExternal ? getFallbackForLocale(value.value, locale, locales) : undefined;
  const valueFromProps = (() => {
    if (isExternal) {
      let displayedValue = value.value?.[locale];
      if (typeof displayedValue !== "string") {
        displayedValue = fallbackValue ?? "";
      }
      return displayedValue;
    }
    return value ?? "";
  })();
  const previousValue = React.useRef(valueFromProps);
  const [localInputValue, setLocalInputValue] = React.useState(valueFromProps);
  function saveNewValue(newValue) {
    if (isExternal) {
      const newExternalValue = {
        ...value,
        value: {
          ...value.value,
          [locale]: newValue
        }
      };
      onChange(newExternalValue);
    } else {
      onChange(newValue);
    }
  }
  const onChangeDebounced = React.useCallback(debounce(newValue => {
    // If normalization is on, we shouldn't save on change
    if (normalize) {
      return;
    }
    saveNewValue(newValue);
  }, 500), [isExternal]);
  function handleBlur() {
    onChangeDebounced.cancel();
    let newValue = localInputValue;
    if (normalize) {
      const normalized = normalize(newValue);
      if (normalized === null) {
        newValue = previousValue.current;
      } else {
        newValue = normalized;
        previousValue.current = localInputValue;
      }
    }
    setLocalInputValue(newValue);
    if (isExternal) {
      if (newValue.trim() === "") {
        saveNewValue(null);
        setLocalInputValue(fallbackValue ?? "");
      } else {
        saveNewValue(newValue);
      }
    } else {
      if (value !== newValue) {
        saveNewValue(newValue);
      }
    }
  }
  function handleChange(event) {
    setLocalInputValue(event.target.value);
    onChangeDebounced(event.target.value);
  }

  // Sync local value with value from the config if the field value has been
  // changed from outside
  React.useEffect(() => {
    setLocalInputValue(valueFromProps);
  }, [valueFromProps]);
  const style = {
    opacity: localInputValue === fallbackValue ? 0.5 : 1
  };
  return {
    onChange: handleChange,
    onBlur: handleBlur,
    value: cleanString(localInputValue),
    style,
    placeholder: defaultPlaceholder ?? "Enter text"
  };
}

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

function buildText(x, editorContext) {
  const defaultLocale = getDefaultLocale(editorContext.locales);
  return {
    id: "locale." + uniqueId(),
    value: {
      [defaultLocale.code]: x
    }
  };
}

const buttonOptionalIconSchemaProp = {
  prop: "symbol",
  label: "Symbol",
  type: "component",
  accepts: ["symbol"],
  visible: true,
  group: "Properties"
};
const buttonRequiredIconSchemaProp = {
  ...buttonOptionalIconSchemaProp,
  required: true
};

function createFormMock() {
  let initialValues = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return {
    reset() {
      this.values = initialValues;
    },
    values: initialValues,
    change(path, value) {
      if (path === "") {
        this.values = value;
        return;
      }
      dotNotationSet(this.values, path, value);
    }
  };
}
function createTestCompilationContext() {
  return createCompilationContext({
    backend: new EasyblocksBackend({
      accessToken: ""
    }),
    locales: [{
      code: "en",
      isDefault: true
    }],
    components: [{
      id: "TestComponent",
      schema: []
    }]
  }, {
    locale: "en"
  }, "TestComponent");
}

export { RichTextEditor, TextEditor, buildText, buttonOptionalIconSchemaProp, buttonRequiredIconSchemaProp, createFormMock, createTestCompilationContext, duplicateConfig, useTextValue };
//# sourceMappingURL=_internals.js.map
