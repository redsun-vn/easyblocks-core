import React, { ReactElement } from "react";
import { ExternalData, RenderableDocument } from "../types";
export type EasyblocksProps = {
    renderableDocument: RenderableDocument;
    externalData?: ExternalData;
    components?: Record<string, React.ComponentType<any>>;
    componentOverrides?: ComponentOverrides;
};
export type ComponentOverrides = Record<string, ReactElement>;
declare function Easyblocks({ renderableDocument, externalData, componentOverrides, components, }: EasyblocksProps): React.JSX.Element | null;
export { Easyblocks };
//# sourceMappingURL=Easyblocks.d.ts.map