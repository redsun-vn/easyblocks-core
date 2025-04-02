/* with love from shopstory */
import { isEmptyRenderableContent } from './checkers.js';
import { responsiveValueMap } from './responsiveness/responsiveValueMap.js';

function getExternalValue(externalDataValue) {
  if ("error" in externalDataValue) {
    return;
  }
  return externalDataValue.value;
}
function isLocalTextReference(resource, type) {
  if (resource.id === null) {
    return false;
  }
  return type === "text" && resource.id.startsWith("local.");
}
function getExternalReferenceLocationKey(configId, fieldName, deviceId) {
  let resourceId = `${configId}.${fieldName}`;
  if (deviceId) {
    resourceId += `.${deviceId}`;
  }
  return resourceId;
}
function getResolvedExternalDataValue(externalData, configId, fieldName, value) {
  const externalReferenceLocationKey = typeof value.id === "string" && value.id.startsWith("$.") ? value.id : getExternalReferenceLocationKey(configId, fieldName);
  const externalValue = externalData[externalReferenceLocationKey];
  if (externalValue === undefined || "error" in externalValue) {
    return;
  }
  return externalValue;
}
function resolveExternalValue(responsiveResource, configId, schemaProp, externalData) {
  return responsiveValueMap(responsiveResource, (r, breakpointIndex) => {
    if (r.id) {
      // If resource field has `key` defined and its `id` starts with "$.", it means that it's a reference to the
      // root resource and we need to look for the resource with the same id as the root resource.
      const locationKey = r.key && typeof r.id === "string" && r.id.startsWith("$.") ? r.id : getExternalReferenceLocationKey(configId, schemaProp.prop, breakpointIndex);
      const externalDataValue = externalData[locationKey];
      let resourceValue;
      if (externalDataValue) {
        resourceValue = getExternalValue(externalDataValue);
      }
      if (externalDataValue === undefined || isEmptyRenderableContent(resourceValue)) {
        return;
      }
      if ("error" in externalDataValue) {
        return;
      }
      if (isCompoundExternalDataValue(externalDataValue)) {
        if (!r.key) {
          return;
        }
        const resolvedResourceValue = externalDataValue.value[r.key].value;
        if (!resolvedResourceValue) {
          return;
        }
        return resolvedResourceValue;
      }
      return resourceValue;
    }
    return;
  });
}
function isCompoundExternalDataValue(value) {
  return "type" in value && value.type === "object" && "value" in value || "error" in value;
}

export { getExternalReferenceLocationKey, getExternalValue, getResolvedExternalDataValue, isCompoundExternalDataValue, isLocalTextReference, resolveExternalValue };
