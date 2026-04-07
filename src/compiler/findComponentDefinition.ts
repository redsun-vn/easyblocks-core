import { toArray } from "@/utils";
import { NoCodeComponentEntry } from "../types";
import {
  InternalComponentDefinition,
  InternalComponentDefinitions,
} from "./types";

type AnyContextWithDefinitions = { definitions: InternalComponentDefinitions };

// WeakMap cache: builds a Map<id, definition> per context for O(1) lookups
const contextMapCache = new WeakMap<
  AnyContextWithDefinitions,
  Map<string, InternalComponentDefinition>
>();

function allDefs(
  context?: AnyContextWithDefinitions
): InternalComponentDefinition[] {
  return context?.definitions.components || [];
}

function getDefMap(
  context?: AnyContextWithDefinitions
): Map<string, InternalComponentDefinition> {
  if (!context) return new Map();

  let map = contextMapCache.get(context);
  if (!map) {
    map = new Map(allDefs(context).map((def) => [def.id, def]));
    contextMapCache.set(context, map);
  }
  return map;
}

/**
 * Versions with context and custom components sweep
 */

export function findComponentDefinition(
  config: NoCodeComponentEntry | undefined | null,
  context: AnyContextWithDefinitions
): InternalComponentDefinition | undefined {
  return $findComponentDefinition(config, context);
}

export function findComponentDefinitionById(
  id: string,
  context: AnyContextWithDefinitions
): InternalComponentDefinition | undefined {
  return $findComponentDefinitionById(id, context);
}

export function findComponentDefinitionsByType(
  tag: string,
  context: AnyContextWithDefinitions
): InternalComponentDefinition[] {
  return allDefs(context).filter((def) =>
    toArray(def.type ?? []).includes(tag)
  );
}

/**
 * Generic
 */

function $findComponentDefinition(
  config: NoCodeComponentEntry | undefined | null,
  context?: AnyContextWithDefinitions
): InternalComponentDefinition | undefined {
  if (!config) {
    return undefined;
  }

  return $findComponentDefinitionById(config._component, context);
}

function $findComponentDefinitionById(
  id: string,
  context?: AnyContextWithDefinitions
): InternalComponentDefinition | undefined {
  return getDefMap(context).get(id);
}
