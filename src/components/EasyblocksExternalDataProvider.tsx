"use client";
import React, { createContext, useContext } from "react";
import { ExternalData } from "../types";

/**
 * Created on first use rather than at module scope.
 *
 * The package root re-exports this module, so any consumer that imports an unrelated
 * helper from the root pulls this file into its module graph. In a React Server
 * Components environment `react` resolves to a build without `createContext`, so calling
 * it while the module evaluates throws before the consumer renders anything — even though
 * the provider itself is only ever used on the client.
 */
let externalDataContext: React.Context<ExternalData | null> | null = null;

function getExternalDataContext() {
  if (!externalDataContext) {
    externalDataContext = createContext<ExternalData | null>(null);
  }

  return externalDataContext;
}

function useEasyblocksExternalData() {
  const context = useContext(getExternalDataContext());

  if (!context) {
    throw new Error(
      "useEasyblocksExternalData must be used within a EasyblocksExternalDataProvider"
    );
  }

  return context;
}

function EasyblocksExternalDataProvider({
  children,
  externalData,
}: {
  children: React.ReactNode;
  externalData: ExternalData;
}) {
  const ExternalDataContext = getExternalDataContext();

  return (
    <ExternalDataContext.Provider value={externalData}>
      {children}
    </ExternalDataContext.Provider>
  );
}

export { EasyblocksExternalDataProvider, useEasyblocksExternalData };
