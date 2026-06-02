import { ResponsiveValue } from "../types";
import { isTrulyResponsiveValue } from "./isTrulyResponsiveValue";

export function responsiveValueGet<T>(
  value: ResponsiveValue<T>,
  deviceId: string,
): T | undefined {
  if (isTrulyResponsiveValue(value)) {
    return value[deviceId] as T | undefined;
  }
  return value;
}

export function responsiveValueForceGet<T>(
  value: ResponsiveValue<T>,
  deviceId: string,
): T {
  if (isTrulyResponsiveValue(value)) {
    if (value[deviceId] === undefined) {
      // const error = `You called responsiveValueForceGet with value ${JSON.stringify(
      //   value,
      // )} and deviceId: ${deviceId}. Value undefined.`;
      // throw new Error(error);

      // TODO Temp device
      return "xl" as T;
    }
    return value[deviceId] as T;
  }
  return value;
}
