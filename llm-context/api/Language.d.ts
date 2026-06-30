import * as X from "./X.ts";
/**
 * Refers to the structure of a table of flex tokens which
 * are used throughout the system and in language specs.
 */
export type TFlexTokenTable = Record<string, typeof X.FlexToken>;
/** */
export interface ILanguageSpec {
    masks: typeof X.Mask[];
    fragmentationToken: X.FixedToken;
    fixedTokens: X.FixedToken[];
    physicalFlexTokens: TFlexTokenTable;
    abstractFlexTokens: TFlexTokenTable;
}
/** */
export declare class Language {
    /** */
    constructor(spec: ILanguageSpec);
    private lexer;
    private spec;
    /** Creates a hierarchial tape which is parsed from the specified code string. */
    createTape(codeText: string): X.Tape;
}
