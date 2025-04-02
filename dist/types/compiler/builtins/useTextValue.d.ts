import React from "react";
import { Locale } from "../../locales";
export declare function useTextValue(value: any, onChange: any, locale: string, locales: Array<Locale>, defaultPlaceholder?: string, normalize?: (x: string) => string | null): {
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onBlur: () => void;
    value: string;
    style: any;
    placeholder: string;
};
//# sourceMappingURL=useTextValue.d.ts.map