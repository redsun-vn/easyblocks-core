import { Devices } from "../../types";
export type BoxClassNames = {
    boxClassName: string;
    componentClassName: string;
};
/**
 * Starts a fresh scope for `stitches`, discarding what the previous tree generated.
 *
 * Called by `createEasyblocksStitches`, which is where the sheet is emptied, so the cache and
 * the rules it names are always thrown away together.
 */
export declare function startBoxClassNameScope(stitches: unknown): void;
export declare function getBoxClassNames(stitches: any, devices: Devices, styles: Record<string, any>): BoxClassNames;
//# sourceMappingURL=box-class-names.d.ts.map