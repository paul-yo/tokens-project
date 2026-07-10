import * as X from "./X.ts";
export declare const schemaOptions: unique symbol;
export type TMaskOptions = {
    [schemaOptions]?: {
        sparse?: boolean;
        suffix?: boolean;
        enclosure?: X.Enclosure;
    };
};
export type TMaskSchema = TMaskOptions & {
    [K: string]: X.TField;
};
export type TMaskSchemaEnclosed = {
    enclosure: X.Enclosure;
    content: X.IManyField | X.IOneField;
};
/** */
export type TMaskValue = boolean | X.FixedToken | X.FlexToken | X.RawToken | X.Mask;
declare const maskBrand: unique symbol;
/** */
export declare abstract class Mask {
    /**
     * Gets or sets the MaskDescriptor associated with the mask.
     */
    static get descriptor(): X.MaskDescriptor;
    static set descriptor(value: X.MaskDescriptor);
    private static _descriptor;
    /** */
    static isType(value: any): value is typeof Mask;
    private static readonly [maskBrand];
    /** */
    static get isEnclosureMask(): boolean;
    /** */
    createSchema(): TMaskSchema;
    /**
     * Scans the schema returned by .schema(), and produces a flat list
     * of entries—one per field—pairing each field's current runtime
     * value with the X.TField metadata that describes it.
     */
    queryFields(): readonly IMaskReflectedField[];
    /** */
    queryToken(containedToken: X.Token | X.Tape): IMaskReflectedToken | null;
}
/** */
export interface IMaskReflectedToken {
    readonly field: X.IMaskReflectedField;
    readonly fieldIndex: number;
    readonly siblings: X.IMaskReflectedField[];
}
/**
 * Describes a single resolved field within a mask's schema, pairing
 * the field's current runtime value with the X.TField metadata that
 * describes how it should be parsed/serialized, along with any anchors
 * that surround it.
 */
export interface IMaskReflectedField {
    /**
     * The current runtime value of this field, read off the mask
     * instance (i.e. `(maskInstance as any)[name]`). May be a single
     * TMaskValue, or an array of them when the field is a "many" field.
     */
    readonly value: TMaskValue | TMaskValue[];
    /**
     * The X.TField metadata associated with this field, as declared in
     * the schema. Describes how the field's value should be parsed
     * from and/or serialized back to tape content (e.g. whether it's
     * a one/many field, fixed/flex/raw token, etc).
     */
    readonly field: X.TField;
    /**
     * Stores the anchor tokens that are conditionally present
     * based on the value of a IHasField. If the local field value is not an
     * IHasField, then this will be an empty array.
     */
    readonly anchorConditional: readonly X.FixedToken[];
    /**
     * Any anchor tokens (literal separators, delimiters, etc)
     * that appear in the schema immediately before this field, and
     * which were accumulated while scanning prior entries.
     */
    readonly structureBefore: readonly X.FixedToken[];
    /**
     * Anchor tokens that appear after this field. This is only populated
     * for the last field in the schema, and reflects the trailing anchor
     * tokens defined at the end of the schema object (every other field
     * gets an empty array here).
     */
    readonly structureAfter: readonly X.FixedToken[];
}
/**
 *
 */
export declare abstract class EnclosureMask extends X.Mask {
    abstract readonly content: X.Mask | X.Mask[];
    /** */
    static get isEnclosureMask(): boolean;
    /** */
    createSchema(): X.TMaskSchema;
    /** */
    createSchemaEnclosed(): TMaskSchemaEnclosed;
}
export {};
