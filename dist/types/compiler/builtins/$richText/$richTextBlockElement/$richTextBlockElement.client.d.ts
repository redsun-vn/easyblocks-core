import React, { ReactElement } from "react";
import type { CompiledNoCodeComponentProps } from "../../../types";
import type { RichTextBlockElementComponentConfig } from "./$richTextBlockElement";
type RichTextBlockElementProps = CompiledNoCodeComponentProps<RichTextBlockElementComponentConfig["_component"], Pick<RichTextBlockElementComponentConfig, "type">> & {
    elements: Array<ReactElement>;
    Paragraph: ReactElement;
    BulletedList: ReactElement;
    NumberedList: ReactElement;
};
export declare function RichTextBlockElementClient(props: RichTextBlockElementProps): React.JSX.Element;
export {};
//# sourceMappingURL=$richTextBlockElement.client.d.ts.map