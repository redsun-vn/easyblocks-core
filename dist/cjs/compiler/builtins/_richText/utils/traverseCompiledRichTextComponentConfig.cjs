/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function traverseCompiledRichTextComponentConfig(config, callback) {
  config.elements.forEach(reactElement => {
    callback(reactElement.props.compiled);
    reactElement.props.compiled.components.elements.forEach(compiledLineElement => {
      callback(compiledLineElement);
      compiledLineElement.components.elements.forEach(compiledTextPart => {
        callback(compiledTextPart);
      });
    });
  });
}

exports.traverseCompiledRichTextComponentConfig = traverseCompiledRichTextComponentConfig;
