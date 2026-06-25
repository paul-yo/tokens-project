import * as X from "./X.ts";

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
	
	enclosureSchema() { return {
		enclosure: X.TapeKind.paren,
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
	schema() { return {
		
	}}
}

//# Generic Masks

/** ?? */
export class ConstantMask extends X.Mask
{
	schema() { return {
		
	}}
}

/** ?? */
export class ConstantExpressionMask extends X.Mask
{
	schema() { return {
		
	}}
}

/** */
export class CommentMask extends X.Mask
{
	readonly text: X.RawToken = X.unset;
	
	schema() { return {
		...X.structural(X.tokens.comment),
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
	
	schema() { return {
		...X.structural(X.tokens.declare),
		invariants: X.many(X.EntityToken)
	}}
}

//# Type-related

/** */
export class TypeUnionExpressionMask extends X.TypeExpressionMask
{
	schema() { return {
		
	}}
}

/** */
export class TypeIntersectionExpressionMask extends X.TypeExpressionMask
{
	schema() { return {
		
	}}
}

/** */
export class ObjectTypeExpressionMask extends X.TypeExpressionMask
{
	schema() { return {
		
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
	
	schema() { return {
		name: X.one(X.EntityToken),
		...X.structural(X.tokens.is),
		type: X.one(X.TypeExpressionMask),
	}}
}

/** identifier = 1 */
export class DefaultParameterMask extends X.ParameterMask
{
	readonly name: X.EntityToken = X.unset;
	readonly value: X.ExpressionMasks = X.unset;
	
	schema() { return {
		name: X.one(X.EntityToken),
		...X.structural(X.tokens.basicAssign),
		value: X.one(...X.ExpressionMasks),
	}}
}

/** identifier is the_type = 1 */
export class TypedDefaultParameterMask extends X.ParameterMask
{
	readonly name: X.EntityToken = X.unset;
	readonly type: X.TypeExpressionMask = X.unset;
	readonly value: X.ExpressionMasks | null= X.unset;
	
	schema() { return {
		name: X.one(X.EntityToken),
		...X.structural(X.tokens.is),
		type: X.one(X.TypeExpressionMask),
		...X.structural(X.tokens.basicAssign),
		value: X.one(...X.ExpressionMasks),
	}}
}

/** identifier is the_type = ? */
export class TypedOptionalParameterMask extends X.ParameterMask
{
	readonly name: X.EntityToken = X.unset;
	readonly type: X.TypeExpressionMask = X.unset;
	
	schema() { return {
		name: X.one(X.EntityToken),
		...X.structural(X.tokens.is),
		type: X.one(X.TypeExpressionMask),
		...X.structural(X.tokens.basicAssign, X.tokens.question),
	}}
}

/** ...identifier is the_type */
export class RestParameterMask extends X.ParameterMask
{
	readonly name: X.EntityToken = X.unset;
	readonly type: X.TypeExpressionMask = X.unset;
	
	schema() { return {
		...X.structural(X.tokens.spread),
		name: X.one(X.EntityToken),
		...X.structural(X.tokens.is),
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
	
	schema() { return {
		signature: X.many(ParameterMask).paren(),
		body: reuse.body,
	}}
}

/** */
export class GhostFunctionMask extends FunctionMask
{
	schema() { return {
		...X.structural(X.tokens.ghost),
		body: reuse.body,
	}}
}

/** */
export class StableFunctionMask extends FunctionMask
{
	readonly name: X.EntityToken = X.unset;
	readonly signature: ParameterMask[] = X.unset;
	
	schema() { return {
		name: X.one(X.EntityToken),
		signature: X.many(ParameterMask).paren(),
		body: reuse.body,
	}}
};

/** */
export class BuildFunctionMask extends FunctionMask
{
	schema() { return {
		...X.structural(X.tokens.build),
		body: reuse.body,
	}}
}

/** */
export class StartFunctionMask extends FunctionMask
{
	readonly isAnalyzer: boolean = X.unset;
	
	schema() { return {
		...X.structural(X.tokens.start),
		isAnalyzer: X.has(X.tokens.analyzer),
		body: reuse.body,
	}}
}

//# Class body masks

/** */
export class PropertyMask extends X.Mask
{
	
	
	schema() { return {
		
	}}
}

/** A mask that defines a field in a class. */
export class FieldMask extends X.Mask
{
	readonly name: X.EntityToken = X.unset;
	readonly access: X.VisibilityKind = X.unset;
	readonly type: X.TypeExpressionMask | null = X.unset;
	readonly value: X.ExpressionMasks | null = X.unset;
	
	schema() { return {
		
	}}
}

//# Top Level Masks

/** */
export class FromMask extends X.Mask
{
	readonly name: X.EntityToken = X.unset;
	readonly from: X.RawToken = X.unset;
	
	schema() { return {
		name: X.one(X.EntityToken),
		...X.structural(X.tokens.from),
		from: X.raw(),
	}}
}

/** */
export class WorkerMask extends X.Mask
{
	readonly name: X.EntityToken = X.unset;
	readonly access: X.VisibilityKind = X.unset;
	readonly options: ConstantMask[] = X.unset;
	
	schema() { return {
		name: X.one(X.EntityToken),
		...X.structural(X.tokens.is, X.tokens.worker),
		options: X.many(ConstantMask).paren(),
	}}
}

/** */
export class ClassMask extends X.Mask
{
	readonly name: X.EntityToken = X.unset;
	readonly supers: X.EntityToken[] = X.unset;
	readonly members: X.ClassBodyMasks[] = X.unset;
		
	schema() { return {
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
	
	schema() { return {
		name: X.one(X.EntityToken),
		...X.structural(X.tokens.is, X.tokens.aliasof),
		type: X.one(X.TypeExpressionMask)
	}}
}

/** */
export class OneOfMask extends X.Mask
{
	readonly name: X.EntityToken = X.unset;
	readonly elements: (string | ConstantExpressionMask)[] = X.unset;
	
	schema() { return {
		name: X.one(X.EntityToken),
		...X.structural(X.tokens.is, X.tokens.oneof),
		elements: X.many(X.EntityToken, ConstantExpressionMask).paren()
	}}
}

/** */
export class OneValueOfMask extends X.Mask
{
	readonly name: X.EntityToken = X.unset;
	readonly access: X.VisibilityKind = X.unset;
	readonly elements: ConstantExpressionMask[] = X.unset;
	
	schema() { return {
		name: X.one(X.EntityToken),
		...X.structural(X.tokens.is, X.tokens.onevalueof),
		elements: X.many(ConstantExpressionMask).paren()
	}}
}

/** */
export class ManyOfMask extends X.Mask
{
	readonly name: X.EntityToken = X.unset;
	readonly access: X.VisibilityKind = X.unset;
	readonly elements: (string | ConstantExpressionMask)[] = X.unset;
	
	schema() { return {
		name: X.one(X.EntityToken),
		...X.structural(X.tokens.is, X.tokens.manyof),
		elements: X.many(X.EntityToken, X.ConstantExpressionMask).paren()
	}}
}

//# Top-level Masks (tests)

/** */
export class TestGroupMask extends X.Mask
{
	
	
	schema() { return {
		
	}}
}

/** */
export class TestCaseMask extends X.Mask
{
	
	
	schema() { return {
		
	}}
}

//# Space Mask

/** */
export class SpaceBodyMask extends X.Mask
{
	readonly members: X.SpaceBodyMasks[] = X.unset;
	
	schema() { return {
		members: X.many(...X.SpaceBodyMasks).paren()
	}}
}

/** */
export class SpaceMask extends X.Mask
{
	readonly name: X.EntityToken = X.unset;
	readonly members: X.ToSum<typeof X.SpaceBodyMasks>[] = X.unset;
	
	schema() { return {
		name: X.one(X.EntityToken),
		...X.structural(X.tokens.is, X.tokens.space),
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
	
	schema() { return {
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
	
	schema() { return {
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
	
	schema() { return {
		...X.structural(X.tokens.else, X.tokens.if),
		condition: X.one(X.ControlFlowMask),
		body: reuse.body,
	}}
}

/** */
export class ElseStatementMask extends X.Mask
{
	readonly body: Body = X.unset;
	
	schema() { return {
		...X.structural(X.tokens.else),
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
	
	schema() { return {
		...X.structural(X.tokens.if),
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
	
	schema() { return {
		kind: X.one(X.BreakKind),
		expression: X.lasso(...X.ExpressionMasks)
	}}
}

/** */
export class ContinueStatementMask extends X.Mask
{
	readonly kind: X.ContinueKind = X.unset;
	readonly expression: X.ExpressionMasks = X.unset;
	
	schema() { return {
		kind: X.one(X.ContinueKind),
		expression: X.lasso(...X.ExpressionMasks)
	}}
}

/** */
export class YieldStatementMask extends X.Mask
{
	readonly kind: X.YieldKind = X.unset;
	readonly expression: X.ExpressionMasks = X.unset;
	
	schema() { return {
		kind: X.one(X.YieldKind),
		expression: X.lasso(...X.ExpressionMasks)
	}}
}

/** */
export class ReturnStatementMask extends X.Mask
{
	readonly expression: X.ExpressionMasks = X.unset;
	
	schema() { return {
		...X.structural(X.tokens.return),
		expression: X.lasso(...X.ExpressionMasks)
	}}
}

/** */
export class EnsureStatementMask extends X.Mask
{
	readonly expression: X.ExpressionMasks = X.unset;
	
	schema() { return {
		...X.structural(X.tokens.ensure),
		expression: X.lasso(...X.ExpressionMasks)
	}}
}

/** */
export class ThrowStatementMask extends X.Mask
{
	readonly expression: X.ExpressionMasks = X.unset;
	
	schema() { return {
		...X.structural(X.tokens.throw),
		expression: X.lasso(...X.ExpressionMasks),
	}}
}

/** */
export class CommentStatementMask extends X.Mask
{
	readonly content: X.RawToken = X.unset;
	
	schema() { return {
		...X.structural(X.tokens.comment),
		content: X.raw(),
	}}
}

/** Generic statement-level container for an expression. */
export class ExpressionStatementMask extends X.Mask
{
	readonly expression: X.TExpressionable = X.unset;
	
	schema() { return {
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
	
	schema(): X.TMaskSchemaObject { return {
		[X.schemaOptions]: {
			suffix: true,
		},
		prefix: X.lasso(...X.ExpressionMasks),
		...X.structural(X.tokens.each),
		entities: X.many(X.EntityToken),
		body: reuse.body,
	}}
}

/** */
export class MatchesMask extends X.Mask
{
	schema() { return {
		[X.schemaOptions]: {
			suffix: true,
		},
		...X.structural(X.tokens.matches),
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
	
	schema(): X.TMaskSchemaObject { return {
		from: X.expressionable(),
		kind: X.one(X.RangeKind),
		to: X.expressionable(),
		step: X.expressionable().nullable(X.tokens.step)
	}}
}

/** */
export class BuildExpressionMask extends X.Mask
{
	schema() { return {
		
	}}
}

/** */
export class TernaryExpressionMask extends X.Mask
{
	readonly condition: X.TExpressionable = X.unset;
	readonly pass: X.ExpressionMasks = X.unset;
	readonly fail: X.ExpressionMasks = X.unset;
	
	schema(): X.TMaskSchemaObject { return {
		prefix: X.expressionable(),
		...X.structural(X.tokens.question),
		pass: X.one(...X.ExpressionMasks),
		...X.structural(X.tokens.colon),
		fail: X.one(...X.ExpressionMasks),
	}}
}

/** */
export class SpreadExpressionMask extends X.Mask
{
	readonly target: X.TExpressionable = X.unset;
	
	schema(): X.TMaskSchemaObject { return {
		...X.structural(X.tokens.spread),
		target: X.expressionable(),
	}}
}

/** (x) */
export class FunctionActivatorMask extends X.EnclosureMask
{
	readonly content: X.ExpressionMasks[] = X.unset;
	
	enclosureSchema() { return {
		enclosure: X.TapeKind.paren,
		content: X.many(...X.ExpressionMasks),
	}}
}

/** [x] */
export class IndexActivatorMask extends X.EnclosureMask
{
	readonly content: X.ExpressionMasks = X.unset;
	
	enclosureSchema() { return {
		enclosure: X.TapeKind.bracket,
		content: X.many(...X.ExpressionMasks),
	}}
}

/** term(x)[x].term(x)[x] */
export class CompoundParticleMask extends X.Mask
{
	readonly origin: OriginParticleMask = X.unset;
	readonly posts: PostParticleMask[] = X.unset;
	
	schema() { return {
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
	
	schema(): X.TMaskSchemaObject { return {
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
	
	schema() { return {
		...X.structural(X.tokens.dot),
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
	
	schema() { return {
		operator: X.one(X.InfixOperatorKind),
		particle: X.one(X.CompoundParticleMask, X.OriginParticleMask),
	}}
}

/** term + term + term */
export class InfixedChainMask extends X.Mask
{
	readonly origin: (X.CompoundParticleMask | X.OriginParticleMask) = X.unset;
	readonly successors: InfixedParticleMask[] = X.unset;
	
	schema() { return {
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
