/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var traverseCompiledRichTextComponentConfig = require('./traverseCompiledRichTextComponentConfig.cjs');

function extractTextPartsFromCompiledComponents(compiledRichText) {
  const extractedTextPartComponents = [];
  traverseCompiledRichTextComponentConfig.traverseCompiledRichTextComponentConfig(compiledRichText, compiledConfig => {
    if (compiledConfig._component === "@easyblocks/rich-text-part") {
      extractedTextPartComponents.push(compiledConfig);
    }
  });
  return extractedTextPartComponents;
}

exports.extractTextPartsFromCompiledComponents = extractTextPartsFromCompiledComponents;
