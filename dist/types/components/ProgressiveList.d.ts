import React, { ReactElement } from "react";
type DeferredChildProps = {
    children: ReactElement;
    /** How many rAF frames to wait before revealing. */
    delay: number;
};
/**
 * Wraps a single child and defers its rendering by `delay` animation frames.
 * Uses `startTransition` so React treats the reveal as non-urgent.
 *
 * - delay=1 → appears after 1 rAF (~16ms)
 * - delay=2 → appears after 2 rAFs (~32ms)
 *
 * Renders `null` until revealed, so the parent array contract is preserved.
 */
declare function DeferredChild({ children, delay }: DeferredChildProps): React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
/**
 * Takes an array of elements and returns a new array where:
 * - The first `initialCount` elements are returned as-is (rendered immediately).
 * - Remaining elements are wrapped in `<DeferredChild>` with staggered delays.
 *
 * The result is still a `ReactElement[]` — same type as the input.
 * Parent components can `.map()`, `.length`, or iterate over it normally.
 *
 * @param elements     All children to render.
 * @param initialCount How many to render synchronously (default 3).
 * @param batchSize    How many to reveal per animation frame (default 2).
 */
declare function progressiveElements(elements: ReactElement[], initialCount?: number, batchSize?: number): ReactElement[];
export { DeferredChild, progressiveElements };
//# sourceMappingURL=ProgressiveList.d.ts.map