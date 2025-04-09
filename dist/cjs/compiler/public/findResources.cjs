/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var resourcesUtils = require('../../resourcesUtils.cjs');
var configTraverse = require('../configTraverse.cjs');
var createCompilationContext = require('../createCompilationContext.cjs');
var normalize = require('../normalize.cjs');
var normalizeInput = require('../normalizeInput.cjs');
var index = require('../schema/index.cjs');
var responsiveValueEntries = require('../../responsiveness/responsiveValueEntries.cjs');
var isTrulyResponsiveValue = require('../../responsiveness/isTrulyResponsiveValue.cjs');

const findExternals = (input, config, contextParams) => {
  const inputConfigComponent = normalizeInput.normalizeInput(input);
  const externalsWithSchemaProps = [];
  const compilationContext = createCompilationContext.createCompilationContext(config, contextParams, input._component);
  const normalizedConfig = normalize.normalize(inputConfigComponent, compilationContext);
  configTraverse.configTraverse(normalizedConfig, compilationContext, _ref => {
    let {
      config,
      value,
      schemaProp
    } = _ref;
    // This kinda tricky, because "text" is a special case. It can be either local or external.
    // To prevent false positives, we need to check if it's local text reference and make sure that we won't
    // treat "text" that's actually external as non external.
    if (schemaProp.type === "text" && resourcesUtils.isLocalTextReference(value, "text") || schemaProp.type !== "text" && !index.isExternalSchemaProp(schemaProp, compilationContext.types)) {
      return;
    }
    const hasInputComponentRootParams = compilationContext.definitions.components.some(c => c.id === normalizedConfig._component && c.rootParams !== undefined);
    const configId = normalizedConfig._id === config._id && hasInputComponentRootParams ? "$" : config._id;
    if (isTrulyResponsiveValue.isTrulyResponsiveValue(value)) {
      responsiveValueEntries.responsiveValueEntries(value).forEach(_ref2 => {
        let [breakpoint, currentValue] = _ref2;
        if (currentValue === undefined) {
          return;
        }
        externalsWithSchemaProps.push({
          id: resourcesUtils.getExternalReferenceLocationKey(configId, schemaProp.prop, breakpoint),
          schemaProp: schemaProp,
          externalReference: currentValue
        });
      });
    } else {
      externalsWithSchemaProps.push({
        id: resourcesUtils.getExternalReferenceLocationKey(configId, schemaProp.prop),
        schemaProp: schemaProp,
        externalReference: value
      });
    }
  });
  return externalsWithSchemaProps;
};

exports.findExternals = findExternals;
//# sourceMappingURL=findResources.cjs.map
