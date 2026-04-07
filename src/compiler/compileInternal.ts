import {
  CompilationMetadata,
  CompiledShopstoryComponentConfig,
  ExternalSchemaProp,
  ExternalReference,
  ExternalWithSchemaProp,
  NoCodeComponentDefinition,
  NoCodeComponentEntry,
} from "../types";
import { CompilationCache } from "./CompilationCache";
import { normalize } from "./normalize";
import { compileComponent } from "./compileComponent";
import { CompilationContextType, ContextProps } from "./types";
import { getDevicesWidths } from "./devices";
import { configTraverse } from "./configTraverse";
import { isExternalSchemaProp } from "./schema";
import {
  getExternalReferenceLocationKey,
  isLocalTextReference,
} from "../resourcesUtils";
import {
  isTrulyResponsiveValue,
  responsiveValueEntries,
} from "../responsiveness";

type CompileInternalReturnType = {
  compiled: CompiledShopstoryComponentConfig;
  meta: CompilationMetadata;
  configAfterAuto?: NoCodeComponentEntry;
  externals: Array<ExternalWithSchemaProp>;
};

export function compileInternal(
  configComponent: NoCodeComponentEntry,
  compilationContext: CompilationContextType,
  cache = new CompilationCache()
): CompileInternalReturnType {
  const normalizedConfig = normalize(configComponent, compilationContext);

  const meta: CompilationMetadata = {
    vars: {
      definitions: {
        links: [],
        actions: [],
        components: [],
        textModifiers: [],
      },
      devices: compilationContext.devices,
      locale: compilationContext.contextParams.locale,
    },
  };

  const contextProps: ContextProps = {
    $width: getDevicesWidths(compilationContext.devices),
    $widthAuto: {
      $res: true,
      ...Object.fromEntries(
        compilationContext.devices.map((d) => [d.id, false])
      ),
    },
  };

  const compilationArtifacts = compileComponent(
    normalizedConfig,
    compilationContext,
    contextProps,
    meta,
    cache
  );

  // Collect externals in the same traversal pass — avoids a second normalize+traverse
  const externals: Array<ExternalWithSchemaProp> = [];
  const hasInputComponentRootParams =
    compilationContext.definitions.components.some(
      (c: NoCodeComponentDefinition) =>
        c.id === normalizedConfig._component && c.rootParams !== undefined
    );

  configTraverse(
    normalizedConfig,
    compilationContext,
    ({ config, value, schemaProp }) => {
      if (
        (schemaProp.type === "text" && isLocalTextReference(value, "text")) ||
        (schemaProp.type !== "text" &&
          !isExternalSchemaProp(schemaProp, compilationContext.types))
      ) {
        return;
      }

      const configId =
        normalizedConfig._id === config._id && hasInputComponentRootParams
          ? "$"
          : config._id;

      if (isTrulyResponsiveValue(value)) {
        responsiveValueEntries(value).forEach(([breakpoint, currentValue]) => {
          if (currentValue === undefined) {
            return;
          }

          externals.push({
            id: getExternalReferenceLocationKey(
              configId,
              schemaProp.prop,
              breakpoint
            ),
            schemaProp: schemaProp as ExternalSchemaProp,
            externalReference: currentValue as ExternalReference,
          });
        });
      } else {
        externals.push({
          id: getExternalReferenceLocationKey(configId, schemaProp.prop),
          schemaProp: schemaProp as ExternalSchemaProp,
          externalReference: value as ExternalReference,
        });
      }
    }
  );

  const ret: CompileInternalReturnType = {
    compiled:
      compilationArtifacts.compiledComponentConfig as CompiledShopstoryComponentConfig,
    meta: {
      vars: meta.vars,
    },
    externals,
  };

  if (compilationContext.isEditing) {
    return {
      ...ret,
      configAfterAuto: compilationArtifacts.configAfterAuto,
    };
  }

  return ret;
}
