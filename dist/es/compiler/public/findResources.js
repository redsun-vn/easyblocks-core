/* with love from shopstory */
import { isLocalTextReference, getExternalReferenceLocationKey } from '../../resourcesUtils.js';
import { configTraverse } from '../configTraverse.js';
import { createCompilationContext } from '../createCompilationContext.js';
import { normalize } from '../normalize.js';
import { normalizeInput } from '../normalizeInput.js';
import { isExternalSchemaProp } from '../schema/index.js';
import { responsiveValueEntries } from '../../responsiveness/responsiveValueEntries.js';
import { isTrulyResponsiveValue } from '../../responsiveness/isTrulyResponsiveValue.js';

const findExternals = (input, config, contextParams) => {
  const inputConfigComponent = normalizeInput(input);
  const externalsWithSchemaProps = [];
  const compilationContext = createCompilationContext(config, contextParams, input._component);
  const normalizedConfig = normalize(inputConfigComponent, compilationContext);
  configTraverse(normalizedConfig, compilationContext, _ref => {
    let {
      config,
      value,
      schemaProp
    } = _ref;
    // This kinda tricky, because "text" is a special case. It can be either local or external.
    // To prevent false positives, we need to check if it's local text reference and make sure that we won't
    // treat "text" that's actually external as non external.
    if (schemaProp.type === "text" && isLocalTextReference(value, "text") || schemaProp.type !== "text" && !isExternalSchemaProp(schemaProp, compilationContext.types)) {
      return;
    }
    const hasInputComponentRootParams = compilationContext.definitions.components.some(c => c.id === normalizedConfig._component && c.rootParams !== undefined);
    const configId = normalizedConfig._id === config._id && hasInputComponentRootParams ? "$" : config._id;
    if (isTrulyResponsiveValue(value)) {
      responsiveValueEntries(value).forEach(_ref2 => {
        let [breakpoint, currentValue] = _ref2;
        if (currentValue === undefined) {
          return;
        }
        externalsWithSchemaProps.push({
          id: getExternalReferenceLocationKey(configId, schemaProp.prop, breakpoint),
          schemaProp: schemaProp,
          externalReference: currentValue
        });
      });
    } else {
      externalsWithSchemaProps.push({
        id: getExternalReferenceLocationKey(configId, schemaProp.prop),
        schemaProp: schemaProp,
        externalReference: value
      });
    }
  });
  return externalsWithSchemaProps;
};

export { findExternals };
