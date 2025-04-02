import { NoCodeComponentEntry, Document } from "../types";
declare function validate(input: unknown): {
    isValid: true;
    input: Document | NoCodeComponentEntry | null | undefined;
} | {
    isValid: false;
};
export { validate };
export declare function isLegacyInput(input: unknown): input is NoCodeComponentEntry;
//# sourceMappingURL=validation.d.ts.map