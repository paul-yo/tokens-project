import * as X from "./X.ts";

export type SpaceBodyMasks = X.Sum<typeof SpaceBodyMasks>;
export const SpaceBodyMasks = X.sum(
	X.FromMask,
	X.StableFunctionMask,
	X.ClassMask,
	X.DeclareMask,
	X.WorkerMask,
	X.OneOfMask,
	X.OneValueOfMask,
	X.ManyOfMask,
	X.AliasMask,
	X.TestGroupMask,
	X.StartFunctionMask,
	X.BuildFunctionMask,
);

export type ClassBodyMasks = X.Sum<typeof ClassBodyMasks>;
export const ClassBodyMasks = X.sum(
	X.CommentMask,
	X.DeclareMask,
	X.ConstructorFunctionMask,
	X.GhostFunctionMask,
	X.StableFunctionMask,
	X.PropertyMask,
	X.FieldMask,
);

export type ExpressionMasks = X.Sum<typeof ExpressionMasks>;
export const ExpressionMasks = X.sum(
	X.TernaryExpressionMask,
	X.EachMask,
	X.MatchesMask,
	X.RangeExpressionMask,
	X.BuildExpressionMask,
	X.TernaryExpressionMask,
	X.SpreadExpressionMask,
	X.CompoundParticleMask,
	X.OriginParticleMask,
	X.InfixedChainMask,
);

export type StatementMasks = X.Sum<typeof StatementMasks>;
export const StatementMasks = X.sum(
	X.SimpleAssignmentMask,
	X.ComplexAssignmentMask,
	X.ElseIfStatementMask,
	X.ElseStatementMask,
	X.IfStatementMask,
	X.BreakStatementMask,
	X.ContinueStatementMask,
	X.YieldStatementMask,
	X.ReturnStatementMask,
	X.EnsureStatementMask,
	X.ThrowStatementMask,
	X.CommentStatementMask,
	X.ExpressionStatementMask,
);

/**
 * Sum type for all syntax that exists within the type annnotation side of the code.
 */
export type TypeMasks = X.Sum<typeof TypeMasks>;
export const TypeMasks = X.sum(
	
);
