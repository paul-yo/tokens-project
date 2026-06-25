import * as X from "./X.ts";

/** */
export class ParenMask extends X.Mask
{
	readonly content: (X.StatementMasks | X.ExpressionMasks)[] = X.unset;
	
	schema() { return {
		content: X.many(...X.StatementMasks, ...X.ExpressionMasks),
	}}
}

