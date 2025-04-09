'use client';
/* with love from shopstory */
import React, { useContext, createContext } from 'react';

const EasyblocksExternalDataContext = /*#__PURE__*/createContext(null);
function useEasyblocksExternalData() {
  const context = useContext(EasyblocksExternalDataContext);
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
  return /*#__PURE__*/React.createElement(EasyblocksExternalDataContext.Provider, {
    value: externalData
  }, children);
}

export { EasyblocksExternalDataProvider, useEasyblocksExternalData };
//# sourceMappingURL=EasyblocksExternalDataProvider.js.map
