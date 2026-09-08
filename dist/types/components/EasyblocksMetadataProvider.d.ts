import React, { ReactNode } from "react";
import { CompilationMetadata } from "../types";
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
declare const EasyblocksMetadataProvider: React.FC<EasyblocksMetadataProviderProps>;
declare function useEasyblocksMetadata(): CompilationMetadata & {
    stitches: any;
};
export { EasyblocksMetadataProvider, useEasyblocksMetadata };
//# sourceMappingURL=EasyblocksMetadataProvider.d.ts.map