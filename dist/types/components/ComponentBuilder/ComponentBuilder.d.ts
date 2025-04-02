import { ComponentType, ReactElement } from "react";
import { CompiledComponentConfig, NoCodeComponentProps } from "../../types";
export type ComponentBuilderProps = {
    path: string;
    passedProps?: {
        [key: string]: any;
    };
    compiled: CompiledComponentConfig;
    components: {
        "@easyblocks/missing-component": ComponentType<any>;
        "@easyblocks/rich-text.client": ComponentType<any>;
        "@easyblocks/rich-text-block-element": ComponentType<any>;
        "@easyblocks/rich-text-line-element": ComponentType<any>;
        "@easyblocks/rich-text-part": ComponentType<any>;
        "@easyblocks/text.client": ComponentType<any>;
        "EditableComponentBuilder.client": ComponentType<any>;
        [key: string]: ComponentType<any>;
    };
};
export type InternalNoCodeComponentProps = NoCodeComponentProps & {
    __easyblocks: {
        path: string;
        runtime: any;
    };
};
declare function ComponentBuilder(props: ComponentBuilderProps): ReactElement | null;
export { ComponentBuilder };
//# sourceMappingURL=ComponentBuilder.d.ts.map