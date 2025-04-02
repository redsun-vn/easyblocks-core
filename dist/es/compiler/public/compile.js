/* with love from shopstory */
import { mergeCompilationMeta } from '../mergeCompilationMeta.js';
import { compileInternal } from '../compileInternal.js';
import { createCompilationContext } from '../createCompilationContext.js';
import { normalizeInput } from '../normalizeInput.js';

const compile = (content, config, contextParams) => {
  let resultMeta = {
    // @ts-expect-error We can leave `devices` and `locale` undefined because these values are set in `compileInternal`.
    vars: {},
    code: {}
  };
  const compilationContext = createCompilationContext(config, contextParams, content._component);
  const inputConfigComponent = normalizeInput(content);
  const {
    meta,
    compiled,
    configAfterAuto
  } = compileInternal(inputConfigComponent, compilationContext);
  resultMeta = mergeCompilationMeta(resultMeta, meta);
  return {
    compiled,
    configAfterAuto,
    meta: resultMeta
  };
};

export { compile };
