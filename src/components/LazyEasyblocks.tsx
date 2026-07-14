"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Easyblocks, EasyblocksProps } from "./Easyblocks";
import { autoDetectSlot, buildSlicedDocument } from "./lazyEasyblocksUtils";

export type LazyEasyblocksProps = EasyblocksProps & {
  /** How many collection children to mount initially. Default `3`. */
  initialCount?: number;
  /** How many more children to mount each time the sentinel is reached (clamped to `>= 1`). Default `3`. */
  batchSize?: number;
  /**
   * Name of the collection slot on the root compiled node to lazy-mount. When
   * omitted, the slot whose children array is longest is auto-detected. Pass
   * explicitly when the root has multiple collections.
   */
  slot?: string;
  /** IntersectionObserver `root`. Default `null` (viewport). */
  scrollRoot?: Element | null;
  /** IntersectionObserver `rootMargin` (prefetch distance). Default `"200px"`. */
  rootMargin?: string;
};

/**
 * Drop-in wrapper around {@link Easyblocks} that progressively mounts the
 * children of one collection slot on scroll (append-only infinite scroll).
 *
 * Children config objects are reused by reference when slicing, so children
 * already mounted (keyed by `_id` inside the renderer) never remount — each
 * scroll batch only mounts the newly revealed children.
 */
function LazyEasyblocks({
  renderableDocument,
  initialCount = 3,
  batchSize = 3,
  slot,
  scrollRoot = null,
  rootMargin = "200px",
  ...easyblocksProps
}: LazyEasyblocksProps) {
  const renderableContent = renderableDocument.renderableContent;

  // Resolve which collection slot to lazy-mount. `components` is keyed by slot
  // name; each value is an array of compiled child configs (or ReactElements).
  const resolvedSlot =
    slot ??
    autoDetectSlot(
      renderableContent?.components as Record<string, unknown[]> | undefined,
    );

  const children =
    renderableContent && resolvedSlot
      ? renderableContent.components[resolvedSlot]
      : undefined;
  const total = children?.length ?? 0;

  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(initialCount, total),
  );
  const hasMore = visibleCount < total;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset visible count when the document, slot, or initial count changes so a
  // new document does not inherit the previous scroll position.
  useEffect(() => {
    setVisibleCount(Math.min(initialCount, total));
  }, [renderableDocument, resolvedSlot, initialCount, total]);

  // Reveal more children when the sentinel scrolls into view. `visibleCount` is
  // in the deps on purpose: after a batch the effect re-runs and re-`observe`s,
  // which delivers a fresh intersection callback. If the sentinel is still in
  // view (short items / tall viewport), the next batch loads immediately and
  // loops until the viewport is filled — IntersectionObserver otherwise only
  // fires on threshold *crossings*, so a stationary sentinel would stall.
  useEffect(() => {
    if (!hasMore || typeof IntersectionObserver === "undefined") {
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const step = Math.max(1, batchSize);
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((current) => Math.min(current + step, total));
        }
      },
      { root: scrollRoot, rootMargin },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, batchSize, total, scrollRoot, rootMargin, visibleCount]);

  // Build a sliced document that reuses child references. Falls back to the
  // original document when there is no non-empty collection to lazy-mount.
  const slicedDocument = useMemo(
    () => buildSlicedDocument(renderableDocument, resolvedSlot, visibleCount),
    [renderableDocument, resolvedSlot, visibleCount],
  );

  // No collection to lazy-mount: behave exactly like a plain <Easyblocks />
  // (including its `componentOverrides` mutation behavior — the clone-based
  // protection only applies when there is a slot to slice).
  if (total === 0) {
    return (
      <Easyblocks
        {...easyblocksProps}
        renderableDocument={renderableDocument}
      />
    );
  }

  return (
    <>
      <Easyblocks {...easyblocksProps} renderableDocument={slicedDocument} />
      {hasMore ? (
        <div ref={sentinelRef} aria-hidden="true" style={{ width: "100%" }} />
      ) : null}
    </>
  );
}

export { LazyEasyblocks };
