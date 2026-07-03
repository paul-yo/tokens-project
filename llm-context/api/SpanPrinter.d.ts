import * as X from "./X.ts";
/** */
export type TClassifiable = X.Mask | X.Token | X.Tape | X.Fragment;
export type ClassifierFn = (node: TClassifiable) => readonly string[];
/**
 * Projects the specified Tape into an HTML string, as described by the
 * "HTML Emitter Specification". The emitter itself carries no language
 * -specific knowledge; all such classification is delegated to classifierFn.
 */
export declare function createSpansFromTape(tape: X.Tape, classifierFn: ClassifierFn): string;
