/* with love from shopstory */
import { duplicateConfig } from '../../../duplicateConfig.js';
import { parseFocusedRichTextPartConfigPath } from './parseRichTextPartConfigPath.js';
import { stripRichTextPartSelection } from './stripRichTextTextPartSelection.js';
import { dotNotationGet } from '../../../../utils/object/dotNotationGet.js';
import { dotNotationSet } from '../../../../utils/object/dotNotationSet.js';

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

export { getRichTextComponentConfigFragment };
