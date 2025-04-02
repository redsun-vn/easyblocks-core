import type { ReactElement, ReactNode } from "react";
import React from "react";
type RichTextPartProps = {
    TextWrapper: React.ReactElement<{
        trigger: React.ReactElement;
    }> | undefined;
    value: string | ReactElement;
    Text: React.ReactElement<{
        children: ReactNode;
        style: Record<string, any>;
    }>;
};
export declare function RichTextPartClient(props: RichTextPartProps): React.JSX.Element;
export {};
//# sourceMappingURL=$richTextPart.client.d.ts.map