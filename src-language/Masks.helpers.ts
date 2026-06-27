import * as X from "./XX.ts";

/** */
export type TExpressionable = 
	typeof X.EntityToken | 
	typeof X.LiteralToken |
	X.ExpressionMasks;

/**
 * Shortcut function, because this particular sequence is used pervasively.
 */
export function expressionable()
{
	return X.one(X.EntityToken, X.LiteralToken, ...X.ExpressionMasks);
}
