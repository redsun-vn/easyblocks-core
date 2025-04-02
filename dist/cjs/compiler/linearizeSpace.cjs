/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var spacingToPx = require('../spacingToPx.cjs');
var applyAutoUsingResponsiveTokens = require('./applyAutoUsingResponsiveTokens.cjs');
var areWidthsFullyDefined = require('./areWidthsFullyDefined.cjs');
var devices = require('./devices.cjs');
var getDeviceWidthPairs = require('./getDeviceWidthPairs.cjs');
var responsiveValueGetDefinedValue = require('../responsiveness/responsiveValueGetDefinedValue.cjs');
var responsiveValueFill = require('../responsiveness/responsiveValueFill.cjs');
var isTrulyResponsiveValue = require('../responsiveness/isTrulyResponsiveValue.cjs');
var responsiveValueGet = require('../responsiveness/responsiveValueGet.cjs');

function linearizeSpace(input, compilationContext, widths) {
  let constant = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  if (!isTrulyResponsiveValue.isTrulyResponsiveValue(input)) {
    return input;
  }

  /**
   *
   * Important!
   *
   * Although linearizeSpace takes widths into account (it's obvious) we must still remember about responsive tokens.
   *
   * Responsive tokens will be quite rare (like a container margin or a font size).
   * But still we must remember that responsive tokens are defined relative to SCREEN WIDTH.
   * It means that even if our component has "width" that is not a screen width and is very irregular, then responsive tokens relative to screen width takes precedence!
   * So if our component has width 500px on XL and is wider on smaller breakpoint LG (800px), then if responsive token is bigger on XL than LG it will still hold.
   * It makes a total sense. If we broke this rule and somehow applied widths to responsive tokens, then user could see a font that she totally doesn't want for a specific breakpoint.
   * It usually won't hurt at all, because fonts and container margins are responsive by nature. Actually maybe other spacings shouldn't be possible to be responsive at all!
   * That's why first thing below is to fill undefined values with responsive tokens if possible and only then linearize the remaining ones (with widths taken into account).
   *
   */

  // If responsive value has some token that is responsive, then this token should be applied to all surrounding breakpoints.
  // Responsive token kind of "overrides auto".
  // If we want in the future auto for responsive tokens it's not the place for it. Linearizing tokens should happen in creating compilation context.
  const inputAfterResponsiveTokenAuto = applyAutoUsingResponsiveTokens.applyAutoUsingResponsiveTokens(input, compilationContext);
  const inputWithScalarNonRefValues = {
    $res: true
  };
  compilationContext.devices.forEach(device => {
    if (inputAfterResponsiveTokenAuto[device.id] === undefined) {
      return;
    }
    const refValue = responsiveValueGetDefinedValue.responsiveValueGetDefinedValue(inputAfterResponsiveTokenAuto, device.id, compilationContext.devices, devices.getDevicesWidths(compilationContext.devices));
    if (isTrulyResponsiveValue.isTrulyResponsiveValue(refValue.value)) {
      inputWithScalarNonRefValues[device.id] = spacingToPx.spacingToPx(responsiveValueGetDefinedValue.responsiveValueGetDefinedValue(refValue.value, device.id, compilationContext.devices, devices.getDevicesWidths(compilationContext.devices)), device.w);
    } else {
      inputWithScalarNonRefValues[device.id] = spacingToPx.spacingToPx(refValue.value, device.w);
    }
  });
  if (!areWidthsFullyDefined.areWidthsFullyDefined(widths, compilationContext.devices)) {
    return responsiveValueFill.responsiveValueFill(inputAfterResponsiveTokenAuto, compilationContext.devices, devices.getDevicesWidths(compilationContext.devices));
  }

  // Let's run linearize function
  const linearisedCompiledValues = linearizeSpaceWithoutNesting(inputWithScalarNonRefValues, compilationContext, widths, constant);
  compilationContext.devices.forEach(device => {
    if (inputAfterResponsiveTokenAuto[device.id] === undefined) {
      inputAfterResponsiveTokenAuto[device.id] = snapValueToToken(responsiveValueGet.responsiveValueForceGet(linearisedCompiledValues, device.id), responsiveValueGetDefinedValue.responsiveValueGetFirstLowerValue(inputWithScalarNonRefValues, device.id, compilationContext.devices, devices.getDevicesWidths(compilationContext.devices)), responsiveValueGetDefinedValue.responsiveValueGetFirstHigherValue(inputWithScalarNonRefValues, device.id, compilationContext.devices, devices.getDevicesWidths(compilationContext.devices)), compilationContext.theme.space, constant);
    }
  });
  return inputAfterResponsiveTokenAuto;
}
function snapValueToToken(value, lowerDefinedValue, higherDefinedValue, spaces, constant) {
  let currentToken = undefined;
  let minDelta = Number.MAX_VALUE;
  for (const tokenId in spaces) {
    const tokenValue = spaces[tokenId].value;
    if (isTrulyResponsiveValue.isTrulyResponsiveValue(tokenValue)) {
      // only non-responsive
      continue;
    }
    const parsedValue = spacingToPx.parseSpacing(tokenValue);
    if (parsedValue.unit === "vw") {
      continue;
    }
    const tokenPxValue = parsedValue.value;

    // If value smaller than constant then the only possible token is the token equaling the value
    if (value <= constant && tokenPxValue !== value) {
      continue;
    }

    // token value must be within higher and lower limits
    if (higherDefinedValue !== undefined) {
      if (tokenPxValue > higherDefinedValue) {
        continue;
      }
    }
    if (lowerDefinedValue !== undefined) {
      if (tokenPxValue < lowerDefinedValue) {
        continue;
      }
    }
    if (tokenId.split(".").length > 1) {
      // only non-prefixed
      continue;
    }

    // snapped token can never be bigger than our constant
    if (tokenPxValue < constant) {
      continue;
    }
    const delta = Math.abs(value - tokenPxValue);
    if (delta < minDelta || (/* in case of equal deltas, let's take bigger token */currentToken && delta === minDelta && tokenValue > currentToken.value)) {
      minDelta = delta;
      currentToken = {
        tokenId,
        value: tokenValue,
        widgetId: "@easyblocks/space"
      };
    }
  }
  if (!currentToken) {
    return {
      value: `${value}px`
    };
  }
  return currentToken;
}
function linearizeSpaceWithoutNesting(input, compilationContext, widths) {
  let constant = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  if (!isTrulyResponsiveValue.isTrulyResponsiveValue(input)) {
    return input;
  }

  // // If only 1 value is defined (2 keys, $res and value), then we return
  // if (Object.keys(input).length === 2) {
  //   return responsiveValueFill(input, compilationContext.devices);
  // }

  // Empty object returns 0
  if (Object.keys(input).length === 0) {
    console.warn("linearize Space - empty object input, that shouldn't happen, fallback to 0");
    return 0;
  }

  // For now we just use arrays (from previous implementation). Later they're mapped back to object
  const value = [];
  const referencePoints = [];
  const componentWidths = getDeviceWidthPairs.getDeviceWidthPairs(widths, compilationContext.devices);
  componentWidths.forEach((componentWidth, index) => {
    const breakpointValue = input[componentWidth.deviceId];
    value[index] = breakpointValue;
    if (breakpointValue === null || breakpointValue === undefined) {
      value[index] = null; // null padding and normalization

      let leftIndex;
      let rightIndex;

      // Let's find closest left index
      for (let i = index - 1; i >= 0; i--) {
        const val = input[componentWidths[i].deviceId];
        if (val !== undefined) {
          leftIndex = i;
          break;
        }
      }

      // Let's find closest right index
      for (let i = index + 1; i < componentWidths.length; i++) {
        const val = input[componentWidths[i].deviceId];
        if (val !== undefined) {
          rightIndex = i;
          break;
        }
      }
      if (leftIndex === undefined && rightIndex === undefined) {
        throw new Error("unreachable");
      }
      referencePoints[index] = {
        leftIndex,
        rightIndex
      };
      return;
    }
  });
  referencePoints.forEach((refPoint, index) => {
    if (!refPoint) {
      return;
    }
    const currentX = componentWidths[index].width;

    // Single point linearity
    if (refPoint.leftIndex !== undefined && refPoint.rightIndex === undefined || refPoint.leftIndex === undefined && refPoint.rightIndex !== undefined) {
      const currentRefPoint = refPoint.leftIndex ?? refPoint.rightIndex;
      const refY = value[currentRefPoint];
      const refX = componentWidths[currentRefPoint].width;
      const deltaY = refY - constant;
      if (deltaY <= 0) {
        value[index] = refY;
      } else {
        const a = (refY - constant) / refX;
        value[index] = a * currentX + constant;
      }
    } else if (refPoint.leftIndex !== undefined && refPoint.rightIndex !== undefined) {
      const p1_x = componentWidths[refPoint.leftIndex].width;
      const p1_y = value[refPoint.leftIndex];

      // default a, b (enabled when only p1 is defined)
      let a = 0,
        b = p1_y;
      const p2_x = componentWidths[refPoint.rightIndex].width;
      const p2_y = value[refPoint.rightIndex];
      const deltaX = p1_x - p2_x;
      if (deltaX === 0) {
        // if delta 0 then we take lower for left and higher for right
        value[index] = index < refPoint.leftIndex ? p1_y : p2_y;
      } else {
        a = (p1_y - p2_y) / deltaX;
        b = p2_y - a * p2_x;
        if (a >= 0) {
          // take into account 0 values!!!
          if (p1_y === 0 || p2_y === 0) {
            if (index < refPoint.leftIndex) {
              a = 0;
              b = p1_y;
            } else {
              a = 0;
              b = p2_y;
            }
          }
          value[index] = currentX * a + b;
        } else {
          // We don't linearize descending functions!
          value[index] = index < refPoint.leftIndex ? p1_y : p2_y;
        }
      }
    } else {
      throw new Error("unreachable");
    }
  });
  const output = {
    $res: true
  };
  value.forEach((scalarVal, index) => {
    if (scalarVal === undefined || scalarVal === null) {
      return;
    }
    output[componentWidths[index].deviceId] = scalarVal;
  });
  return output;
}

exports.linearizeSpace = linearizeSpace;
