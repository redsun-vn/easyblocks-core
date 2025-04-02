'use client';
/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

const EasyblocksExternalDataContext = /*#__PURE__*/React.createContext(null);
function useEasyblocksExternalData() {
  const context = React.useContext(EasyblocksExternalDataContext);
  if (!context) {
    throw new Error("useEasyblocksExternalData must be used within a EasyblocksExternalDataProvider");
  }
  return context;
}
function EasyblocksExternalDataProvider(_ref) {
  let {
    children,
    externalData
  } = _ref;
  return /*#__PURE__*/React__default["default"].createElement(EasyblocksExternalDataContext.Provider, {
    value: externalData
  }, children);
}

exports.EasyblocksExternalDataProvider = EasyblocksExternalDataProvider;
exports.useEasyblocksExternalData = useEasyblocksExternalData;
