import React, { ReactNode } from "react";
import { CompilationMetadata } from "../types";
type EasyblocksMetadataProviderProps = {
    children: ReactNode;
    meta: CompilationMetadata;
};
declare const EasyblocksMetadataProvider: React.FC<EasyblocksMetadataProviderProps>;
declare function useEasyblocksMetadata(): CompilationMetadata & {
    stitches: any;
};
export { EasyblocksMetadataProvider, useEasyblocksMetadata };
//# sourceMappingURL=EasyblocksMetadataProvider.d.ts.map