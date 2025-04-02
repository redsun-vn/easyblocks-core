import React from "react";
import { ComponentDefinitionShared } from "../types";
type MissingComponentBuilderProps = {
    component?: ComponentDefinitionShared;
    children?: React.ReactNode;
    error?: boolean;
};
declare function MissingComponent({ component, children, error, }: MissingComponentBuilderProps): React.JSX.Element;
export { MissingComponent };
//# sourceMappingURL=MissingComponent.d.ts.map