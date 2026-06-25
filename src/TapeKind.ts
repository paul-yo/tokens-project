import * as X from "./X.ts";

/** */
export type TDelimiterPair = {
	kind: string;
	left: X.FixedToken | null,
	right: X.FixedToken | null,
}

/** */
export const TapeKind = {
	/** 
	 * Tape for the root (no delimiter), but could also be used in other cases
	 * where a tape is needed but a specific delimiter kind isn't necessary.
	 */
	none: {
		kind: "TapeKind.none",
		left: null,
		right: null,
	},

	/** Tape for ( ) delimiters */
	paren: {
		kind: "TapeKind.paren",
		left: X.tokens.parenTapeL,
		right: X.tokens.parenTapeR,
	},

	/** Tape for { } delimiters */
	brace: {
		kind: "TapeKind.brace",
		left: X.tokens.braceTapeL,
		right: X.tokens.braceTapeR,
	},

	/** Tape for [ ] delimiters */
	bracket: {
		kind: "TapeKind.bracket",
		left: X.tokens.bracketTapeL,
		right: X.tokens.bracketTapeR,
	},

	/** Tape for " " delimiters */
	quote: {
		kind: "TapeKind.quote",
		left: X.tokens.quoteTape,
		right: X.tokens.quoteTape,
	},

	/** Tape for """ delimiters */
	fence: {
		kind: "TapeKind.fence",
		left: X.tokens.fenceTape,
		right: X.tokens.fenceTape,
	},

	/** Tape for markup literals */
	markup: {
		kind: "TapeKind.markup",
		left: null,
		right: null,
	},

	/** Tape for (( )) delimiters (substitution in markup literals). */
	substitution: {
		kind: "TapeKind.substitution",
		left: X.tokens.substitutionTapeL,
		right: X.tokens.substitutionTapeR,
	},
} as const;
export type TapeKind = (typeof TapeKind)[keyof typeof TapeKind];

/** Guards on whether the specified object is one of the items in the TapeKind const.  */
export function isTapeKind(object: any): object is TapeKind
{
	return !!object && 
		typeof object === "object" && 
		typeof object.kind === "string" &&
		(object.kind as string).startsWith("TapeKind.");
}
