/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function getAbsoluteRichTextPartPath(relativeRichTextPartPath, richTextPath, locale) {
  return `${richTextPath}.elements.${locale}.${relativeRichTextPartPath}`;
}

exports.getAbsoluteRichTextPartPath = getAbsoluteRichTextPartPath;
//# sourceMappingURL=getAbsoluteRichTextPartPath.cjs.map
