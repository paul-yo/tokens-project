import * as X from "./X.ts";
/** */
export declare class MaskDescriptor {
    /**
     * Compiles all schemas for all masks.
     */
    static compile(spec: X.ILanguageSpec): void;
    /**
     * Enumerates through all mask schema objects  in topological ordering,
     * creating new MaskDescriptor objects where they are missing. This is a helper
     * function of the compile() function and not intended to be used otherwise.
     * Fields can reference other masks and embed their regular expressions
     * and if these are not yet constructed... disappointment will result.
     */
    private static visitTopological;
    /** */
    constructor(maskType: typeof X.Mask, schema: X.TMaskSchema);
    /** */
    readonly type: typeof X.Mask;
    /** */
    readonly schema: X.TMaskSchema;
    /** Stores the delimiter of the tape enclosure in which this mask is expected to be wrapped.  */
    readonly enclosure: X.Enclosure;
    /** */
    readonly sparse: boolean;
    /** */
    readonly suffix: boolean;
    /**
     *
     */
    get enclosureAwareMatcher(): RegExp | null;
    private _enclosureAwareMatcher;
    /**
     * Gets the RegExp object whose source is equal to the value
     * of the matchPattern property in this object.
     */
    get enclosureIgnoringMatcher(): RegExp | null;
    private _enclosureIgnoringMatcher;
    /**
     * Gets the text-only regular expression pattern of the associated mask,
     * which is the string used to compose the abstract regular expression that
     * is actually matched against tapes.
     */
    get matchPattern(): string;
    private _matchPattern;
    /**
     * Gets the text-only regular expression pattern of the associated mask,
     * with any field capture group markings omitted,  and with reduced
     * specificity, making it pattern suitable for embedding in other patterns.
     */
    get insidePattern(): string;
    private _insidePattern;
    /** */
    getReadablePattern(inside: boolean): string;
}
/** Helper type alias for creating Mask sum types.  */
export type Sum<T extends readonly any[]> = InstanceType<T[number]>;
/** Helper function for creating physical representations of Mask sum types. */
export declare function sum<const T extends readonly typeof X.Mask[]>(...types: T): T;
export declare const unset: any;
