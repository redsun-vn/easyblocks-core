import type { RenderableDocument } from "../types";

/**
 * Pure helpers backing {@link LazyEasyblocks}. Kept DOM-free so they can be
 * unit-tested in the repo's node-environment jest setup.
 */

/**
 * Pick the collection slot with the most children on the root compiled node.
 * Only array-valued entries are considered. Returns `undefined` when there is
 * no non-empty collection to lazy-mount.
 */
export function autoDetectSlot(
  components: Record<string, unknown[]> | undefined
): string | undefined {
  if (!components) {
    return undefined;
  }

  let bestSlot: string | undefined;
  let bestLength = 0;

  for (const key in components) {
    const value = components[key];
    if (Array.isArray(value) && value.length > bestLength) {
      bestSlot = key;
      bestLength = value.length;
    }
  }

  return bestSlot;
}

/**
 * Build a document whose target collection slot is sliced to `visibleCount`
 * children. Child config objects are reused by reference so children already
 * mounted (keyed by `_id` in the renderer) never remount.
 *
 * Shallow-clones the document, root node, and its `components` map so the
 * caller's original `renderableContent` stays untouched by Easyblocks' own
 * `componentOverrides` mutation. Returns the original document unchanged when
 * there is no non-empty slot to slice.
 */
export function buildSlicedDocument(
  renderableDocument: RenderableDocument,
  slot: string | undefined,
  visibleCount: number
): RenderableDocument {
  const renderableContent = renderableDocument.renderableContent;

  if (
    !renderableContent ||
    !slot ||
    !Array.isArray(renderableContent.components?.[slot]) ||
    renderableContent.components[slot].length === 0
  ) {
    return renderableDocument;
  }

  const slicedContent = {
    ...renderableContent,
    components: {
      ...renderableContent.components,
      [slot]: renderableContent.components[slot].slice(0, visibleCount),
    },
  };

  return { ...renderableDocument, renderableContent: slicedContent };
}
