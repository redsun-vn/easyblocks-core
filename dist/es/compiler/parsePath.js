/* with love from shopstory */
import { dotNotationGet } from '../utils/object/dotNotationGet.js';

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
function parsePath(path, form) {
  const values = form.values;
  const pathSplit = path === "" ? [] : stripRichTextPartSelection(path).split(".");
  let pathInfo = undefined;

  // We're going from current path down the path to find current template and parent template
  for (let i = pathSplit.length; i >= 0; i--) {
    const testedPath = pathSplit.slice(0, i).join(".");
    const value = dotNotationGet(values, testedPath);
    if (typeof value === "object" && typeof value._component === "string") {
      if (pathInfo === undefined) {
        pathInfo = {
          templateId: value._component
        };

        // fieldName
        const fieldPath = pathSplit.slice(i);
        if (fieldPath.length > 0) {
          pathInfo.fieldName = fieldPath.join(".");
        }
        const potentialIndex = parseInt(pathSplit[i - 1]);
        if (!isNaN(potentialIndex)) {
          pathInfo.index = potentialIndex;
        }
      } else {
        pathInfo.parent = {
          templateId: value._component,
          fieldName: pathSplit[i],
          path: testedPath
        };
        break;
      }
    }
  }
  if (!pathInfo) {
    throw new Error(`incorrect path: ${path}`);
  }
  return pathInfo;
}
function findPathOfFirstAncestorOfType(path, templateId, form) {
  while (true) {
    const parseResult = parsePath(path, form);
    if (!parseResult.parent) {
      throw new Error(`couldn't find ancestor of type ${templateId}`);
    }
    if (parseResult.parent.templateId === templateId) {
      return parseResult.parent.path;
    }
    path = parseResult.parent.path;
  }
}

export { findPathOfFirstAncestorOfType, parsePath, stripRichTextPartSelection };
//# sourceMappingURL=parsePath.js.map
