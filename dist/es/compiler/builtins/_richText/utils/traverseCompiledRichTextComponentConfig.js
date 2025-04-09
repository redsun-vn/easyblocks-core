/* with love from shopstory */
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

export { traverseCompiledRichTextComponentConfig };
//# sourceMappingURL=traverseCompiledRichTextComponentConfig.js.map
