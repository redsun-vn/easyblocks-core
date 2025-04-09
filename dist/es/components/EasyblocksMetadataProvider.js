'use client';
/* with love from shopstory */
import { createStitches } from '@stitches/core';
import React, { createContext, useContext } from 'react';
import { easyblocksStitchesInstances } from './ssr.js';

const EasyblocksMetadataContext = /*#__PURE__*/createContext(undefined);
const EasyblocksMetadataProvider = _ref => {
  let {
    meta,
    children
  } = _ref;
  // Let's load stitches instance
  if (easyblocksStitchesInstances.length === 0) {
    easyblocksStitchesInstances.push(createStitches({}));
  }
  return /*#__PURE__*/React.createElement(EasyblocksMetadataContext.Provider, {
    value: {
      ...meta,
      stitches: easyblocksStitchesInstances[0]
    }
  }, children);
};
function useEasyblocksMetadata() {
  const context = useContext(EasyblocksMetadataContext);
  if (!context) {
    throw new Error("useEasyblocksMetadata must be used within a EasyblocksMetadataProvider");
  }
  return context;
}

export { EasyblocksMetadataProvider, useEasyblocksMetadata };
//# sourceMappingURL=EasyblocksMetadataProvider.js.map
