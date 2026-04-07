import React, { useMemo } from "react";
import { getBoxStyles } from "../../compiler/box";
import { Devices } from "../../types";

const boxStyles = {
  boxSizing: "border-box",
  minWidth: "0px",
  margin: 0,
  padding: 0,
  border: 0,
  listStyle: "none",
};

// Module-level cache: hash → generated CSS class names, avoids redundant stitches.css() calls
const classCache = new Map<string, { boxClassName: string; componentClassName: string }>();

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
    const hash = styles.__hash;

    const cached = classCache.get(hash);
    if (cached) return cached;

    /**
     * Why structuredClone (previously parse+stringify)?
     *
     * Because if we pass the raw object, some nested objects in styles (like media queries etc) don't work.
     * My bet: Stitches uses CSSOM to inject styles. If part of the object is not in iframe scope but in
     * parent window scope it gets ignored. structuredClone produces a fresh same-realm copy.
     */
    const correctedStyles = getBoxStyles(structuredClone(styles), devices);

    const generateBoxClass = stitches.css(boxStyles);
    const generateClassName = stitches.css(correctedStyles);

    const result = {
      boxClassName: generateBoxClass().className,
      componentClassName: generateClassName().className,
    };
    classCache.set(hash, result);
    return result;
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
