/* with love from shopstory */
import { traverseCompiledRichTextComponentConfig } from './traverseCompiledRichTextComponentConfig.js';

function extractElementsFromCompiledComponents(compiledRichText) {
  const extractedCompiledElementComponents = [];
  traverseCompiledRichTextComponentConfig(compiledRichText, compiledConfig => {
    if (compiledConfig._component === "@easyblocks/rich-text-block-element" || compiledConfig._component === "@easyblocks/rich-text-line-element") {
      extractedCompiledElementComponents.push(compiledConfig);
    }
  });
  return extractedCompiledElementComponents;
}

export { extractElementsFromCompiledComponents };
//# sourceMappingURL=extractElementsFromCompiledComponents.js.map
