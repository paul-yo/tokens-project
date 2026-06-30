import * as X from "./X.ts";
/**
 * A Lens defines a range over a Tape or a Fragment with token-relative
 * slice boundaries. Do not instantiate Lens directly. Instead, use the .slice()
 * method on another TapeLike instance.
 */
export declare class Lens {
    /**  */
    constructor(source: X.Tape | X.Fragment, sourceSliceTokenBegin: number, sourceSliceTokenEnd: number);
    /** Should this actually just be a TapeFragment?. */
    private readonly source;
    /** */
    private lamport;
    /**
     * Stores the token-relative beginning slice boundary
     * of the underlying Tape or Fragment source.
     */
    private readonly sliceBegin;
    /**
     * Stores the token-relative ending slice boundary
     * of the underlying Tape or Fragment source.
     */
    private readonly sliceEnd;
    /** */
    private get sliceBeginMaskRelative();
    /** */
    private get sliceEndMaskRelative();
    /** */
    get tokenSize(): number;
    /**
     * Gets the masked size specifically of the section of the
     * source tape or fragment that this Lens can see.
     */
    get maskedSize(): number;
    /**
     * Gets the unmasked token count specifically of the section of the
     * source tape or fragment that this Lens can see.
     */
    get unmaskedTokenCount(): number;
    /** */
    private getCounts;
    /**
     * Pass-through slice method.
     */
    slice(from: number, to: number): X.Lens;
    /**
     * Rewrites the specified mask-aware tape range (from, to) to a single mask entry.
     */
    applyMask(mask: X.Mask, from: number, to: number): X.Mask | null;
    /** */
    insertToken(token: X.Token | X.Tape, at?: number): X.Mask | null;
    /** */
    deleteToken(at: number): X.Mask | null;
    /** */
    get charstring(): string;
    /** */
    get charstringReadable(): string;
    /** */
    at(index: number): X.Tape | X.Token | X.Mask;
    /** */
    walk(): Generator<X.Tape | X.Token | X.Mask, void, unknown>;
    /** */
    walkCursor(): Generator<never, void, unknown>;
    /** */
    private checkLamports;
}
