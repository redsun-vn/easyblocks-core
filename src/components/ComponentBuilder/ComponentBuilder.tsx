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
  isLocalTextReference,
  resolveExternalValue,
} from "../../resourcesUtils";
import {
  isTrulyResponsiveValue,
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
  ExternalData,
  ExternalReference,
  ExternalSchemaProp,
  LocalReference,
  LocalTextReference,
  NoCodeComponentProps,
  ResponsiveValue,
  SchemaProp,
} from "../../types";
import { Box } from "../Box/Box";
import { useEasyblocksExternalData } from "../EasyblocksExternalDataProvider";
import { useEasyblocksMetadata } from "../EasyblocksMetadataProvider";
import { progressiveElements } from "../ProgressiveList";

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

/**
 * Cached lookup: for a given definitions object, reuse the same wrapper
 * so findComponentDefinitionById's internal WeakMap hits every time.
 */
const _defContextCache = new WeakMap<
  CompilationMetadata["vars"]["definitions"],
  { definitions: CompilationMetadata["vars"]["definitions"] }
>();

function getDefinitionsContext(
  definitions: CompilationMetadata["vars"]["definitions"],
) {
  let ctx = _defContextCache.get(definitions);
  if (!ctx) {
    ctx = { definitions };
    _defContextCache.set(definitions, ctx);
  }
  return ctx;
}

/**
 * Cache which schema props are component/component-collection slots.
 * Avoids re-filtering the full schema array on every render.
 */
const _componentSlotsCache = new WeakMap<SchemaProp[], SchemaProp[]>();

function getComponentSlots(schema: SchemaProp[]): SchemaProp[] {
  let slots = _componentSlotsCache.get(schema);
  if (!slots) {
    slots = schema.filter(isSchemaPropComponentOrComponentCollection);
    _componentSlotsCache.set(schema, slots);
  }
  return slots;
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
          key={(compiledChild as CompiledComponentConfig)._id}
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
        key={(compiledChild as CompiledComponentConfig)._id}
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
        key="placeholder"
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
  }

  // For collections: render progressively when there are many children.
  // In editing mode, render all at once (editor needs all items visible immediately).
  // if (!isEditing && elements.length > 3) {
  //   return progressiveElements(
  //     elements.map((el, i) =>
  //       React.isValidElement(el) ? el : <Fragment key={i}>{el}</Fragment>,
  //     ),
  //     3,
  //     2,
  //   );
  // }

  return elements;
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

  // Reuse a stable wrapper so findComponentDefinitionById's WeakMap cache hits.
  const defContext = getDefinitionsContext(meta.vars.definitions);
  const componentDefinition = findComponentDefinitionById(
    compiled._component,
    defContext,
  )!;

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

  // Use cached slot list instead of filtering every schema prop on each render.
  const componentSlots = getComponentSlots(componentDefinition.schema);

  // Build subcomponents into a new styled object (must include both boxes and subcomponents).
  const styled: { [key: string]: any } = { ...styledBoxes };

  for (let i = 0; i < componentSlots.length; i++) {
    const schemaProp = componentSlots[i] as
      | ComponentSchemaProp
      | ComponentCollectionSchemaProp
      | ComponentCollectionLocalisedSchemaProp;

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
