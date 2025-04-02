/* with love from shopstory */
function getAbsoluteRichTextPartPath(relativeRichTextPartPath, richTextPath, locale) {
  return `${richTextPath}.elements.${locale}.${relativeRichTextPartPath}`;
}

export { getAbsoluteRichTextPartPath };
