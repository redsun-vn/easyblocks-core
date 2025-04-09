/* with love from shopstory */
import { traverseCompiledRichTextComponentConfig } from './traverseCompiledRichTextComponentConfig.js';

function extractTextPartsFromCompiledComponents(compiledRichText) {
  const extractedTextPartComponents = [];
  traverseCompiledRichTextComponentConfig(compiledRichText, compiledConfig => {
    if (compiledConfig._component === "@easyblocks/rich-text-part") {
      extractedTextPartComponents.push(compiledConfig);
    }
  });
  return extractedTextPartComponents;
}

export { extractTextPartsFromCompiledComponents };
//# sourceMappingURL=extractTextPartsFromCompiledComponents.js.map
