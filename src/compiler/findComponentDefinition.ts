import { toArray } from "@/utils";
import { NoCodeComponentEntry } from "../types";
import {
  InternalComponentDefinition,
  InternalComponentDefinitions,
} from "./types";

type AnyContextWithDefinitions = { definitions: InternalComponentDefinitions };

function allDefs(
  context?: AnyContextWithDefinitions
): InternalComponentDefinition[] {
  return context?.definitions.components || [];
}

/**
 * Lazily-built Map cache for O(1) definition lookup by id.
 * Keyed on the definitions.components array reference — rebuilt only when the array changes.
 */
const _defMapCache = new WeakMap<
  InternalComponentDefinition[],
  Map<string, InternalComponentDefinition>
>();

function getDefMap(
  context?: AnyContextWithDefinitions
): Map<string, InternalComponentDefinition> {
  const defs = allDefs(context);
  let map = _defMapCache.get(defs);
  if (!map) {
    map = new Map(defs.map((d) => [d.id, d]));
    _defMapCache.set(defs, map);
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
