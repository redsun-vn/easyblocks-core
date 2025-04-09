/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var traverseCompiledRichTextComponentConfig = require('./traverseCompiledRichTextComponentConfig.cjs');

function extractElementsFromCompiledComponents(compiledRichText) {
  const extractedCompiledElementComponents = [];
  traverseCompiledRichTextComponentConfig.traverseCompiledRichTextComponentConfig(compiledRichText, compiledConfig => {
    if (compiledConfig._component === "@easyblocks/rich-text-block-element" || compiledConfig._component === "@easyblocks/rich-text-line-element") {
      extractedCompiledElementComponents.push(compiledConfig);
    }
  });
  return extractedCompiledElementComponents;
}

exports.extractElementsFromCompiledComponents = extractElementsFromCompiledComponents;
//# sourceMappingURL=extractElementsFromCompiledComponents.cjs.map
