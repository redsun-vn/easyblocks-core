/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var mergeCompilationMeta = require('../mergeCompilationMeta.cjs');
var compileInternal = require('../compileInternal.cjs');
var createCompilationContext = require('../createCompilationContext.cjs');
var normalizeInput = require('../normalizeInput.cjs');

const compile = (content, config, contextParams) => {
  let resultMeta = {
    // @ts-expect-error We can leave `devices` and `locale` undefined because these values are set in `compileInternal`.
    vars: {},
    code: {}
  };
  const compilationContext = createCompilationContext.createCompilationContext(config, contextParams, content._component);
  const inputConfigComponent = normalizeInput.normalizeInput(content);
  const {
    meta,
    compiled,
    configAfterAuto
  } = compileInternal.compileInternal(inputConfigComponent, compilationContext);
  resultMeta = mergeCompilationMeta.mergeCompilationMeta(resultMeta, meta);
  return {
    compiled,
    configAfterAuto,
    meta: resultMeta
  };
};

exports.compile = compile;
