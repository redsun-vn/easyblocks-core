/* with love from shopstory */
function isSchemaPropComponentCollectionLocalised(schemaProp) {
  return schemaProp.type === "component-collection-localised";
}
function isSchemaPropCollection(schemaProp) {
  return schemaProp.type === "component-collection" || schemaProp.type === "component-collection-localised";
}
function isSchemaPropComponent(schemaProp) {
  return schemaProp.type === "component";
}
function isSchemaPropComponentOrComponentCollection(schemaProp) {
  return isSchemaPropCollection(schemaProp) || isSchemaPropComponent(schemaProp);
}
function isSchemaPropActionTextModifier(schemaProp) {
  return schemaProp.type === "component" && schemaProp.accepts.includes("actionTextModifier");
}
function isSchemaPropTextModifier(schemaProp) {
  return schemaProp.type === "component" && schemaProp.accepts.includes("textModifier");
}
const internalTypes = new Set(["string", "number", "boolean", "select", "radio-group", "color", "space", "font", "icon", "text", "component", "component-collection", "position", "component$$$", "component-collection-localised", "aspectRatio", "containerWidth", "boxShadow"]);
function isCustomSchemaProp(schemaProp) {
  return !internalTypes.has(schemaProp.type);
}
function isExternalSchemaProp(schemaProp, types) {
  return types[schemaProp.type] && types[schemaProp.type].type === "external";
}
function textModifierSchemaProp(options) {
  return {
    type: "component",
    accepts: ["textModifier"],
    // Schema props of type "component" are hidden by default
    visible: true,
    ...options
  };
}

export { isCustomSchemaProp, isExternalSchemaProp, isSchemaPropActionTextModifier, isSchemaPropCollection, isSchemaPropComponent, isSchemaPropComponentCollectionLocalised, isSchemaPropComponentOrComponentCollection, isSchemaPropTextModifier, textModifierSchemaProp };
