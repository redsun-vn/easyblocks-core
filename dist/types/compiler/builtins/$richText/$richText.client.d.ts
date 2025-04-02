import React, { ReactElement, ReactNode } from "react";
interface RichTextProps {
    elements: Array<ReactElement>;
    Root: ReactElement<{
        children: ReactNode;
    }>;
}
declare function RichTextClient(props: RichTextProps): React.JSX.Element;
export { RichTextClient };
//# sourceMappingURL=$richText.client.d.ts.map