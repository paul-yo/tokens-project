import * as X from "./XX.ts";

//# Reusable

/** 
 * Reusable field for places where the mask field is a
 * paren-enclosed body of statements or expresions.
 */
type Body = (X.StatementMasks | X.ExpressionMasks)[];
const reuse = {
	get body(): X.IManyField { return X.many(...X.StatementMasks, ...X.ExpressionMasks).paren(); }
} as const;

//# Top level Masks (used everywhere)

/**
 * Represents a group of statements or expressions.
 */
export class ControlFlowMask extends X.EnclosureMask
{
	readonly content: (X.StatementMasks | X.ExpressionMasks)[] = X.unset;
	
	createSchemaEnclosed() { return {
		enclosure: X.Enclosure.paren,
		content: X.many(...X.StatementMasks, ...X.ExpressionMasks),
	}}
}

/**
 * Represents the expression that follows the clauses
 * - is
 * - is alias of
 * - is type of
 */
export class TypeExpressionMask extends X.Mask
{
	createSchema() { return {
		
	}}
}

//# Generic Masks

/** ?? */
export class ConstantMask extends X.Mask
{
	createSchema() { return {
		
	}}
}

/** ?? */
export class ConstantExpressionMask extends X.Mask
{
	createSchema() { return {
		
	}}
}

/** */
export class CommentMask extends X.Mask
{
	readonly text: X.RawToken = X.unset;
	
	createSchema() { return {
		...X.anchor(X.tokens.comment),
		text: X.raw(),
	}}
}

//# Control Flow Masks

/**
 * declare invariant
 */
export class DeclareMask extends X.Mask
{
	readonly invariants: X.EntityToken[] = X.unset;
	
	createSchema() { return {
		...X.anchor(X.tokens.declare),
		invariants: X.many(X.EntityToken)
	}}
}

//# Type-related

/** */
export class TypeUnionExpressionMask extends X.TypeExpressionMask
{
	createSchema() { return {
		
	}}
}

/** */
export class TypeIntersectionExpressionMask extends X.TypeExpressionMask
{
	createSchema() { return {
		
	}}
}

/** */
export class ObjectTypeExpressionMask extends X.TypeExpressionMask
{
	createSchema() { return {
		
	}}
}

//# Function-related Masks

/** */
export class ParameterMask extends X.Mask
{
	readonly name: X.EntityToken = X.unset;
}

/** identifier is the_type */
export class TypedParameterMask extends X.ParameterMask
{
	readonly type: X.TypeExpressionMask = X.unset;
	
	createSchema() { return {
		name: X.one(X.EntityToken),
		...X.anchor(X.tokens.is),
		type: X.one(X.TypeExpressionMask),
	}}
}

/** identifier = 1 */
export class DefaultParameterMask extends X.ParameterMask
{
	readonly name: X.EntityToken = X.unset;
	readonly value: X.ExpressionMasks = X.unset;
	
	createSchema() { return {
		name: X.one(X.EntityToken),
		...X.anchor(X.tokens.basicAssign),
		value: X.one(...X.ExpressionMasks),
	}}
}

/** identifier is the_type = 1 */
export class TypedDefaultParameterMask extends X.ParameterMask
{
	readonly name: X.EntityToken = X.unset;
	readonly type: X.TypeExpressionMask = X.unset;
	readonly value: X.ExpressionMasks | null= X.unset;
	
	createSchema() { return {
		name: X.one(X.EntityToken),
		...X.anchor(X.tokens.is),
		type: X.one(X.TypeExpressionMask),
		...X.anchor(X.tokens.basicAssign),
		value: X.one(...X.ExpressionMasks),
	}}
}

/** identifier is the_type = ? */
export class TypedOptionalParameterMask extends X.ParameterMask
{
	readonly name: X.EntityToken = X.unset;
	readonly type: X.TypeExpressionMask = X.unset;
	
	createSchema() { return {
		name: X.one(X.EntityToken),
		...X.anchor(X.tokens.is),
		type: X.one(X.TypeExpressionMask),
		...X.anchor(X.tokens.basicAssign, X.tokens.question),
	}}
}

/** ...identifier is the_type */
export class RestParameterMask extends X.ParameterMask
{
	readonly name: X.EntityToken = X.unset;
	readonly type: X.TypeExpressionMask = X.unset;
	
	createSchema() { return {
		...X.anchor(X.tokens.spread),
		name: X.one(X.EntityToken),
		...X.anchor(X.tokens.is),
		type: X.one(X.TypeExpressionMask),
	}}
}

/** */
export class FunctionMask extends X.Mask
{
	readonly body: Body = X.unset;
}

/** */
export class ConstructorFunctionMask extends FunctionMask
{
	readonly signature: ParameterMask[] = X.unset;
	
	createSchema() { return {
		signature: X.many(ParameterMask).paren(),
		body: reuse.body,
	}}
}

/** */
export class GhostFunctionMask extends FunctionMask
{
	createSchema() { return {
		...X.anchor(X.tokens.ghost),
		body: reuse.body,
	}}
}

/** */
export class StableFunctionMask extends FunctionMask
{
	readonly name: X.EntityToken = X.unset;
	readonly signature: ParameterMask[] = X.unset;
	
	createSchema() { return {
		name: X.one(X.EntityToken),
		signature: X.many(ParameterMask).paren(),
		body: reuse.body,
	}}
};

/** */
export class BuildFunctionMask extends FunctionMask
{
	createSchema() { return {
		...X.anchor(X.tokens.build),
		body: reuse.body,
	}}
}

/** */
export class StartFunctionMask extends FunctionMask
{
	readonly isAnalyzer: boolean = X.unset;
	
	createSchema() { return {
		...X.anchor(X.tokens.start),
		isAnalyzer: X.has(X.tokens.analyzer),
		body: reuse.body,
	}}
}

//# Class body masks

/** */
export class PropertyMask extends X.Mask
{
	
	
	createSchema() { return {
		
	}}
}

/** A mask that defines a field in a class. */
export class FieldMask extends X.Mask
{
	readonly name: X.EntityToken = X.unset;
	readonly access: X.VisibilityKind = X.unset;
	readonly type: X.TypeExpressionMask | null = X.unset;
	readonly value: X.ExpressionMasks | null = X.unset;
	
	createSchema() { return {
		
	}}
}

//# Top Level Masks

/** */
export class FromMask extends X.Mask
{
	readonly name: X.EntityToken = X.unset;
	readonly from: X.RawToken = X.unset;
	
	createSchema() { return {
		name: X.one(X.EntityToken),
		...X.anchor(X.tokens.from),
		from: X.raw(),
	}}
}

/** */
export class WorkerMask extends X.Mask
{
	readonly name: X.EntityToken = X.unset;
	readonly access: X.VisibilityKind = X.unset;
	readonly options: ConstantMask[] = X.unset;
	
	createSchema() { return {
		name: X.one(X.EntityToken),
		...X.anchor(X.tokens.is, X.tokens.worker),
		options: X.many(ConstantMask).paren(),
	}}
}

/** */
export class ClassMask extends X.Mask
{
	readonly name: X.EntityToken = X.unset;
	readonly supers: X.EntityToken[] = X.unset;
	readonly members: X.ClassBodyMasks[] = X.unset;
		
	createSchema() { return {
		name: X.one(X.EntityToken),
		supers: X.many(X.EntityToken).nullable(X.tokens.is),
		members: X.many(...X.ClassBodyMasks).paren()
	}}
}

/** */
export class AliasMask extends X.Mask
{
	readonly name: X.EntityToken = X.unset;
	readonly access: X.VisibilityKind = X.unset;
	readonly type: X.TypeExpressionMask = X.unset;
	
	createSchema() { return {
		name: X.one(X.EntityToken),
		...X.anchor(X.tokens.is, X.tokens.aliasof),
		type: X.one(X.TypeExpressionMask)
	}}
}

/** */
export class OneOfMask extends X.Mask
{
	readonly name: X.EntityToken = X.unset;
	readonly elements: (string | ConstantExpressionMask)[] = X.unset;
	
	createSchema() { return {
		name: X.one(X.EntityToken),
		...X.anchor(X.tokens.is, X.tokens.oneof),
		elements: X.many(X.EntityToken, ConstantExpressionMask).paren()
	}}
}

/** */
export class OneValueOfMask extends X.Mask
{
	readonly name: X.EntityToken = X.unset;
	readonly access: X.VisibilityKind = X.unset;
	readonly elements: ConstantExpressionMask[] = X.unset;
	
	createSchema() { return {
		name: X.one(X.EntityToken),
		...X.anchor(X.tokens.is, X.tokens.onevalueof),
		elements: X.many(ConstantExpressionMask).paren()
	}}
}

/** */
export class ManyOfMask extends X.Mask
{
	readonly name: X.EntityToken = X.unset;
	readonly access: X.VisibilityKind = X.unset;
	readonly elements: (string | ConstantExpressionMask)[] = X.unset;
	
	createSchema() { return {
		name: X.one(X.EntityToken),
		...X.anchor(X.tokens.is, X.tokens.manyof),
		elements: X.many(X.EntityToken, X.ConstantExpressionMask).paren()
	}}
}

//# Top-level Masks (tests)

/** */
export class TestGroupMask extends X.Mask
{
	
	
	createSchema() { return {
		
	}}
}

/** */
export class TestCaseMask extends X.Mask
{
	
	
	createSchema() { return {
		
	}}
}

//# Space Mask

/** */
export class SpaceBodyMask extends X.Mask
{
	readonly members: X.SpaceBodyMasks[] = X.unset;
	
	createSchema() { return {
		members: X.many(...X.SpaceBodyMasks).paren()
	}}
}

/** */
export class SpaceMask extends X.Mask
{
	readonly name: X.EntityToken = X.unset;
	readonly members: X.ToSum<typeof X.SpaceBodyMasks>[] = X.unset;
	
	createSchema() { return {
		name: X.one(X.EntityToken),
		...X.anchor(X.tokens.is, X.tokens.space),
		members: X.many(...X.SpaceBodyMasks).paren()
	}}
}

//# Statements

/**
 * a = b
 * a, b = c
 */
export class SimpleAssignmentMask extends X.Mask
{
	readonly target: X.EntityToken[] = X.unset;
	readonly defer: boolean = X.unset;
	readonly operator: X.AssignerKind = X.unset;
	readonly value: X.TExpressionable = X.unset;
	
	createSchema() { return {
		target: X.many(X.EntityToken),
		defer: X.has(X.tokens.defer),
		operator: X.one(X.AssignerKind),
		value: X.lasso(...X.ExpressionMasks)
	}}
}

/** 
 * a().b = c
 */
export class ComplexAssignmentMask extends X.Mask
{
	readonly particle: X.CompoundParticleMask | X.OriginParticleMask = X.unset;
	readonly operator: X.AssignerKind = X.unset;
	readonly value: X.TExpressionable = X.unset;
	
	createSchema() { return {
		particle: X.one(X.CompoundParticleMask, X.OriginParticleMask),
		operator: X.one(X.AssignerKind),
		value: X.lasso(...X.ExpressionMasks),
	}}
}

/** */
export class ElseIfStatementMask extends X.Mask
{
	readonly condition: X.ControlFlowMask = X.unset;
	readonly body: Body = X.unset;
	
	createSchema() { return {
		...X.anchor(X.tokens.else, X.tokens.if),
		condition: X.one(X.ControlFlowMask),
		body: reuse.body,
	}}
}

/** */
export class ElseStatementMask extends X.Mask
{
	readonly body: Body = X.unset;
	
	createSchema() { return {
		...X.anchor(X.tokens.else),
		body: reuse.body,
	}}
}

/** */
export class IfStatementMask extends X.Mask
{
	readonly condition: X.ControlFlowMask = X.unset;
	readonly body: Body = X.unset;
	readonly elseifs: ElseIfStatementMask[] = X.unset;
	readonly else: ElseStatementMask | null = X.unset;
	
	createSchema() { return {
		...X.anchor(X.tokens.if),
		condition: X.one(X.ControlFlowMask),
		body: reuse.body,
		elseifs: X.many(X.ElseIfStatementMask),
		else: X.one(ElseStatementMask).nullable(),
	}}
}

/** */
export class BreakStatementMask extends X.Mask
{
	readonly kind: X.BreakKind = X.unset;
	readonly expression: X.ExpressionMasks = X.unset;
	
	createSchema() { return {
		kind: X.one(X.BreakKind),
		expression: X.lasso(...X.ExpressionMasks)
	}}
}

/** */
export class ContinueStatementMask extends X.Mask
{
	readonly kind: X.ContinueKind = X.unset;
	readonly expression: X.ExpressionMasks = X.unset;
	
	createSchema() { return {
		kind: X.one(X.ContinueKind),
		expression: X.lasso(...X.ExpressionMasks)
	}}
}

/** */
export class YieldStatementMask extends X.Mask
{
	readonly kind: X.YieldKind = X.unset;
	readonly expression: X.ExpressionMasks = X.unset;
	
	createSchema() { return {
		kind: X.one(X.YieldKind),
		expression: X.lasso(...X.ExpressionMasks)
	}}
}

/** */
export class ReturnStatementMask extends X.Mask
{
	readonly expression: X.ExpressionMasks = X.unset;
	
	createSchema() { return {
		...X.anchor(X.tokens.return),
		expression: X.lasso(...X.ExpressionMasks)
	}}
}

/** */
export class EnsureStatementMask extends X.Mask
{
	readonly expression: X.ExpressionMasks = X.unset;
	
	createSchema() { return {
		...X.anchor(X.tokens.ensure),
		expression: X.lasso(...X.ExpressionMasks)
	}}
}

/** */
export class ThrowStatementMask extends X.Mask
{
	readonly expression: X.ExpressionMasks = X.unset;
	
	createSchema() { return {
		...X.anchor(X.tokens.throw),
		expression: X.lasso(...X.ExpressionMasks),
	}}
}

/** */
export class CommentStatementMask extends X.Mask
{
	readonly content: X.RawToken = X.unset;
	
	createSchema() { return {
		...X.anchor(X.tokens.comment),
		content: X.raw(),
	}}
}

/** Generic statement-level container for an expression. */
export class ExpressionStatementMask extends X.Mask
{
	readonly expression: X.TExpressionable = X.unset;
	
	createSchema() { return {
		expression: X.lasso(X.EntityToken, X.LiteralToken, ...X.ExpressionMasks),
	}}
}

//# Suffixes

/** */
export class EachMask extends X.Mask
{
	readonly prefix: X.TExpressionable = X.unset;
	readonly entities: X.EntityToken[] = X.unset;
	readonly body: Body = X.unset;
	
	createSchema(): X.TMaskSchema { return {
		[X.schemaOptions]: {
			suffix: true,
		},
		prefix: X.lasso(...X.ExpressionMasks),
		...X.anchor(X.tokens.each),
		entities: X.many(X.EntityToken),
		body: reuse.body,
	}}
}

/** */
export class MatchesMask extends X.Mask
{
	createSchema() { return {
		[X.schemaOptions]: {
			suffix: true,
		},
		...X.anchor(X.tokens.matches),
	}}
}

//# Expressions

/** */
export class RangeExpressionMask extends X.Mask
{
	readonly from: X.TExpressionable = X.unset;
	readonly kind: X.RangeKind = X.unset;
	readonly to: X.TExpressionable = X.unset;
	readonly step: X.TExpressionable | null = X.unset;
	
	createSchema(): X.TMaskSchema { return {
		from: X.expressionable(),
		kind: X.one(X.RangeKind),
		to: X.expressionable(),
		step: X.expressionable().nullable(X.tokens.step)
	}}
}

/** */
export class BuildExpressionMask extends X.Mask
{
	createSchema() { return {
		
	}}
}

/** */
export class TernaryExpressionMask extends X.Mask
{
	readonly condition: X.TExpressionable = X.unset;
	readonly pass: X.ExpressionMasks = X.unset;
	readonly fail: X.ExpressionMasks = X.unset;
	
	createSchema(): X.TMaskSchema { return {
		prefix: X.expressionable(),
		...X.anchor(X.tokens.question),
		pass: X.one(...X.ExpressionMasks),
		...X.anchor(X.tokens.colon),
		fail: X.one(...X.ExpressionMasks),
	}}
}

/** */
export class SpreadExpressionMask extends X.Mask
{
	readonly target: X.TExpressionable = X.unset;
	
	createSchema(): X.TMaskSchema { return {
		...X.anchor(X.tokens.spread),
		target: X.expressionable(),
	}}
}

/** (x) */
export class FunctionActivatorMask extends X.EnclosureMask
{
	readonly content: X.ExpressionMasks[] = X.unset;
	
	createSchemaEnclosed() { return {
		enclosure: X.Enclosure.paren,
		content: X.many(...X.ExpressionMasks),
	}}
}

/** [x] */
export class IndexActivatorMask extends X.EnclosureMask
{
	readonly content: X.ExpressionMasks = X.unset;
	
	createSchemaEnclosed() { return {
		enclosure: X.Enclosure.bracket,
		content: X.many(...X.ExpressionMasks),
	}}
}

/** term(x)[x].term(x)[x] */
export class CompoundParticleMask extends X.Mask
{
	readonly origin: OriginParticleMask = X.unset;
	readonly posts: PostParticleMask[] = X.unset;
	
	createSchema() { return {
		[X.schemaOptions]: {
			sparse: true,
		},
		origin: X.one(X.OriginParticleMask),
		posts: X.some(X.PostParticleMask),
	}}
}

/** term(x)(x)[x][x] */
export class OriginParticleMask extends X.Mask
{
	readonly term: X.EntityToken | X.ParticleLiteralToken | X.ControlFlowMask = X.unset;
	readonly activators: (X.FunctionActivatorMask | X.IndexActivatorMask)[] = X.unset;
	
	createSchema(): X.TMaskSchema { return {
		[X.schemaOptions]: {
			sparse: true,
		},
		term: X.one(X.EntityToken, X.ParticleLiteralToken, X.ControlFlowMask),
		activators: X.many(X.FunctionActivatorMask, X.IndexActivatorMask),
	}}
}

/** .term(x)(x)[x][x] */
export class PostParticleMask extends X.Mask
{
	readonly term: X.EntityToken | X.ParticleLiteralToken = X.unset;
	readonly activators: (X.FunctionActivatorMask | X.IndexActivatorMask)[] = X.unset;
	
	createSchema() { return {
		...X.anchor(X.tokens.dot),
		term: X.one(X.EntityToken, X.ParticleLiteralToken),
		activators: X.many(X.FunctionActivatorMask, X.IndexActivatorMask),
	}}
}

/**
 * + particle
 * + ( ... deep nesting ... )
 * */
export class InfixedParticleMask extends X.Mask
{
	readonly operator: X.InfixOperatorKind = X.unset;
	readonly particle: (CompoundParticleMask | OriginParticleMask) = X.unset;
	
	createSchema() { return {
		operator: X.one(X.InfixOperatorKind),
		particle: X.one(X.CompoundParticleMask, X.OriginParticleMask),
	}}
}

/** term + term + term */
export class InfixedChainMask extends X.Mask
{
	readonly origin: (X.CompoundParticleMask | X.OriginParticleMask) = X.unset;
	readonly successors: InfixedParticleMask[] = X.unset;
	
	createSchema() { return {
		[X.schemaOptions]: {
			sparse: true,
		},
		origin: X.one(CompoundParticleMask, OriginParticleMask),
		successors: X.some(InfixedParticleMask),
	}}
}

//# Types (implement these)

/*
ExtractFunctionArgumentsTypeExpression
ExtractFunctionReturnTypeExpression
ExtractMethodTypeExpression
ExtractPropertyTypeExpression
TypeExtractionExpression
TypeIntersectionExpression
TypeUnionExpression
*/
