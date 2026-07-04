import * as X from "./X.ts";
/** */
export type TClassifiable = X.Mask | X.Token | X.Tape | X.Fragment;
export type ClassifierFn = (node: TClassifiable) => readonly string[];
/**
 * Projects the specified Tape into an HTML string, as described by the
 * "HTML Emitter Specification". The emitter itself carries no language
 * -specific knowledge; all such classification is delegated to classifierFn.
 */
export declare function createHtmlFromTape(tape: X.Tape, classifierFn: ClassifierFn): void;
/**
 *
 */
export declare class HtmlPrinter {
    constructor(tape: X.Tape, classifierFn: ClassifierFn);
    private readonly tape;
    private readonly classifierFn;
    /** */
    toHtml(): string;
    /** */
    private mapMaskToSpanRecursive;
    /** */
    private spanifyToken;
}
