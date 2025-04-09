/* with love from shopstory */
import React from 'react';

const rootStyles = {
  position: "relative",
  width: "100%"
};
const ratioStyles = _ref => {
  let {
    type
  } = _ref;
  return {
    paddingBottom: (() => {
      if (type === "SECTION") {
        return "50%";
      }
      if (type === "CARD") {
        return "133%";
      }
      return "auto";
    })(),
    display: type === "BUTTON" ? "none" : "block",
    height: type === "BUTTON" ? "50px" : "auto"
  };
};
const contentStyles = _ref2 => {
  let {
    type,
    error
  } = _ref2;
  return {
    position: type === "CARD" || type === "SECTION" ? "absolute" : "static",
    boxSizing: "border-box",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#fafafa",
    color: error ? "red" : "grey",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "sans-serif",
    textAlign: "center",
    fontSize: "14px",
    minHeight: "40px",
    padding: type === "CARD" || type === "SECTION" ? "32px" : "0.5em 0.5em"
  };
};
function MissingComponent(_ref3) {
  let {
    component,
    children,
    error
  } = _ref3;
  const isButton = component?.type === "button" || Array.isArray(component?.type) && component?.type.includes("button");
  const isSection = component?.type === "section" || Array.isArray(component?.type) && component?.type.includes("section");
  const isCard = component?.type === "card" || Array.isArray(component?.type) && component?.type.includes("card");
  let type;
  if (isSection) {
    type = "SECTION";
  } else if (isCard) {
    type = "CARD";
  } else if (isButton) {
    type = "BUTTON";
  }
  return /*#__PURE__*/React.createElement("div", {
    style: rootStyles
  }, /*#__PURE__*/React.createElement("div", {
    style: ratioStyles({
      type
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: contentStyles({
      type,
      error
    })
  }, children));
}

export { MissingComponent };
//# sourceMappingURL=MissingComponent.js.map
