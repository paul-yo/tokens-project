import * as X from "./X.ts";
interface Vertebra {
    readonly mask: X.Mask;
    /**
     * Stores the index of the mask object in it's containing array.
     * If the mask is not stored in an array field, this value is -1.
     * Testing whether .index < 0 is a handy way to disambiguate
     * quickly between masks inside array and non-array fields.
     */
    readonly index: number;
    /**
     * Stores a reference to the TField schema object that describes
     * the field in which this vertebra passes through.
     */
    readonly schemaField: X.TField;
}
interface ICursor {
    /**
     * Stores a bottom-up array of each Vertebra which stores
     * the path to where the cursor is currently pointing in the tape walk.
     * When at the very top level, the spine will be an empty array.
     * When at nested levels, spine[0] always stores the immediate
     * parent, and spine.at(-1) always stores the root vertebra.
     */
    readonly spine: readonly Vertebra[];
    /**
     * Stores a pointer to the Mask of interest of the cursor. To get the
     * surrounding meta information about that Mask of interest, use
     * spine[0] or more successive vertebra of the spine if information
     * higher up the chain is needed.
     */
    readonly element: X.Mask;
    /**
     * Stores a boolean field that indicates whether the traversal is
     * on the way down, or coming back up. The visitor callback is
     * fired on both sides. Function implementations are expected
     * to early return if they only want handling for one direction.
     */
    readonly isAscending: boolean;
}
/** */
type WalkDirective = void | "skip" | "stop";
/**
 * Performs a full walk of the Mask objects that have been layered over the specified Tape.
 * The traversal does not visit tokens or other non-mask values that reside in properties
 * inside Mask objects.
 */
export declare function walkTape(tape: X.Tape, visitFn: (cursor: ICursor) => WalkDirective): void;
export {};
