"use client";

import { createStitches } from "@stitches/core";
import React, { createContext, ReactNode, useContext } from "react";
import { easyblocksStitchesInstances } from "./ssr";
import { CompilationMetadata } from "../types";

/** Created on first use — see the note in EasyblocksExternalDataProvider. */
let metadataContext: React.Context<
  (CompilationMetadata & { stitches: any }) | undefined
> | null = null;

function getMetadataContext() {
  if (!metadataContext) {
    metadataContext = createContext<
      (CompilationMetadata & { stitches: any }) | undefined
    >(undefined);
  }

  return metadataContext;
}

type EasyblocksMetadataProviderProps = {
  children: ReactNode;
  meta: CompilationMetadata;
  /**
   * Stitches instance to generate class names with. Supply one per render tree — see
   * `createEasyblocksStitches` — so concurrent server renders cannot share a sheet. Without
   * it the process-wide fallback is used, which is only safe when one tree exists at a time.
   */
  stitches?: any;
};

const EasyblocksMetadataProvider: React.FC<EasyblocksMetadataProviderProps> = ({
  meta,
  children,
  stitches,
}) => {
  if (!stitches && easyblocksStitchesInstances.length === 0) {
    easyblocksStitchesInstances.push(createStitches({}));
  }

  const MetadataContext = getMetadataContext();

  return (
    <MetadataContext.Provider
      value={{
        ...meta,
        stitches: stitches ?? easyblocksStitchesInstances[0],
      }}
    >
      {children}
    </MetadataContext.Provider>
  );
};

function useEasyblocksMetadata() {
  const context = useContext(getMetadataContext());

  if (!context) {
    throw new Error(
      "useEasyblocksMetadata must be used within a EasyblocksMetadataProvider"
    );
  }

  return context;
}

export { EasyblocksMetadataProvider, useEasyblocksMetadata };
