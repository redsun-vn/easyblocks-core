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
function isExternalSchemaProp(schemaProp, types) {
  return types[schemaProp.type] && types[schemaProp.type].type === "external";
}

export { isExternalSchemaProp, isSchemaPropActionTextModifier, isSchemaPropCollection, isSchemaPropComponent, isSchemaPropComponentCollectionLocalised, isSchemaPropComponentOrComponentCollection, isSchemaPropTextModifier };
//# sourceMappingURL=index.js.map
