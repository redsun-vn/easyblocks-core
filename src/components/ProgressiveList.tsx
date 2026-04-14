"use client";
import React, {
  ReactElement,
  startTransition,
  useEffect,
  useRef,
  useState,
} from "react";

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
function DeferredChild({ children, delay }: DeferredChildProps) {
  const [show, setShow] = useState(false);
  const rafRef = useRef(0);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      frame++;
      if (frame >= delay) {
        startTransition(() => setShow(true));
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [delay]);

  return show ? children : null;
}

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
function progressiveElements(
  elements: ReactElement[],
  initialCount = 3,
  batchSize = 2,
): ReactElement[] {
  if (elements.length <= initialCount) return elements;

  return elements.map((el, i) => {
    if (i < initialCount) return el;

    const delay = Math.ceil((i - initialCount + 1) / batchSize);
    return (
      <DeferredChild key={el.key ?? i} delay={delay}>
        {el}
      </DeferredChild>
    );
  });
}

export { DeferredChild, progressiveElements };
