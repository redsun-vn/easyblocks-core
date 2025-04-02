'use client';
/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@stitches/core');
var React = require('react');
var ssr = require('./ssr.cjs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

const EasyblocksMetadataContext = /*#__PURE__*/React.createContext(undefined);
const EasyblocksMetadataProvider = _ref => {
  let {
    meta,
    children
  } = _ref;
  // Let's load stitches instance
  if (ssr.easyblocksStitchesInstances.length === 0) {
    ssr.easyblocksStitchesInstances.push(core.createStitches({}));
  }
  return /*#__PURE__*/React__default["default"].createElement(EasyblocksMetadataContext.Provider, {
    value: {
      ...meta,
      stitches: ssr.easyblocksStitchesInstances[0]
    }
  }, children);
};
function useEasyblocksMetadata() {
  const context = React.useContext(EasyblocksMetadataContext);
  if (!context) {
    throw new Error("useEasyblocksMetadata must be used within a EasyblocksMetadataProvider");
  }
  return context;
}

exports.EasyblocksMetadataProvider = EasyblocksMetadataProvider;
exports.useEasyblocksMetadata = useEasyblocksMetadata;
