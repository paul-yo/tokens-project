import * as X from "./X.ts";
/** */
export declare class TapeParser {
    /** */
    constructor(tokens: readonly string[], spec: X.ILanguageSpec);
    private readonly spec;
    private index;
    private readonly stream;
    private readonly allTokens;
    /** */
    private read;
    /** */
    private createTape;
    /** */
    parse(): X.Tape;
    /** */
    private parseAny;
    /** */
    private parseToDelimiter;
    /** */
    private parseTextual;
    /** */
    private tryParseMarkup;
}
