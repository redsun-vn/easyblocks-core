import React from "react";
import { InternalNoCodeComponentProps } from "../../../components/ComponentBuilder/ComponentBuilder";
import { ResponsiveValue } from "../../../types";
import { Alignment } from "./$richText.types";
import { RichTextBlockElementCompiledComponentConfig } from "./$richTextBlockElement/$richTextBlockElement";
interface RichTextProps extends InternalNoCodeComponentProps {
    elements: Array<React.ReactElement<{
        compiled: RichTextBlockElementCompiledComponentConfig;
    }>>;
    align: ResponsiveValue<Alignment>;
}
declare function RichTextEditor(props: RichTextProps): React.JSX.Element;
export { RichTextEditor };
export type { RichTextProps };
//# sourceMappingURL=$richText.editor.d.ts.map