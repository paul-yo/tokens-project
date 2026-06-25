import * as X from "./X.ts";

//# Base Classes

/** */
export abstract class Token
{
	/** Stores the same string as format. Used for structural normalization. */
	abstract readonly text: string;
}

/** */
export class FixedToken extends Token
{
	/** Returns a reference to the static token with the specified text. */
	static get(text: string)
	{
		const token = this.all.get(text);
		if (!token)
			throw "Unknown token: " + token;
		
		return token;
	}
	
	private static readonly all = new Map<string, FixedToken>();
		
	/** */
	static new<T extends FixedToken>(this: new (text: string) => T, text: string): T
	{
		const token = new this(text);
		FixedToken.all.set(text, token);
		return token;
	}
	
	/** */
	constructor(text: string)
	{
		super();
		this.text = text;
	}
	
	/** Stores the same string as format. Used for structural normalization. */
	readonly text: string;
}

/**  */
interface IPlainFlexToken
{
	readonly debugDescription?: string;
	readonly id: number;
	readonly text: string;
}

/** */
export abstract class FlexToken extends Token
{
	/** */
	static new<T extends FlexToken>(
		this: new () => T,
		text: string): T
	{
		const chain = X.getInheritanceChain(this) as any as typeof FlexToken[];
		const id = chain.reduce((acc, cls) => acc | (flexTypeBitsMap.get(cls) || 0), 0);
		const plainToken: IPlainFlexToken = { id, text, debugDescription: this.name };
		return plainToken as any as T;
	}
	
	/** 
	 * Returns the type of the specified flex token.
	 */
	static typeof(flex: FlexToken): typeof FlexToken | null
	{
		const plain = asPlain(flex);
		if (!plain)
			return null;
		
		// The id is a bitfield with one bit per type in the inheritance chain.
		// Find the highest set bit — that corresponds to the most-derived type,
		// since types are registered leaf-last in the setup loop.
		let remaining = plain.id;
		let highestBit = 0;
		
		while (remaining)
		{
			const bit = remaining & -remaining; // isolate lowest set bit
			highestBit = bit;
			remaining &= remaining - 1; // clear lowest set bit
		}
		
		return highestBit ? (bitsFlexTypeMap.get(highestBit) ?? null) : null;
	}
	
	/** Guard function that returns whether the specified object is a typeof FlexToken. */
	static isType(maybeType: any): maybeType is typeof FlexToken
	{
		return flexTypeBitsMap.has(maybeType);
	}
	
	/** */
	static [Symbol.hasInstance](other: any)
	{
		return !!asPlain(other);
	}
	
	/** */
	constructor()
	{
		super();
		throw "Do not call this constructor. Instead call FlexToken.new().";
	}
	
	/** */
	static readonly pattern: RegExp | null = null;
	
	/** Stores the same string as format. Used for structural normalization. */
	readonly text: string;
}

/** */
export abstract class RawToken extends Token
{
	/** */
	static new(text: string)
	{
		return { id: -1, text } as any as RawToken;
	}
	
	/** */
	[Symbol.hasInstance](other: any)
	{
		return !!other && 
			typeof other === "object" &&
			other.id === -1 &&
			typeof other.text === "string";
	}
	
	abstract readonly text: string;
}

//# Flex Token Types

export abstract class FlexDelimiterToken extends FlexToken { }

export class MarkupOpenToken extends FlexDelimiterToken
{
	static readonly pattern = /<[A-Za-z][A-Za-z0-9_]{0,}/u;
}
export class MarkupStartToken extends FlexDelimiterToken
{
	static readonly pattern = /<[A-Za-z][A-Za-z0-9_]{0,}>/u;
}
export class MarkupEndToken extends FlexDelimiterToken
{
	static readonly pattern = /<\/[A-Za-z][A-Za-z0-9_]{0,}>/u;
}
export class MarkupAttrStartToken extends FlexDelimiterToken
{
	static readonly pattern = /[A-Za-z0-9]+=/u;
}

export abstract class WhitespaceToken extends FlexToken { }

export class SpaceToken extends WhitespaceToken
{
	static readonly pattern = /[ \t]{1}[ \t]*/u;
}
export class NewlineToken extends WhitespaceToken
{
	static readonly pattern = /\r?\n/u;
}

export class EntityToken extends FlexToken
{ 
	static readonly pattern = /[a-zA-Z]{1,}[a-zA-Z0-9_]{0,}/u;
}

export abstract class LiteralToken extends FlexToken { }

/** 
 * Literal tokens can't be ParticleLiteralTokens because they can't
 * have accessors (.) after them. The other things can.
 */
export class IntegerToken extends LiteralToken
{
	static readonly pattern = /-?(?:0|[1-9][0-9]*(?:_+[0-9]+)*)/u;
}

/** Abstract base class for FlexTokens that are potential particles. */
export abstract class ParticleLiteralToken extends LiteralToken { }

export class UnsignedIntegerToken extends ParticleLiteralToken
{
	//static readonly pattern = /[1-9][0-9]*u/u;
	static readonly pattern = /^(?:0|[1-9][0-9]*(?:_+[0-9]+)*)u$/u;
}
export class DecimalToken extends ParticleLiteralToken
{
	//static readonly pattern = /[0-9]{1,}\.[0-9]{1,}/u;
	static readonly pattern = /(?:0|[1-9][0-9]*(?:_+[0-9]+)*)\.[0-9]+(?:_+[0-9]+)*/u;
}
export class Float32Token extends ParticleLiteralToken
{
	//static readonly pattern = /[0-9]{1,}\.[0-9]{1,}f/u;
	static readonly pattern = /(?:0|[1-9][0-9]*(?:_+[0-9]+)*)\.[0-9]+(?:_+[0-9]+)*f/u;
}
export class Float64Token extends ParticleLiteralToken
{
	//static readonly pattern = /[0-9]{1,}\.[0-9]{1,}ff/u;
	static readonly pattern = /(?:0|[1-9][0-9]*(?:_+[0-9]+)*)\.[0-9]+(?:_+[0-9]+)*ff/u;
}
export class Float128Token extends ParticleLiteralToken
{
	//static readonly pattern = /[0-9]{1,}\.[0-9]{1,}fff/u;
	static readonly pattern = /(?:0|[1-9][0-9]*(?:_+[0-9]+)*)\.[0-9]+(?:_+[0-9]+)*fff/u;
}
export class QuantityToken extends ParticleLiteralToken
{
	//static readonly pattern = /[0-9]+\.?[0-9]*[a-zA-Z][a-zA-Z0-9_]*/u;
	static readonly pattern = /(?:0|[1-9][0-9]*(?:_+[0-9]+)*)(?:\.[0-9]+(?:_+[0-9]+)*)?[a-zA-Z][a-zA-Z0-9_]*/u;
}
export class HexToken extends ParticleLiteralToken
{
	//static readonly pattern = /0x[0-9A-Fa-f]{1,}/u;
	static readonly pattern = /0x[0-9A-Fa-f]+(?:_+[0-9A-Fa-f]+)*/u;
}
export class CharToken extends ParticleLiteralToken
{
	static readonly pattern = /'(?:[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF])'/u;
}
export class RegexToken extends ParticleLiteralToken
{
	static readonly pattern = /\/{1,}\//u;
}

export const flexTokens = Object.freeze({
	entity: EntityToken,
	
	// Literals - Particles
	quantity: QuantityToken,
	unsignedInteger: UnsignedIntegerToken,
	decimal: DecimalToken,
	float32: Float32Token,
	float64: Float64Token,
	float128: Float128Token,
	hex: HexToken,
	char: CharToken,
	regex: RegexToken,
	
	// Literals - Other
	integer: IntegerToken,
	
	// Markup
	markupOpen: MarkupOpenToken,
	markupStart: MarkupStartToken,
	markupEnd: MarkupEndToken,
	markupAttrStart: MarkupAttrStartToken,
	
	// White space
	space: SpaceToken,
	newline: NewlineToken,
});

/** */
export const flexTokensAbstract = Object.freeze({
	literal: LiteralToken,
	particle: ParticleLiteralToken,
	whitespace: WhitespaceToken,
	delimiter: FlexDelimiterToken, 
});

//# Fixed Token Types

export class PrimitiveToken extends FixedToken { }
export class PrimitiveIntToken extends PrimitiveToken { }
export class PrimitiveUintToken extends PrimitiveToken { }
export class PrimitiveFloatToken extends PrimitiveToken { }
export class PrimitiveBigToken extends PrimitiveToken { }
export class PrimitiveOtherToken extends PrimitiveToken { }
export class WordToken extends FixedToken { }
export class ValueToken extends FixedToken { }
export class SymbolToken extends FixedToken { }
export class AssignerToken extends FixedToken { }
export class OperatorToken extends FixedToken { }
export class OperatorsFrozenToken extends OperatorToken { }
export class OperatorsOverloadableToken extends OperatorToken { }
export class SuffixToken extends FixedToken { }
export class PrefixToken extends FixedToken { }

const primitives = Object.freeze({
	ints: Object.freeze({
		int: new FixedToken("int"),
		int128: new FixedToken("i128"),
		int128x1: new FixedToken("i128.1"),
		int128x10: new FixedToken("i128.10"),
		int128x11: new FixedToken("i128.11"),
		int128x12: new FixedToken("i128.12"),
		int128x13: new FixedToken("i128.13"),
		int128x14: new FixedToken("i128.14"),
		int128x15: new FixedToken("i128.15"),
		int128x16: new FixedToken("i128.16"),
		int128x17: new FixedToken("i128.17"),
		int128x18: new FixedToken("i128.18"),
		int128x19: new FixedToken("i128.19"),
		int128x2: new FixedToken("i128.2"),
		int128x20: new FixedToken("i128.20"),
		int128x21: new FixedToken("i128.21"),
		int128x22: new FixedToken("i128.22"),
		int128x23: new FixedToken("i128.23"),
		int128x24: new FixedToken("i128.24"),
		int128x25: new FixedToken("i128.25"),
		int128x26: new FixedToken("i128.26"),
		int128x27: new FixedToken("i128.27"),
		int128x28: new FixedToken("i128.28"),
		int128x29: new FixedToken("i128.29"),
		int128x3: new FixedToken("i128.3"),
		int128x30: new FixedToken("i128.30"),
		int128x31: new FixedToken("i128.31"),
		int128x32: new FixedToken("i128.32"),
		int128x33: new FixedToken("i128.33"),
		int128x34: new FixedToken("i128.34"),
		int128x35: new FixedToken("i128.35"),
		int128x36: new FixedToken("i128.36"),
		int128x37: new FixedToken("i128.37"),
		int128x38: new FixedToken("i128.38"),
		int128x39: new FixedToken("i128.39"),
		int128x4: new FixedToken("i128.4"),
		int128x5: new FixedToken("i128.5"),
		int128x6: new FixedToken("i128.6"),
		int128x7: new FixedToken("i128.7"),
		int128x8: new FixedToken("i128.8"),
		int128x9: new FixedToken("i128.9"),
		int16: new FixedToken("i16"),
		int16x1: new FixedToken("i16.1"),
		int16x2: new FixedToken("i16.2"),
		int16x3: new FixedToken("i16.3"),
		int16x4: new FixedToken("i16.4"),
		int16x5: new FixedToken("i16.5"),
		int32: new FixedToken("i32"),
		int32x1: new FixedToken("i32.1"),
		int32x10: new FixedToken("i32.10"),
		int32x2: new FixedToken("i32.2"),
		int32x3: new FixedToken("i32.3"),
		int32x4: new FixedToken("i32.4"),
		int32x5: new FixedToken("i32.5"),
		int32x6: new FixedToken("i32.6"),
		int32x7: new FixedToken("i32.7"),
		int32x8: new FixedToken("i32.8"),
		int32x9: new FixedToken("i32.9"),
		int64: new FixedToken("i64"),
		int64x1: new FixedToken("i64.1"),
		int64x10: new FixedToken("i64.10"),
		int64x11: new FixedToken("i64.11"),
		int64x12: new FixedToken("i64.12"),
		int64x13: new FixedToken("i64.13"),
		int64x14: new FixedToken("i64.14"),
		int64x15: new FixedToken("i64.15"),
		int64x16: new FixedToken("i64.16"),
		int64x17: new FixedToken("i64.17"),
		int64x18: new FixedToken("i64.18"),
		int64x19: new FixedToken("i64.19"),
		int64x2: new FixedToken("i64.2"),
		int64x3: new FixedToken("i64.3"),
		int64x4: new FixedToken("i64.4"),
		int64x5: new FixedToken("i64.5"),
		int64x6: new FixedToken("i64.6"),
		int64x7: new FixedToken("i64.7"),
		int64x8: new FixedToken("i64.8"),
		int64x9: new FixedToken("i64.9"),
		int8: new FixedToken("i8"),
		int8x1: new FixedToken("i8.1"),
		int8x2: new FixedToken("i8.2"),
		int8x3: new FixedToken("i8.3"),
	}),
	uints: Object.freeze({
		uint128: new FixedToken("u128"),
		uint128x1: new FixedToken("u128.1"),
		uint128x10: new FixedToken("u128.10"),
		uint128x11: new FixedToken("u128.11"),
		uint128x12: new FixedToken("u128.12"),
		uint128x13: new FixedToken("u128.13"),
		uint128x14: new FixedToken("u128.14"),
		uint128x15: new FixedToken("u128.15"),
		uint128x16: new FixedToken("u128.16"),
		uint128x17: new FixedToken("u128.17"),
		uint128x18: new FixedToken("u128.18"),
		uint128x19: new FixedToken("u128.19"),
		uint128x2: new FixedToken("u128.2"),
		uint128x20: new FixedToken("u128.20"),
		uint128x21: new FixedToken("u128.21"),
		uint128x22: new FixedToken("u128.22"),
		uint128x23: new FixedToken("u128.23"),
		uint128x24: new FixedToken("u128.24"),
		uint128x25: new FixedToken("u128.25"),
		uint128x26: new FixedToken("u128.26"),
		uint128x27: new FixedToken("u128.27"),
		uint128x28: new FixedToken("u128.28"),
		uint128x29: new FixedToken("u128.29"),
		uint128x3: new FixedToken("u128.3"),
		uint128x30: new FixedToken("u128.30"),
		uint128x31: new FixedToken("u128.31"),
		uint128x32: new FixedToken("u128.32"),
		uint128x33: new FixedToken("u128.33"),
		uint128x34: new FixedToken("u128.34"),
		uint128x35: new FixedToken("u128.35"),
		uint128x36: new FixedToken("u128.36"),
		uint128x37: new FixedToken("u128.37"),
		uint128x38: new FixedToken("u128.38"),
		uint128x39: new FixedToken("u128.39"),
		uint128x4: new FixedToken("u128.4"),
		uint128x5: new FixedToken("u128.5"),
		uint128x6: new FixedToken("u128.6"),
		uint128x7: new FixedToken("u128.7"),
		uint128x8: new FixedToken("u128.8"),
		uint128x9: new FixedToken("u128.9"),
		uint16: new FixedToken("u16"),
		uint16x1: new FixedToken("u16.1"),
		uint16x2: new FixedToken("u16.2"),
		uint16x3: new FixedToken("u16.3"),
		uint16x4: new FixedToken("u16.4"),
		uint16x5: new FixedToken("u16.5"),
		uint32: new FixedToken("u32"),
		uint32x1: new FixedToken("u32.1"),
		uint32x10: new FixedToken("u32.10"),
		uint32x2: new FixedToken("u32.2"),
		uint32x3: new FixedToken("u32.3"),
		uint32x4: new FixedToken("u32.4"),
		uint32x5: new FixedToken("u32.5"),
		uint32x6: new FixedToken("u32.6"),
		uint32x7: new FixedToken("u32.7"),
		uint32x8: new FixedToken("u32.8"),
		uint32x9: new FixedToken("u32.9"),
		uint64: new FixedToken("u64"),
		uint64x1: new FixedToken("u64.1"),
		uint64x10: new FixedToken("u64.10"),
		uint64x11: new FixedToken("u64.11"),
		uint64x12: new FixedToken("u64.12"),
		uint64x13: new FixedToken("u64.13"),
		uint64x14: new FixedToken("u64.14"),
		uint64x15: new FixedToken("u64.15"),
		uint64x16: new FixedToken("u64.16"),
		uint64x17: new FixedToken("u64.17"),
		uint64x18: new FixedToken("u64.18"),
		uint64x19: new FixedToken("u64.19"),
		uint64x2: new FixedToken("u64.2"),
		uint64x3: new FixedToken("u64.3"),
		uint64x4: new FixedToken("u64.4"),
		uint64x5: new FixedToken("u64.5"),
		uint64x6: new FixedToken("u64.6"),
		uint64x7: new FixedToken("u64.7"),
		uint64x8: new FixedToken("u64.8"),
		uint64x9: new FixedToken("u64.9"),
		uint8: new FixedToken("u8"),
		uint8x1: new FixedToken("u8.1"),
		uint8x2: new FixedToken("u8.2"),
		uint8x3: new FixedToken("u8.3"),
		uint: new FixedToken("uint"),
	}),
	floats: Object.freeze({
		float16: new FixedToken("f16"),
		float32: new FixedToken("f32"),
		float64: new FixedToken("f64"),
		float128: new FixedToken("f128"),
	}),
	bigs: Object.freeze({
		big: new FixedToken("big"),
		bigx1: new FixedToken("big.1"),
		bigx10: new FixedToken("big.10"),
		bigx11: new FixedToken("big.11"),
		bigx12: new FixedToken("big.12"),
		bigx13: new FixedToken("big.13"),
		bigx14: new FixedToken("big.14"),
		bigx15: new FixedToken("big.15"),
		bigx16: new FixedToken("big.16"),
		bigx17: new FixedToken("big.17"),
		bigx18: new FixedToken("big.18"),
		bigx19: new FixedToken("big.19"),
		bigx2: new FixedToken("big.2"),
		bigx20: new FixedToken("big.20"),
		bigx21: new FixedToken("big.21"),
		bigx22: new FixedToken("big.22"),
		bigx23: new FixedToken("big.23"),
		bigx24: new FixedToken("big.24"),
		bigx25: new FixedToken("big.25"),
		bigx26: new FixedToken("big.26"),
		bigx27: new FixedToken("big.27"),
		bigx28: new FixedToken("big.28"),
		bigx29: new FixedToken("big.29"),
		bigx3: new FixedToken("big.3"),
		bigx30: new FixedToken("big.30"),
		bigx31: new FixedToken("big.31"),
		bigx32: new FixedToken("big.32"),
		bigx33: new FixedToken("big.33"),
		bigx34: new FixedToken("big.34"),
		bigx35: new FixedToken("big.35"),
		bigx36: new FixedToken("big.36"),
		bigx37: new FixedToken("big.37"),
		bigx38: new FixedToken("big.38"),
		bigx39: new FixedToken("big.39"),
		bigx4: new FixedToken("big.4"),
		bigx40: new FixedToken("big.40"),
		bigx41: new FixedToken("big.41"),
		bigx42: new FixedToken("big.42"),
		bigx43: new FixedToken("big.43"),
		bigx44: new FixedToken("big.44"),
		bigx45: new FixedToken("big.45"),
		bigx46: new FixedToken("big.46"),
		bigx47: new FixedToken("big.47"),
		bigx48: new FixedToken("big.48"),
		bigx49: new FixedToken("big.49"),
		bigx5: new FixedToken("big.5"),
		bigx50: new FixedToken("big.50"),
		bigx51: new FixedToken("big.51"),
		bigx52: new FixedToken("big.52"),
		bigx53: new FixedToken("big.53"),
		bigx54: new FixedToken("big.54"),
		bigx55: new FixedToken("big.55"),
		bigx56: new FixedToken("big.56"),
		bigx57: new FixedToken("big.57"),
		bigx58: new FixedToken("big.58"),
		bigx59: new FixedToken("big.59"),
		bigx6: new FixedToken("big.6"),
		bigx60: new FixedToken("big.60"),
		bigx61: new FixedToken("big.61"),
		bigx62: new FixedToken("big.62"),
		bigx63: new FixedToken("big.63"),
		bigx64: new FixedToken("big.64"),
		bigx7: new FixedToken("big.7"),
		bigx8: new FixedToken("big.8"),
		bigx9: new FixedToken("big.9"),
	}),
	others: Object.freeze({
		boolean: new FixedToken("boolean"),
		decimal: new FixedToken("decimal"),
		number: new FixedToken("number"),
		string: new FixedToken("string"),
	}),
});

const words = Object.freeze({
	aliasof: new FixedToken("aliasof"),
	analyzer: new FixedToken("analyzer"),
	and: new FixedToken("and"),
	any: new FixedToken("any"),
	copy: new FixedToken("copy"),
	declare: new FixedToken("declare"),
	defer: new FixedToken("defer"),
	delete: new FixedToken("delete"),
	exempt: new FixedToken("exempt"),
	export: new FixedToken("export"),
	expose: new FixedToken("expose"),
	extend: new FixedToken("extend"),
	fn: new FixedToken("fn"),
	from: new FixedToken("from"),
	ghost: new FixedToken("ghost"),
	interface: new FixedToken("interface"),
	isnot: new FixedToken("isnot"),
	is: new FixedToken("is"),
	manyof: new FixedToken("manyof"),
	matches: new FixedToken("matches"),
	oneof: new FixedToken("oneof"),
	onevalueof: new FixedToken("onevalueof"),
	or: new FixedToken("or"),
	ref: new FixedToken("ref"),
	space: new FixedToken("space"),
	start: new FixedToken("start"),
	step: new FixedToken("step"),
	strong: new FixedToken("strong"),
	super: new FixedToken("super"),
	this: new FixedToken("this"),
	throw: new FixedToken("throw"),
	til: new FixedToken("til"),
	to: new FixedToken("to"),
	typeof: new FixedToken("typeof"),
	var: new FixedToken("var"),
	weak: new FixedToken("weak"),
	worker: new FixedToken("worker"),
});

const values = Object.freeze({
	infinity: new FixedToken("infinity"),
	nan: new FixedToken("nan"),
	null: new FixedToken("null"),
});

const symbols = Object.freeze({
	colon: new FixedToken(":"),
	comma: new FixedToken(","),
	dot: new FixedToken("."),
	hashbang: new FixedToken("#!"),
	not: new FixedToken("!"),
	question: new FixedToken("?"),
	spread: new FixedToken("..."),
	ternaryOption: new FixedToken(":"),
});

const assigners = Object.freeze({
	basicAssign: new FixedToken("="),
	divideAssign: new FixedToken("/="),
	minusAssign: new FixedToken("-="),
	modAssign: new FixedToken("%="),
	multiplyAssign: new FixedToken("*="),
	plusAssign: new FixedToken("+="),
});

const operators = Object.freeze({
	sealed: Object.freeze({
		bitShiftLeft: new FixedToken("<<"),
		bitShiftRight: new FixedToken(">>"),
		bitShiftRightUnsigned: new FixedToken(">>>"),
		bitwiseAnd: new FixedToken("&"),
		bitwiseXor: new FixedToken("^"),
		equality: new FixedToken("=="),
		inequality: new FixedToken("!="),
	}),
	overloadable: Object.freeze({
		add: new FixedToken("+"),
		divideInteger: new FixedToken("\\"),
		divide: new FixedToken("/"),
		exponent: new FixedToken("**"),
		gt: new FixedToken(">"),
		gte: new FixedToken(">="),
		lt: new FixedToken("<"),
		lte: new FixedToken("<="),
		modulo: new FixedToken("%"),
		multiply: new FixedToken("*"),
		subtract: new FixedToken("-"),
	}),
});

const suffixes = Object.freeze({
	catch: new FixedToken("catch"),
	each: new FixedToken("each"),
});

const prefixes = Object.freeze({
	build: new FixedToken("build"),
	comment: new FixedToken("//"),
	deactivator: new FixedToken("\\\\"),
	else: new FixedToken("else"),
	ensure: new FixedToken("ensure"),
	if: new FixedToken("if"),
	return: new FixedToken("return"),
});

const breaks = Object.freeze({
	break1: new FixedToken("break"),
	break2: new FixedToken("break.2"),
	break3: new FixedToken("break.3"),
	break4: new FixedToken("break.4"),
	break5: new FixedToken("break.5"),
	break6: new FixedToken("break.6"),
	break7: new FixedToken("break.7"),
	break8: new FixedToken("break.8"),
});

const continues = Object.freeze({
	continue1: new FixedToken("continue"),
	continue2: new FixedToken("continue.2"),
	continue3: new FixedToken("continue.3"),
	continue4: new FixedToken("continue.4"),
	continue5: new FixedToken("continue.5"),
	continue6: new FixedToken("continue.6"),
	continue7: new FixedToken("continue.7"),
	continue8: new FixedToken("continue.8"),
});

const yields = Object.freeze({
	yield1: new FixedToken("yield"),
	yield2: new FixedToken("yield.2"),
	yield3: new FixedToken("yield.3"),
	yield4: new FixedToken("yield.4"),
	yield5: new FixedToken("yield.5"),
	yield6: new FixedToken("yield.6"),
	yield7: new FixedToken("yield.7"),
	yield8: new FixedToken("yield.8"),
});

const delimiters = Object.freeze({
	// Fixed
	parenTapeL: new FixedToken("("),
	parenTapeR: new FixedToken(")"),
	bracketTapeL: new FixedToken("["),
	bracketTapeR: new FixedToken("]"),
	braceTapeL: new FixedToken("{"),
	braceTapeR: new FixedToken("}"),
	quoteTape: new FixedToken(`"`),
	fenceTape: new FixedToken(`"""`),
	substitutionTapeL: new FixedToken("(("),
	substitutionTapeR: new FixedToken("))"),
	
	// Flex
	//MarkupOpenToken: MarkupOpenToken,
	//MarkupStartToken: MarkupStartToken,
	//MarkupEndToken: MarkupEndToken,
	//MarkupAttrStartToken: MarkupAttrStartToken,
});

const contextual = Object.freeze({
	markupClose: new FixedToken(">"),
	markupIslandClose: new FixedToken("/>"),
});

/** */
export const tokens = Object.freeze({
	only: Object.freeze({
		primitives,
		delimiters,
		words,
		values,
		symbols,
		assigners,
		operators,
		breaks,
		continues,
		yields,
		suffixes,
		prefixes,
		contextual,
	}),
	...primitives.ints,
	...primitives.uints,
	...primitives.floats,
	...primitives.bigs,
	...primitives.others,
	...delimiters,
	...words,
	...values,
	...symbols,
	...assigners,
	...operators.sealed,
	...operators.overloadable,
	...suffixes,
	...prefixes,
	...breaks,
	...continues,
	...yields,
	...contextual,
});

/** */
export function * eachFixedToken()
{
	for (const value of Object.values(tokens))
		if (value !== tokens.only)
			yield value as FixedToken;
}

/** Stores the tokens that have no whitespace around them when printed. */
export const unspacedOperators: readonly X.FixedToken[] = [
	X.tokens.hashbang,
	X.tokens.not,
	X.tokens.spread,
	X.tokens.dot,
];

//# Helpers

// The purpose of this getBit function and the classBitMap is
// to provide fast lookups of the inheritance chain of a FlexToken,
// so that you can see the type lineage of a FlexToken constructor
// with minimal processing overhead.
// Note: Make sure there aren't more than 32 of these in here
// otherwise the bitshifting won't work anymore.

const bitsFlexTypeMap = new Map<number, typeof FlexToken>();
const flexTypeBitsMap = new Map<typeof FlexToken, number>();

/** */
function asPlain(flex: FlexToken)
{
	const plain = flex as any as IPlainFlexToken;
	if (typeof plain.id === "number" && plain.id >= 0)
		return plain;
	
	return null;
}

/** Setup code */
(() =>
{
	let nextBitShift = 0;
	const flexTypes = [
		...Object.values(flexTokensAbstract),
		...Object.values(flexTokens),
	];
	
	for (const type of flexTypes)
	{
		const bits = 1 << nextBitShift++;
		flexTypeBitsMap.set(type, bits);
		bitsFlexTypeMap.set(bits, type);
		
		type[Symbol.hasInstance] = (other: any) =>
		{
			if (!other || typeof other !== "object")
				return false;
			
			const otherPlain = asPlain(other);
			if (!otherPlain)
				return false;
			
			return (otherPlain.id & bits) !== 0;
		}
	}
})();

/** Test code with no home */
/*
const entityToken = X.EntityToken.new("foo");
const entityType = X.FlexToken.getType(entityToken);
console.log(X.FlexToken.isType(entityType));
console.log(entityType === X.EntityToken);
console.log(entityToken instanceof X.EntityToken);
console.log(entityToken instanceof X.FlexToken);

const literalToken = X.QuantityToken.new("1cm");
const literalType = X.FlexToken.getType(literalToken);
console.log(X.FlexToken.isType(literalType));
console.log(literalType === X.QuantityToken);
console.log(literalToken instanceof X.QuantityToken);
console.log(literalToken instanceof X.LiteralToken);
console.log(literalToken instanceof X.FlexToken);
*/
