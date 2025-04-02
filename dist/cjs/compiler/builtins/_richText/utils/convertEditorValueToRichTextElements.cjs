/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var slate = require('slate');
var builders = require('../builders.cjs');
var cleanString = require('../../../../utils/cleanString.cjs');

function convertEditorValueToRichTextElements(editorValue) {
  return editorValue.map(blockElement => {
    if (slate.Element.isElementType(blockElement, "bulleted-list")) {
      return convertEditorListElementToRichTextListBlockElement("bulleted-list", blockElement);
    }
    if (slate.Element.isElementType(blockElement, "numbered-list")) {
      return convertEditorListElementToRichTextListBlockElement("numbered-list", blockElement);
    }
    if (slate.Element.isElementType(blockElement, "paragraph")) {
      return convertEditorParagraphElementToRichTextParagraphBlockElement(blockElement);
    }
    throw new Error("Unknown block element");
  });
}
function convertEditorElementToRichTextLineElement(editorElement) {
  const lineElement = builders.buildRichTextLineElementComponentConfig({
    elements: editorElement.children.map(child => {
      return builders.buildRichTextPartComponentConfig({
        value: cleanString.cleanString(child.text),
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
  const listBlockElement = builders.buildRichTextBlockElementComponentConfig(type, editorElement.children.map(child => {
    return convertEditorElementToRichTextLineElement(child);
  }));
  listBlockElement._id = editorElement.id;
  return listBlockElement;
}
function convertEditorParagraphElementToRichTextParagraphBlockElement(editorElement) {
  const paragraphBlockElement = builders.buildRichTextBlockElementComponentConfig("paragraph", editorElement.children.map(child => {
    return convertEditorElementToRichTextLineElement(child);
  }));
  paragraphBlockElement._id = editorElement.id;
  return paragraphBlockElement;
}

exports.convertEditorValueToRichTextElements = convertEditorValueToRichTextElements;
