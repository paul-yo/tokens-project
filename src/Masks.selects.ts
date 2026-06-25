import * as X from "./X.ts";

/** */
export const VisibilityKind = {
	exempt: X.tokens.only.words.exempt,
	extend: X.tokens.only.words.extend,
	expose: X.tokens.only.words.expose,
	export: X.tokens.only.words.export,
} as const;
export type VisibilityKind = (typeof VisibilityKind)[keyof typeof VisibilityKind];

/** */
export const AssignerKind = { ...X.tokens.only.assigners } as const;
export type AssignerKind = (typeof AssignerKind)[keyof typeof AssignerKind];

/** */
export const RangeKind = {
	to: X.tokens.only.words.to,
	til: X.tokens.only.words.til,
} as const;
export type RangeKind = (typeof RangeKind)[keyof typeof RangeKind];

/** */
export const ComparisonKind = {
	equality: X.tokens.only.operators.sealed.equality,
	inequality: X.tokens.only.operators.sealed.inequality,
	gt: X.tokens.only.operators.overloadable.gt,
	gte: X.tokens.only.operators.overloadable.gte,
	lt: X.tokens.only.operators.overloadable.lt,
	lte: X.tokens.only.operators.overloadable.lte,
} as const;
export type ComparisonKind = (typeof ComparisonKind)[keyof typeof ComparisonKind];

/** */
export const AttestationKind = {
	is: X.tokens.only.words.is,
	isnot: X.tokens.only.words.isnot,
} as const;
export type AttestationKind = (typeof AttestationKind)[keyof typeof AttestationKind];

/** */
export const InfixOperatorKind = {
	...X.tokens.only.operators.sealed,
	...X.tokens.only.operators.overloadable,
} as const;
export type InfixOperatorKind = (typeof InfixOperatorKind)[keyof typeof InfixOperatorKind];

//# Statement prefixes

/** */
export const BreakKind = X.tokens.only.breaks;
export type BreakKind = (typeof BreakKind)[keyof typeof BreakKind];

/** */
export const ContinueKind = X.tokens.only.continues;
export type ContinueKind = (typeof ContinueKind)[keyof typeof ContinueKind];

/** */
export const YieldKind = X.tokens.only.yields;
export type YieldKind = (typeof YieldKind)[keyof typeof YieldKind];

//# Worker related

/** */
export const WorkerPriorityKind = {
	high: "high",
	mid: "mid",
	low: "low",
} as const;
export type WorkerPriorityKind = (typeof WorkerPriorityKind)[keyof typeof WorkerPriorityKind];

/** */
export const WorkerCoreKind = {
	performance: "performance",
	efficiency: "efficiency",
} as const;
export type WorkerCoreKind = (typeof WorkerCoreKind)[keyof typeof WorkerCoreKind];
