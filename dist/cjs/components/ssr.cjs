/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

const easyblocksStitchesInstances = [];
function easyblocksGetCssText() {
  return easyblocksStitchesInstances.map(stitches => stitches.getCssText()).join(" ");
}
function easyblocksGetStyleTag() {
  return /*#__PURE__*/React__default["default"].createElement("style", {
    id: "stitches",
    dangerouslySetInnerHTML: {
      __html: easyblocksGetCssText()
    }
  });
}

exports.easyblocksGetCssText = easyblocksGetCssText;
exports.easyblocksGetStyleTag = easyblocksGetStyleTag;
exports.easyblocksStitchesInstances = easyblocksStitchesInstances;
