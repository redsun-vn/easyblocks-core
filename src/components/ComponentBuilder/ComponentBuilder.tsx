import React, { ComponentType, Fragment, ReactElement, useMemo } from "react";
import { findComponentDefinitionById } from "../../compiler/findComponentDefinition";
import {
  isSchemaPropComponent,
  isSchemaPropComponentOrComponentCollection,
} from "../../compiler/schema";
import {
  ContextProps,
  InternalComponentDefinition,
} from "../../compiler/types";
import {
  ComponentPickerClosedEvent,
  componentPickerOpened,
  itemInserted,
} from "../../events";
import {
  getResolvedExternalDataValue,
  isLocalTextReference,
  resolveExternalValue,
} from "../../resourcesUtils";
import {
  isTrulyResponsiveValue,
  responsiveValueGetDefinedValue,
  responsiveValueReduce,
  responsiveValueValues,
} from "../../responsiveness";
import { resop } from "../../responsiveness/resop";
import {
  CompilationMetadata,
  CompiledComponentConfig,
  CompiledLocalTextReference,
  CompiledShopstoryComponentConfig,
  ComponentCollectionLocalisedSchemaProp,
  ComponentCollectionSchemaProp,
  ComponentSchemaProp,
  Devices,
  ExternalData,
  ExternalReference,
  ExternalSchemaProp,
  LocalReference,
  LocalTextReference,
  NoCodeComponentProps,
  ResponsiveValue,
} from "../../types";
import { Box } from "../Box/Box";
import { useEasyblocksExternalData } from "../EasyblocksExternalDataProvider";
import { useEasyblocksMetadata } from "../EasyblocksMetadataProvider";

function buildBoxes(
  compiled: any,
  name: string,
  actionWrappers: { [key: string]: any },
  meta: any,
): any {
  if (Array.isArray(compiled)) {
    return compiled.map((x: any, index: number) =>
      buildBoxes(x, `${name}.${index}`, actionWrappers, meta),
    );
  } else if (typeof compiled === "object" && compiled !== null) {
    if (compiled.__isBox) {
      const boxProps = {
        __compiled: compiled,
        __name: name,
        devices: meta.vars.devices,
        stitches: meta.stitches,
      };

      return <Box {...boxProps} />;
    }

    const ret: Record<string, any> = {};

    for (const key in compiled) {
      ret[key] = buildBoxes(compiled[key], key, actionWrappers, meta);
    }
    return ret;
  }
  return compiled;
}

function getComponentDefinition(
  compiled: CompiledComponentConfig,
  runtimeContext: any,
) {
  return findComponentDefinitionById(compiled._component, runtimeContext);
}

function getCompiledSubcomponents(
  id: string,
  compiledArray: (CompiledComponentConfig | ReactElement)[],
  contextProps: ContextProps,
  schemaProp:
    | ComponentSchemaProp
    | ComponentCollectionSchemaProp
    | ComponentCollectionLocalisedSchemaProp,
  path: string,
  meta: CompilationMetadata,
  isEditing: boolean,
  components: ComponentBuilderProps["components"],
) {
  const originalPath = path;

  if (schemaProp.type === "component-collection-localised") {
    path = path + "." + meta.vars.locale;
  }

  if (schemaProp.noInline) {
    const elements = compiledArray.map((compiledChild, index) =>
      "_component" in compiledChild ? (
        <ComponentBuilder
          path={`${path}.${index}`}
          compiled={compiledChild}
          components={components}
        />
      ) : (
        compiledChild
      ),
    );

    if (isSchemaPropComponent(schemaProp)) {
      return elements[0];
    } else {
      return elements;
    }
  }

  const EditableComponentBuilder = isEditing
    ? components["EditableComponentBuilder.editor"]
    : components["EditableComponentBuilder.client"];

  let elements = compiledArray.map((compiledChild, index) =>
    "_component" in compiledChild ? (
      <EditableComponentBuilder
        compiled={compiledChild}
        index={index}
        length={compiledArray.length}
        path={`${path}.${index}`}
        components={components}
      />
    ) : (
      compiledChild
    ),
  );

  const Placeholder = components["Placeholder"];

  // TODO: this code should be editor-only
  if (
    isEditing &&
    Placeholder &&
    elements.length === 0 &&
    !contextProps.noInline &&
    // We don't want to show add button for this type
    schemaProp.type !== "component-collection-localised"
  ) {
    const type = getComponentMainType(schemaProp.accepts);

    elements = [
      <Placeholder
        id={id}
        path={path}
        type={type}
        appearance={(schemaProp as ComponentSchemaProp).placeholderAppearance}
        onClick={() => {
          function handleComponentPickerCloseMessage(
            event: ComponentPickerClosedEvent,
          ) {
            if (
              event.data.type === "@easyblocks-editor/component-picker-closed"
            ) {
              window.removeEventListener(
                "message",
                handleComponentPickerCloseMessage,
              );

              if (event.data.payload.config) {
                window.parent.postMessage(
                  itemInserted({
                    name: path,
                    index: 0,
                    block: event.data.payload.config,
                  }),
                );
              }
            }
          }

          window.addEventListener("message", handleComponentPickerCloseMessage);

          window.parent.postMessage(componentPickerOpened(originalPath));
        }}
        meta={meta}
      />,
    ];
  }

  if (isSchemaPropComponent(schemaProp)) {
    return elements[0] ?? <Fragment></Fragment>;
  } else {
    return elements;
  }
}
export type ComponentBuilderProps = {
  path: string;
  passedProps?: {
    [key: string]: any; // any extra props passed in components
  };
  compiled: CompiledComponentConfig;
  components: {
    "@easyblocks/missing-component": ComponentType<any>;
    "@easyblocks/rich-text.client": ComponentType<any>;
    "@easyblocks/rich-text-block-element": ComponentType<any>;
    "@easyblocks/rich-text-line-element": ComponentType<any>;
    "@easyblocks/rich-text-part": ComponentType<any>;
    "@easyblocks/text.client": ComponentType<any>;
    "EditableComponentBuilder.client": ComponentType<any>;
    [key: string]: ComponentType<any>;
  };
};

export type InternalNoCodeComponentProps = NoCodeComponentProps & {
  __easyblocks: {
    path: string;
    runtime: any;
  };
};

const ComponentBuilder = React.memo(function ComponentBuilder(
  props: ComponentBuilderProps,
): ReactElement | null {
  const { compiled, passedProps, path, components, ...restProps } = props;

  const allPassedProps: Record<string, any> = {
    ...passedProps,
    ...restProps,
  };

  const meta = useEasyblocksMetadata();
  const externalData = useEasyblocksExternalData();

  /**
   * Component is build in editing mode only if compiled.__editing is set.
   * This is the result of compilation.
   * The only case when compiled.__editing is set is when we're in Editor and for non-nested components.
   */
  const isEditing = compiled.__editing !== undefined;
  const pathSeparator = path === "" ? "" : ".";

  // Here we know we must render just component, without any wrappers
  const componentDefinition = getComponentDefinition(compiled, {
    definitions: meta.vars.definitions,
  })!;

  const component = getComponent(componentDefinition, components, isEditing);
  const isMissingComponent =
    compiled._component === "@easyblocks/missing-component";
  const isMissingInstance = component === undefined;
  const isMissing = isMissingComponent || isMissingInstance;
  const MissingComponent = components["@easyblocks/missing-component"];

  if (isMissing) {
    if (!isEditing) {
      return null;
    }

    if (isMissingComponent) {
      return <MissingComponent error={true}>Missing</MissingComponent>;
    } else {
      console.warn(`Missing "${compiled._component}"`);

      return (
        <MissingComponent component={componentDefinition} error={true}>
          Missing
        </MissingComponent>
      );
    }
  }

  const Component = component;

  const shopstoryCompiledConfig = compiled as CompiledShopstoryComponentConfig;

  // Memoize the runtime object — it only depends on meta which is stable per render tree.
  const runtime = useMemo(
    () => ({
      stitches: meta.stitches,
      resop: resop,
      devices: meta.vars.devices,
    }),
    [meta.stitches, meta.vars.devices],
  );

  // Memoize buildBoxes — only recompute when the compiled styled tree changes.
  const styledBoxes = useMemo(
    () => buildBoxes(shopstoryCompiledConfig.styled, "", {}, meta),
    [shopstoryCompiledConfig.styled, meta],
  );

  // Build subcomponents into a new styled object (must include both boxes and subcomponents).
  const styled: { [key: string]: any } = { ...styledBoxes };

  componentDefinition.schema.forEach((schemaProp) => {
    if (isSchemaPropComponentOrComponentCollection(schemaProp)) {
      const contextProps =
        shopstoryCompiledConfig.__editing?.components?.[schemaProp.prop] || {};

      const compiledChildren =
        shopstoryCompiledConfig.components[schemaProp.prop];

      styled[schemaProp.prop] = getCompiledSubcomponents(
        compiled._id,
        compiledChildren,
        contextProps,
        schemaProp,
        `${path}${pathSeparator}${schemaProp.prop}`,
        meta,
        isEditing,
        components,
      );
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { ref, __isSelected, ...restPassedProps } = allPassedProps || {};

  // Memoize the easyblocks prop — only changes when the component instance or selection changes.
  const easyblocksProp: InternalNoCodeComponentProps["__easyblocks"] = useMemo(
    () => ({
      id: shopstoryCompiledConfig._id,
      isEditing,
      path,
      runtime,
      isSelected: __isSelected,
    }),
    [shopstoryCompiledConfig._id, isEditing, path, runtime, __isSelected],
  );

  // Memoize external props — only changes when compiled props or external data changes.
  const externalProps = useMemo(
    () =>
      mapExternalProps(
        shopstoryCompiledConfig.props,
        shopstoryCompiledConfig._id,
        componentDefinition,
        externalData,
      ),
    [
      shopstoryCompiledConfig.props,
      shopstoryCompiledConfig._id,
      componentDefinition,
      externalData,
    ],
  );

  const componentProps = {
    ...restPassedProps,
    ...externalProps,
    ...styled,
    __easyblocks: easyblocksProp,
  };

  return <Component {...componentProps} />;
});

function getComponent(
  componentDefinition: InternalComponentDefinition,
  components: ComponentBuilderProps["components"],
  isEditing: boolean,
) {
  let component: any;

  // We first try to find editor version of that component
  if (isEditing) {
    component = components[componentDefinition.id + ".editor"];
  }

  // If it still missing, we try to find client version of that component
  if (!component) {
    component = components[componentDefinition.id + ".client"];
  }

  if (!component) {
    // In most cases we're going to pick component by its id
    component = components[componentDefinition.id];
  }

  return component;
}

/**
 * Lazily-built Map cache for O(1) schema prop lookup by prop name.
 * Keyed on the schema array reference — rebuilt only when the schema array changes.
 */
const _schemaMapCache = new WeakMap<
  InternalComponentDefinition["schema"],
  Map<string, InternalComponentDefinition["schema"][number]>
>();

function getSchemaPropMap(schema: InternalComponentDefinition["schema"]) {
  let map = _schemaMapCache.get(schema);
  if (!map) {
    map = new Map(schema.map((s) => [s.prop, s]));
    _schemaMapCache.set(schema, map);
  }
  return map;
}

function mapExternalProps(
  props: Record<string, unknown>,
  configId: string,
  componentDefinition: InternalComponentDefinition,
  externalData: ExternalData,
) {
  const resultsProps: Record<string, unknown> = {};
  const schemaMap = getSchemaPropMap(componentDefinition.schema);

  for (const propName in props) {
    const schemaProp = schemaMap.get(propName);

    if (schemaProp) {
      const propValue = props[propName] as ResponsiveValue<
        LocalReference | ExternalReference
      >;

      if (
        schemaProp.type === "text" &&
        isLocalTextReference(propValue as LocalTextReference, "text")
      ) {
        resultsProps[propName] = (
          propValue as unknown as CompiledLocalTextReference
        ).value;
      } else if (
        // FIXME: this is a mess
        (!isTrulyResponsiveValue(propValue) &&
          typeof propValue === "object" &&
          "id" in propValue &&
          "widgetId" in propValue &&
          !("value" in propValue)) ||
        (isTrulyResponsiveValue(propValue) &&
          responsiveValueValues(propValue).every(
            (v) =>
              typeof v === "object" &&
              v &&
              "id" in v &&
              "widgetId" in v &&
              !("value" in v),
          ))
      ) {
        resultsProps[propName] = resolveExternalValue(
          propValue,
          configId,
          schemaProp as ExternalSchemaProp,
          externalData,
        );
      } else {
        resultsProps[propName] = props[propName];
      }
    } else {
      resultsProps[propName] = props[propName];
    }
  }

  return resultsProps;
}

export { ComponentBuilder };

function getFieldStatus(
  externalReference: ResponsiveValue<ExternalReference>,
  externalData: ExternalData,
  configId: string,
  fieldName: string,
  devices: Devices,
) {
  return responsiveValueReduce(
    externalReference,
    (currentStatus, value: any, deviceId) => {
      if (!deviceId) {
        if (!value.id) {
          return {
            isLoading: false,
            renderable: false,
          };
        }

        const externalValue = getResolvedExternalDataValue(
          externalData,
          configId,
          fieldName,
          value,
        );

        return {
          isLoading: currentStatus.isLoading || externalValue === undefined,
          renderable:
            currentStatus.renderable &&
            externalValue !== undefined &&
            (externalValue.type === "object" ? value.key !== undefined : true),
        };
      }

      if (currentStatus.isLoading || !currentStatus.renderable) {
        return currentStatus;
      }

      const externalReferenceValue = responsiveValueGetDefinedValue(
        value,
        deviceId,
        devices,
      );

      if (!externalReferenceValue || externalReferenceValue.id === null) {
        return {
          isLoading: false,
          renderable: false,
        };
      }

      const externalValue = getResolvedExternalDataValue(
        externalData,
        configId,
        fieldName,
        externalReferenceValue,
      );

      return {
        isLoading: currentStatus.isLoading || externalValue === undefined,
        renderable:
          currentStatus.renderable &&
          externalValue !== undefined &&
          (externalValue.type === "object"
            ? externalReferenceValue.key !== undefined
            : true),
      };
    },
    { renderable: true, isLoading: false },
    devices,
  );
}

function getComponentMainType(componentTypes: string[]) {
  let type;

  if (
    componentTypes.includes("action") ||
    componentTypes.includes("actionLink")
  ) {
    type = "action";
  } else if (componentTypes.includes("card")) {
    type = "card";
  } else if (componentTypes.includes("symbol")) {
    type = "icon";
  } else if (componentTypes.includes("button")) {
    type = "button";
  } else if (
    componentTypes.includes("section") ||
    componentTypes.includes("token")
  ) {
    type = "section";
  } else if (componentTypes.includes("item")) {
    type = "item";
  } else if (
    componentTypes.includes("image") ||
    componentTypes.includes("$image")
  ) {
    type = "image";
  } else if (componentTypes.includes("actionTextModifier")) {
    type = "actionTextModifier";
  } else {
    type = "item";
  }

  return type;
}
