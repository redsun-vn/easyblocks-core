import React, { ReactElement } from "react";
import { ExternalData, RenderableDocument } from "../types";
import { ExtractedFont } from "../utils/extractFonts";
export type EasyblocksProps = {
    renderableDocument: RenderableDocument;
    externalData?: ExternalData;
    components?: Record<string, React.ComponentType<any>>;
    componentOverrides?: ComponentOverrides;
    fonts?: ExtractedFont[];
};
export type ComponentOverrides = Record<string, ReactElement>;
declare function Easyblocks({ renderableDocument, externalData, componentOverrides, components, fonts, }: EasyblocksProps): React.JSX.Element | null;
export { Easyblocks };
//# sourceMappingURL=Easyblocks.d.ts.map