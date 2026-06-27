import * as X from "./X.ts";

/** */
export type IField = 
	IRawField |
	IFlexField |
	IFlexesField |
	IPickField |
	IMaskField |
	IOneField |
	IManyField;

//# Raw field

/** */
export interface IRawField
{
	kind: "raw"
}

/** */
export function raw(): IRawField
{
	return { kind: "raw" };
}

//# Flex field

/** */
export interface IFlexField
{
	kind: "flex";
	match: typeof X.FlexToken[];
}

/** Matches a single flex token. */
export function flex(...match: typeof X.FlexToken[]): IFlexField
{
	return { kind: "flex", match };
}

//# Flexes field

/** */
export interface IFlexesField
{
	kind: "flexes";
	match: typeof X.FlexToken[];
}

/** */
export function flexes(...match: typeof X.FlexToken[]): IFlexesField
{
	return { kind: "flexes", match };
}

//# Mask field (reference)

/** */
export interface IMaskField
{
	kind: "mask";
	match: (typeof X.Mask)[];
}

/** */
export function mask(...match: (typeof X.Mask)[]): IMaskField
{
	return { kind: "mask", match };
}

//# Pick field (enum)

type Pick = Record<string, X.FixedToken>;

/** */
export interface IPickField
{
	kind: "pick";
	match: Pick;
}

/** */
export function pick(match: Pick): IPickField
{
	return { kind: "pick", match };
}

//#

/** */
export type TFlexMaskMatch = 
	typeof X.FlexToken |
	typeof X.Mask;

//# One field

/** */
export interface IOneField
{
	kind: "one";
	match: TFlexMaskMatch[];
}

/** */
export function one(...match: TFlexMaskMatch[]): IOneField
{
	return { kind: "one", match };
}

/** */
export function isOneField(value: unknown)
{
	return checkObjectKind<IOneField>(value, "one");
}

//# Many field

/** */
export interface IManyField
{
	kind: "many";
	match: TFlexMaskMatch[];
}

/** */
export function many(...match: TFlexMaskMatch[]): IManyField
{
	return { kind: "many", match };
}

/** */
export function isManyField(value: unknown)
{
	return checkObjectKind<IOneField>(value, "many");
}

//# Utilities

/** */
function checkObjectKind<T>(object: unknown, kind: string): object is T
{
	return !!object && 
		typeof object === "object" && 
		"kind" in object && 
		object.kind === kind;
}
