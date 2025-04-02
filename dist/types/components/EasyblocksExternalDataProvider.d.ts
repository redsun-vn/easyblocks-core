import React from "react";
import { ExternalData } from "../types";
declare function useEasyblocksExternalData(): ExternalData;
declare function EasyblocksExternalDataProvider({ children, externalData, }: {
    children: React.ReactNode;
    externalData: ExternalData;
}): React.JSX.Element;
export { EasyblocksExternalDataProvider, useEasyblocksExternalData };
//# sourceMappingURL=EasyblocksExternalDataProvider.d.ts.map