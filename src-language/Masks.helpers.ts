import * as X from "./XX.ts";

/** */
export type TExpressionable = 
	X.EntityToken | 
	X.LiteralToken |
	X.ExpressionMasks;

/**
 * Shortcut function, because this particular sequence is used pervasively.
 */
export function expressionable()
{
	return X.one(X.EntityToken, X.LiteralToken, ...X.ExpressionMasks);
}
