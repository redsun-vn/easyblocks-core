import React, { ReactNode } from "react";
type LazyWrapperProps = {
    children: ReactNode;
    /** CSS length reserved while the child is not yet rendered. E.g. "400px" or "50vh". */
    minHeight?: string;
    /** IntersectionObserver rootMargin — how early to start loading before the element enters view. */
    rootMargin?: string;
};
/** Global event name clients can dispatch to force-reveal every LazyWrapper on the page. */
declare const REVEAL_ALL_EVENT = "easyblocks:reveal-all-lazy";
/**
 * Defers rendering of `children` until the placeholder element intersects the viewport.
 *
 * Safeguards:
 * - If `location.hash` is set on mount, render eagerly (so anchor navigation works).
 * - Before paint, check `getBoundingClientRect` — if placeholder is already in view,
 *   render eagerly (avoids placeholder flicker for above-the-fold content).
 * - On `beforeprint` or a custom `easyblocks:reveal-all-lazy` event, render eagerly.
 * - Falls back to eager render when `IntersectionObserver` is unavailable.
 */
declare function LazyWrapper({ children, minHeight, rootMargin, }: LazyWrapperProps): React.JSX.Element;
export { LazyWrapper, REVEAL_ALL_EVENT };
export type { LazyWrapperProps };
//# sourceMappingURL=LazyWrapper.d.ts.map