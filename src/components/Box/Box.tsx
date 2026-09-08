import React, { useMemo } from "react";
import { getBoxStyles } from "../../compiler/box";
import { Devices } from "../../types";

/**
 * Wrapped in `:where()` so the rule carries no specificity at all.
 *
 * Every Box gets this reset plus a class generated from its own styles, and both are single
 * classes — equal specificity, so whichever the browser reads last wins. That is fine while
 * they live in one stylesheet, and stops being fine the moment they do not: server-rendered
 * CSS is streamed into the body, the browser's own instance writes into the head, and the
 * head is read first. A component whose styles are generated only in the browser then loses
 * every padding, margin and border to a reset that happens to sit further down the page.
 *
 * At zero specificity the reset always loses to the component rule and position stops
 * mattering. It also now loses to a bare element selector, which is the intended trade: an
 * author who writes `ul { padding-left: 2rem }` means it.
 */
const boxStyles = {
  ":where(&)": {
    boxSizing: "border-box",
    minWidth: "0px",
    margin: 0,
    padding: 0,
    border: 0,
    listStyle: "none",
  },
};

type BoxProps = {
  __compiled: any;
  __name?: string;
  devices: Devices;
  stitches: any;
  [key: string]: any;
};

const Box = React.forwardRef<HTMLElement, BoxProps>((props, ref) => {
  /**
   * passedProps - the props given in component code like <MyBox data-id="abc" /> (data-id is in passedProps)
   * restProps - the props given by Shopstory (like from actionWrapper)
   *
   * They are merged into "realProps".
   *
   * I know those names sucks, this needs to be cleaned up.
   */

  const { __compiled, __name, passedProps, devices, stitches, ...restProps } =
    props;

  const { __as, ...styles } = __compiled;
  const realProps = { ...restProps, ...passedProps };

  const { as, itemWrappers, className, ...restPassedProps } = realProps;

  const { boxClassName, componentClassName } = useMemo(() => {
    /**
     * We need styles to be "owned" by the current JS realm for Stitches/CSSOM.
     * structuredClone is faster than JSON.parse(JSON.stringify()) and handles
     * the same cross-realm object issue. Fall back to JSON round-trip if
     * structuredClone isn't available (older browsers).
     */
    const cloned =
      typeof structuredClone === "function"
        ? structuredClone(styles)
        : JSON.parse(JSON.stringify(styles));
    const correctedStyles = getBoxStyles(cloned, devices);

    const generateBoxClass = stitches.css(boxStyles);
    const generateClassName = stitches.css(correctedStyles);

    return {
      boxClassName: generateBoxClass(),
      componentClassName: generateClassName(),
    };
  }, [styles.__hash]);

  return React.createElement(
    as || __as || "div",
    {
      ref,
      ...restPassedProps,
      className: [boxClassName, componentClassName, className]
        .filter(Boolean)
        .join(" "),
      "data-testid": __name,
    },
    props.children,
  );
});

Box.displayName = "Box";

export { Box };
