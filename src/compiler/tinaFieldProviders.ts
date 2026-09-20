import { assertDefined } from "@/utils";
import {
  AnyTinaField,
  BooleanSchemaProp,
  ComponentCollectionLocalisedSchemaProp,
  ComponentCollectionSchemaProp,
  ComponentSchemaProp,
  ExternalSchemaProp,
  LocalSchemaProp,
  LocalTextReference,
  NoCodeComponentEntry,
  NumberSchemaProp,
  PositionSchemaProp,
  RadioGroupSchemaProp,
  SchemaProp,
  SelectSchemaProp,
  StringSchemaProp,
  TextSchemaProp,
  TokenSchemaProp,
} from "../types";
import { EditorContextType } from "./types";

function getCommonFieldProps(
  schemaProp: SchemaProp
): Pick<
  AnyTinaField,
  | "label"
  | "name"
  | "group"
  | "schemaProp"
  | "description"
  | "isLabelHidden"
  | "layout"
  | "params"
> {
  const label = schemaProp.label || schemaProp.prop;
  const group = schemaProp.group || "Properties";

  return {
    label,
    name: schemaProp.prop,
    group,
    schemaProp,
    description: schemaProp.description,
    isLabelHidden: schemaProp.isLabelHidden,
    layout: schemaProp.layout,
    params: "params" in schemaProp ? schemaProp.params : undefined,
  };
}

type FieldProvider<
  S extends Exclude<
    SchemaProp,
    | ComponentSchemaProp
    | ComponentCollectionSchemaProp
    | ComponentCollectionLocalisedSchemaProp
  >,
  Value = Exclude<S["defaultValue"], undefined>
> = (
  schemaProp: S,
  editorContext: EditorContextType,
  value: Value
) => AnyTinaField;

type TinaFieldProviders = {
  text: FieldProvider<TextSchemaProp>;
  string: FieldProvider<StringSchemaProp>;
  number: FieldProvider<NumberSchemaProp>;
  boolean: FieldProvider<BooleanSchemaProp>;
  select: FieldProvider<SelectSchemaProp>;
  "radio-group": FieldProvider<RadioGroupSchemaProp>;
  component: FieldProvider<ComponentSchemaProp, [] | [NoCodeComponentEntry]>;
  "component-collection": FieldProvider<
    ComponentCollectionSchemaProp,
    Array<NoCodeComponentEntry>
  >;
  "component-collection-localised": FieldProvider<ComponentCollectionLocalisedSchemaProp>;
  component$$$: FieldProvider<ComponentSchemaProp>;
  external: FieldProvider<ExternalSchemaProp>;
  custom: FieldProvider<ExternalSchemaProp | LocalSchemaProp | TokenSchemaProp>;
  position: FieldProvider<PositionSchemaProp>;
};

const tinaFieldProviders: TinaFieldProviders = {
  text: (schemaProp, _, value) => {
    if (!isValueLocalTextReference(value) && typeof value !== "string") {
      return {
        ...getCommonFieldProps(schemaProp),
        component: "external",
      };
    }

    return {
      ...getCommonFieldProps(schemaProp),
      component: "text",
      name: schemaProp.prop,
      normalize: schemaProp.normalize,
    };
  },
  number: (schemaProp) => {
    return {
      ...getCommonFieldProps(schemaProp),
      component: "number",
      step: 1,
      min: schemaProp.params?.min,
      max: schemaProp.params?.max,
    };
  },
  string: (schemaProp) => {
    if (schemaProp.responsive) {
      return {
        ...getCommonFieldProps(schemaProp),
        component: "responsive2",
        subComponent: "text",
        normalize: schemaProp.params?.normalize,
      };
    }

    return {
      ...getCommonFieldProps(schemaProp),
      component: "text",
      normalize: schemaProp.params?.normalize,
    };
  },
  boolean: (schemaProp) => {
    if (schemaProp.responsive) {
      return {
        ...getCommonFieldProps(schemaProp),
        component: "responsive2",
        subComponent: "toggle",
      };
    }

    return {
      ...getCommonFieldProps(schemaProp),
      component: "toggle",
    };
  },
  select: (schemaProp) => {
    if (schemaProp.responsive) {
      return {
        ...getCommonFieldProps(schemaProp),
        component: "responsive2",
        subComponent: "select",
        options: schemaProp.params.options,
      };
    }

    return {
      ...getCommonFieldProps(schemaProp),
      component: "select",
      options: schemaProp.params.options,
    };
  },
  "radio-group": (schemaProp) => {
    if (schemaProp.responsive) {
      return {
        ...getCommonFieldProps(schemaProp),
        component: "responsive2",
        subComponent: "radio-group",
        options: schemaProp.params.options,
      };
    }

    return {
      ...getCommonFieldProps(schemaProp),
      component: "radio-group",
      options: schemaProp.params.options,
    };
  },
  component: (schemaProp) => {
    return {
      ...getCommonFieldProps(schemaProp),
      component: "block",
      schemaProp,
    };
  },
  "component-collection": () => {
    throw new Error("component-collection is not yet supported in sidebar");
  },

  "component-collection-localised": () => {
    throw new Error(
      "component-collection-localised is not yet supported in sidebar"
    );
  },
  component$$$: (schemaProp) => {
    return {
      ...getCommonFieldProps(schemaProp),
      component: "identity",
      schemaProp,
    };
  },
  external: (schemaProp, editorContext) => {
    const externalTypeDefinition = editorContext.types[schemaProp.type] as
      | Extract<EditorContextType["types"][string], { type: "external" }>
      | undefined;

    if (!externalTypeDefinition) {
      throw new Error(`Can't find definition for type "${schemaProp.type}"`);
    }

    if (schemaProp.responsive) {
      return {
        ...getCommonFieldProps(schemaProp),
        component: "responsive2",
        subComponent: "external",
      };
    }

    return {
      ...getCommonFieldProps(schemaProp),
      component: "external",
    };
  },
  position: (schemaProp) => {
    return {
      ...getCommonFieldProps(schemaProp),
      component: "responsive2",
      subComponent: "position",
    };
  },
  custom: (schemaProp, editorContext, value) => {
    const customTypeDefinition = editorContext.types[schemaProp.type];

    if (!customTypeDefinition) {
      throw new Error(`Can't find definition for type "${schemaProp.type}"`);
    }

    if (customTypeDefinition.type === "external") {
      return tinaFieldProviders.external(schemaProp, editorContext, value);
    }

    if (customTypeDefinition.type === "token") {
      // An empty scale rather than a fatal one. `theme` is seeded only with the
      // token groups a shop's own config declares, so a page holding a block
      // whose field uses `boxShadow` or `aspectRatio` — groups nothing seeds —
      // used to empty the editor. Which fields get built depends on which
      // blocks are on the page, so the trigger is the document.
      //
      // With no scale the field offers no presets and still takes a typed
      // value, which is the field a shop that has not defined that scale
      // should have had all along.
      let tokens = editorContext.theme[customTypeDefinition.token];

      if (!tokens) {
        console.warn(
          `easyblocks: this config defines no "${customTypeDefinition.token}" tokens, so the field offers no presets`
        );

        tokens = {};
      }

      if (
        "params" in schemaProp &&
        schemaProp.params &&
        "prefix" in schemaProp.params &&
        typeof schemaProp.params.prefix === "string"
      ) {
        // Copy tokens to prevent mutating original tokens
        tokens = { ...tokens };

        for (const key in tokens) {
          if (!key.startsWith(schemaProp.params.prefix + ".")) {
            delete tokens[key];
          } else {
            tokens[key] = {
              ...tokens[key],
              label: key.split(`${schemaProp.params.prefix}.`)[1],
            };
          }
        }
      }

      const commonTokenFieldProps = {
        tokens,
        allowCustom: !!customTypeDefinition.allowCustom,
        extraValues:
          "params" in schemaProp &&
            schemaProp.params &&
            "extraValues" in schemaProp.params
            ? schemaProp.params.extraValues
            : undefined,
      };

      if (customTypeDefinition.responsiveness === "never") {
        return {
          ...getCommonFieldProps(schemaProp),
          component: "token",
          ...commonTokenFieldProps,
        };
      }

      return {
        ...getCommonFieldProps(schemaProp),
        // Token fields are always responsive
        component: "responsive2",
        subComponent: "token",
        ...commonTokenFieldProps,
      };
    }

    return {
      ...getCommonFieldProps(schemaProp),
      ...(customTypeDefinition.responsiveness === "always" ||
        (customTypeDefinition.responsiveness === "optional" &&
          schemaProp.responsive)
        ? {
          component: "responsive2",
          subComponent: "local",
        }
        : {
          component: "local",
        }),
    };
  },
};

export function getTinaField<T extends SchemaProp>(
  schemaProp: T,
  editorContext: EditorContextType,
  value: any
) {
  const fieldProvider =
    editorContext.types[schemaProp.type] && schemaProp.type !== "text"
      ? tinaFieldProviders.custom
      : (tinaFieldProviders as any)[schemaProp.type];

  if (typeof fieldProvider !== "function") {
    // Unknown type: give the sidebar a plain text control rather than throwing.
    // A throw here happens while the panel for the selected block is being
    // built, so one unregistered type left the editor with no panel at all and
    // nothing on screen to explain why.
    console.warn(
      `easyblocks: no editor field for schema prop "${schemaProp.prop}" of unknown type "${schemaProp.type}"; showing a plain field`,
    );

    return {
      ...getCommonFieldProps(schemaProp),
      component: "text",
    };
  }

  return fieldProvider(schemaProp, editorContext, value);
}

function isValueLocalTextReference(
  value: unknown
): value is LocalTextReference {
  if (!(typeof value === "object" && value !== null)) {
    return false;
  }

  if (
    !(
      "id" in value &&
      typeof (value as { id: unknown }).id === "string" &&
      (value as { id: string }).id.startsWith("local.")
    )
  ) {
    return false;
  }

  if (!("value" in value)) {
    return false;
  }

  if (
    !(
      "widgetId" in value &&
      typeof (value as { widgetId: unknown }).widgetId === "string" &&
      (value as { widgetId: string }).widgetId === "@easyblocks/local-text"
    )
  ) {
    return false;
  }

  return true;
}
