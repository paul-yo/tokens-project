import * as X from "./X.ts";
/**
 * An object that stores information discovered at a specific point in a tape.
 */
export interface ITapeCursor {
    /** Stores the unmasked token at the current location, if one exists. */
    token: X.Token | X.Tape | null;
    /** Stores the mask at the current location, if one exists. */
    mask: X.Mask | null;
    /**
     * Stores the tokens at the current mask location that were covered by a mask.
     * The array will be null in the case when there is no mask at the location.
     */
    tokensCovered: (X.Token | X.Tape)[] | null;
}
/**
 *
 */
export declare class Fragment {
    /**
     * Constructs a fragment from the specified tokens array.
     * Be careful what you pass to the argument, the TapeFragment
     * does a hostile take over of this reference once it has it.
     * Consider it gone once this TapeFragment sees it.
     */
    constructor(tokensToOwn: (X.Token | X.Tape)[]);
    /** */
    readonly lamport: number;
    /**
     * Gets the mask-ignoring length of the tape (only raw tokens are counted).
     */
    readonly tokenSize: number;
    /**
     * Gets the mask-aware length of the tape.
     */
    readonly maskedSize: number;
    /**
     * Gets the number of tokens remaining in the tape
     * that haven't been covered by at least one mask.
     */
    readonly unmaskedTokenCount: number;
    /**
     * The physical token store. Child Tapes count as tokens here.
     * Whitespace tokens are evicted in-place by read() — this array
     * physically shrinks each time one is removed.
     * Masks are never stored here; they live in masks[].
     */
    get tokens(): readonly (X.Token | X.Tape)[];
    private _tokens;
    /**
     * Parallel to tokens[]. One entry per logical slot.
     *
     * If i === TOKEN_SENTINEL, then the n in indexes[n] points
     * to tokens[n]
     *
     * Otherwise the value at indexes[n] points to the index of a mask in
     * the masks arrary field.
     *
     * Multiple consecutive slots sharing the same non-sentinel value were
     * all subsumed by the same mask.
     */
    private indexes;
    /** Mask store. */
    private masks;
    /**
     *
     */
    slice(begin: number, end: number): X.Lens;
    /**
     * Rewrites the specified mask-aware tape range [from, to) to a single mask entry.
     */
    applyMask(mask: X.Mask, from: number, to: number): X.Mask | null;
    /**
     * Inserts a token or child Tape into the tape.
     *
     * - If `at` is omitted the element is appended (safe at any stage).
     * - If `at` is provided the element is spliced in at that logical index.
     * - Inserting a whitespace token after read() has started (readHead > 0)
     *   throws.
     * - If the insertion point falls inside a masked run, the covering mask is
     *   evicted and returned so the caller can decide what to re-parse.
     *
     * Returns an array of evicted masks (empty when no masks were disturbed).
     */
    insertToken(token: X.Token | X.Tape, at?: number): X.Mask | null;
    /**
     * Deletes a token at the specified token index, evicts and returns any affected masks.
     */
    deleteToken(at: number): X.Mask | null;
    /** Mask-aware index lookup. */
    at(index: number): X.Tape | X.Token | X.Mask;
    /** Used as runtime to convert a tape into it's charstring representation. */
    get charstring(): string;
    private _charstringCache;
    /** Gets the readable version of the charstring, for debugging purposes. */
    get charstringReadable(): string;
    /**
     * Does a walk of the fragment, yielding either a token
     * or a mask depending on what is found at each index.
     */
    walk(): Generator<X.Tape | X.Token | X.Mask, void, unknown>;
    /**
     * Performs the same operation as .walk() but returning
     * a cursor with extended information.
     */
    walkCursor(): IterableIterator<ITapeCursor>;
    /**
     * Translates a mask-relative index into the corresponding token-relative
     * index. Counting is done left-to-right over the slot list, where a
     * slot is either a single unmasked token, or a contiguous run of
     * physical positions covered by the same mask.
     *
     * If the resulting slot is masked, the lowest physical index covered
     * by that mask is returned (i.e. the start of the mask's span), not
     * wherever in the middle of the run the count happened to land.
     */
    toTokenIndex(maskRelativeIndex: number): number;
    /**
     * Translates a mask-relative index into the corresponding token-relative
     * index. Counting is done left-to-right over the slot list, where a
     * slot is either a single unmasked token, or a contiguous run of
     * physical positions covered by the same mask.
     *
     * If the resulting slot is masked, the lowest physical index covered
     * by that mask is returned (i.e. the start of the mask's span), not
     * wherever in the middle of the run the count happened to land.
     */
    toTokenRelative(maskRelativeIndex: number): number;
    /**
     * Translates a token-relative index into the corresponding mask-relative
     * index. Counting is done left-to-right over the slot list, where a
     * slot is either a single unmasked token, or a contiguous run of
     * physical positions covered by the same mask.
     *
     * If the token at tokenRelativeIndex is covered by a mask, the
     * mask-relative index of that mask's slot is returned (regardless of
     * whether the token is the first, last, or a middle token under it).
     */
    toMaskRelative(tokenRelativeIndex: number): number;
    /**
     * Finds any mask that covers the logical position `at` and removes it,
     * and redirects index pointers to point  token pointers.
     * Returns the evicted mask if any.
     */
    private evictMaskAt;
    /**
     * Returns the mask at the specified token index,
     * or null if that token is not masked.
     */
    private getMaskAtTokenIndex;
    /**
     * Gets the number of tokens that the specified mask is covering in
     * the index list. Returns 0 if the mask wasn't found in the masks array.
     */
    private getMaskTokenSpan;
}
