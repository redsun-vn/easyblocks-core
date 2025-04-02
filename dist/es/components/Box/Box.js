/* with love from shopstory */
import React, { useMemo } from 'react';
import { getBoxStyles } from '../../compiler/box.js';

const boxStyles = {
  boxSizing: "border-box",
  minWidth: "0px",
  margin: 0,
  padding: 0,
  border: 0,
  listStyle: "none"
};
const Box = /*#__PURE__*/React.forwardRef((props, ref) => {
  /**
   * passedProps - the props given in component code like <MyBox data-id="abc" /> (data-id is in passedProps)
   * restProps - the props given by Shopstory (like from actionWrapper)
   *
   * They are merged into "realProps".
   *
   * I know those names sucks, this needs to be cleaned up.
   */

  const {
    __compiled,
    __name,
    passedProps,
    devices,
    stitches,
    ...restProps
  } = props;
  const {
    __as,
    ...styles
  } = __compiled;
  const realProps = {
    ...restProps,
    ...passedProps
  };
  const {
    as,
    itemWrappers,
    className,
    ...restPassedProps
  } = realProps;
  const {
    boxClassName,
    componentClassName
  } = useMemo(() => {
    /**
     * Why parse+stringify?
     *
     * Because if we remove them some nested objects in styles (like media queries etc) don't work (although they exist in the object).
     * Why? My bet is this: Stitches uses CSSOM to inject styles. Maybe (for some weird reason, maybe even browser bug) if some part of the object is not in iframe scope but in parent window scope then it's somehow ignored? Absolutely no idea right now, happy this works.
     */
    const correctedStyles = getBoxStyles(JSON.parse(JSON.stringify(styles)), devices);
    const generateBoxClass = stitches.css(boxStyles);
    const generateClassName = stitches.css(correctedStyles);
    return {
      boxClassName: generateBoxClass(),
      componentClassName: generateClassName()
    };
  }, [styles.__hash]);
  return /*#__PURE__*/React.createElement(as || __as || "div", {
    ref,
    ...restPassedProps,
    className: [boxClassName, componentClassName, className].filter(Boolean).join(" "),
    "data-testid": __name
  }, props.children);
});

export { Box };
