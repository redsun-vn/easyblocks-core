/* with love from shopstory */
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

export { parseFocusedRichTextPartConfigPath };
