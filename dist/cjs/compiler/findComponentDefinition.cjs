/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utils = require('@easyblocks/utils');

function allDefs(context) {
  return context?.definitions.components || [];
}

/**
 * Versions with context and custom components sweep
 */

function findComponentDefinition(config, context) {
  return $findComponentDefinition(config, context);
}
function findComponentDefinitionById(id, context) {
  return $findComponentDefinitionById(id, context);
}
function findComponentDefinitionsByType(tag, context) {
  return allDefs(context).filter(def => utils.toArray(def.type ?? []).includes(tag));
}

/**
 * Generic
 */

function $findComponentDefinition(config, context) {
  if (!config) {
    return undefined;
  }
  return $findComponentDefinitionById(config._component, context);
}
function $findComponentDefinitionById(id, context) {
  return allDefs(context).find(component => component.id === id);
}

exports.findComponentDefinition = findComponentDefinition;
exports.findComponentDefinitionById = findComponentDefinitionById;
exports.findComponentDefinitionsByType = findComponentDefinitionsByType;
