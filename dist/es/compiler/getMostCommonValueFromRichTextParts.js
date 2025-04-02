/* with love from shopstory */
import { entries } from '@easyblocks/utils';
import { getFallbackForLocale } from '../locales.js';
import { richTextPartEditableComponent } from './builtins/_richText/_richTextPart/_richTextPart.js';
import { compileComponentValues } from './compileComponentValues.js';
import { findComponentDefinitionById } from './findComponentDefinition.js';

/**
 * Returns the most common value for given `prop` parameter among all @easyblocks/rich-text-part components from `richTextComponentConfig`.
 */
function getMostCommonValueFromRichTextParts(richTextComponentConfig, prop, compilationContext, cache) {
  const richTextBlockElements = richTextComponentConfig.elements[compilationContext.contextParams.locale] ?? getFallbackForLocale(richTextComponentConfig.elements, compilationContext.contextParams.locale, compilationContext.locales);
  if (!richTextBlockElements) {
    return;
  }
  const richTextParts = richTextBlockElements.flatMap(blockElement => {
    return blockElement.elements.flatMap(lineElement => {
      return lineElement.elements;
    });
  });
  const richTextPartComponentDefinition = findComponentDefinitionById(richTextPartEditableComponent.id, compilationContext);
  const deviceIdToRichTextPartValuesGroupedByPropValue = Object.fromEntries(compilationContext.devices.map(device => {
    const richTextPartsCompiledPropValues = richTextParts.flatMap(richTextPart => {
      return mapRichTextPartToCompiledPropValue(richTextPart, richTextPartComponentDefinition, compilationContext, prop, cache);
    });
    const richTextPartValuesLengthGroupedByPropValue = richTextPartsCompiledPropValues.reduce((acc, current) => groupTotalValueLengthByCompiledPropValue(prop, device)(acc, current), {});
    return [device.id, richTextPartValuesLengthGroupedByPropValue];
  }).filter(entry => Object.keys(entry[1]).length > 0).map(entry => {
    return [entry[0], getCompiledValueFromEntryWithMaxTotalValueLength(entry)];
  }));
  if (Object.keys(deviceIdToRichTextPartValuesGroupedByPropValue).length === 0) {
    return;
  }
  return {
    $res: true,
    ...deviceIdToRichTextPartValuesGroupedByPropValue
  };
}
function getCompiledValueFromEntryWithMaxTotalValueLength(entry) {
  const compiledPropValue = entries(entry[1]).reduce((maxEntry, currentEntry) => currentEntry[1] > maxEntry[1] ? currentEntry : maxEntry)[0];
  try {
    return JSON.parse(compiledPropValue);
  } catch {
    return compiledPropValue;
  }
}
function groupTotalValueLengthByCompiledPropValue(prop, device) {
  return (acc, current) => {
    const key = JSON.stringify(current[prop][device.id]);
    if (key === undefined) {
      return acc;
    }
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += current.value.length;
    return acc;
  };
}
function mapRichTextPartToCompiledPropValue(richTextPart, richTextPartComponentDefinition, compilationContext, prop, cache) {
  const compiledValues = compileComponentValues(richTextPart, richTextPartComponentDefinition, compilationContext, cache);
  return {
    value: richTextPart.value,
    [prop]: compiledValues[prop]
  };
}

export { getMostCommonValueFromRichTextParts };
