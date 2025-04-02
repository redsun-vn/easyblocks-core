/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var duplicateConfig = require('../../../duplicateConfig.cjs');
var parseRichTextPartConfigPath = require('./parseRichTextPartConfigPath.cjs');
var stripRichTextTextPartSelection = require('./stripRichTextTextPartSelection.cjs');
var dotNotationGet = require('../../../../utils/object/dotNotationGet.cjs');
var dotNotationSet = require('../../../../utils/object/dotNotationSet.cjs');

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
    const textPartConfig = dotNotationGet.dotNotationGet(form.values, stripRichTextTextPartSelection.stripRichTextPartSelection(focusedField));
    const {
      path,
      range
    } = parseRichTextPartConfigPath.parseFocusedRichTextPartConfigPath(focusedField);
    const newTextPartConfig = duplicateConfig.duplicateConfig(textPartConfig, editorContext);
    if (range) {
      newTextPartConfig.value = textPartConfig.value.slice(...range);
    }
    let lastParentConfigPath = `elements.${contextParams.locale}`;
    path.slice(0, -1).forEach((pathIndex, index) => {
      let currentConfigPath = lastParentConfigPath;
      if (index === 0) {
        currentConfigPath += `.${pathIndex}`;
      } else {
        const parentConfig = dotNotationGet.dotNotationGet(newRichTextComponentConfig, lastParentConfigPath);
        currentConfigPath += `.elements.${Math.min(parentConfig.elements.length, pathIndex)}`;
      }
      const currentConfig = dotNotationGet.dotNotationGet(newRichTextComponentConfig, currentConfigPath);
      if (!currentConfig) {
        const sourceConfigPath = lastParentConfigPath + (index === 0 ? `.${pathIndex}` : `.elements.${pathIndex}`);
        const sourceConfig = dotNotationGet.dotNotationGet(sourceRichTextComponentConfig, sourceConfigPath);
        const configCopy = {
          ...sourceConfig,
          elements: []
        };
        dotNotationSet.dotNotationSet(newRichTextComponentConfig, currentConfigPath, configCopy);
      }
      lastParentConfigPath = currentConfigPath;
    });
    const textPartParentConfig = dotNotationGet.dotNotationGet(newRichTextComponentConfig, lastParentConfigPath);
    dotNotationSet.dotNotationSet(newRichTextComponentConfig, lastParentConfigPath, {
      ...textPartParentConfig,
      elements: [...textPartParentConfig.elements, newTextPartConfig]
    });
  });
  return newRichTextComponentConfig;
}

exports.getRichTextComponentConfigFragment = getRichTextComponentConfigFragment;
