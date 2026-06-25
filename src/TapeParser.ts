import * as X from "./X.ts";

/** */
export class TapeParser
{
	/** */
	constructor(tokens: readonly string[])
	{
		this.stream = tokens;
		
		const allTokens = new Map<string, X.FixedToken>();
		for (const token of X.eachFixedToken())
			allTokens.set(token.text, token);
		
		this.allTokens = allTokens;
	}
	
	private index = 0;
	private readonly stream: readonly string[];
	private readonly allTokens: ReadonlyMap<string, X.FixedToken>;
	
	/** */
	private read()
	{
		let token = "";
		for (;;)
		{
			token = this.stream[this.index++] || "";
			if (token !== "" && token !== " " && token !== "\t")
				break;
		}
		
		return token;
	}
	
	/** */
	parse()
	{
		const tape = new X.Tape();
		
		while (this.index < this.stream.length)
		{
			const result = this.parseAny();
			if (result)
				tape.append(result);
		}
		
		return tape;
	}
	
	/** */
	parseAny(): X.TapeElement
	{
		const token = this.read();
		
		switch (token)
		{
			case X.tokens.parenTapeL.text:
				return this.parseToDelimiter(new X.Tape(X.TapeKind.paren), X.tokens.parenTapeR);
				
			case X.tokens.bracketTapeL.text:
				return this.parseToDelimiter(new X.Tape(X.TapeKind.bracket), X.tokens.bracketTapeR);
			
			case X.tokens.braceTapeL.text:
				return this.parseToDelimiter(new X.Tape(X.TapeKind.brace), X.tokens.braceTapeR);
			
			case X.tokens.quoteTape.text:
			{
				const tape = new X.Tape(X.TapeKind.quote);
				tape.append(this.parseTextual(X.tokens.quoteTape));
				return tape;
			}
			case X.tokens.fenceTape.text:
			{
				const tape = new X.Tape(X.TapeKind.fence);
				tape.append(this.parseTextual(X.tokens.fenceTape));
				return tape;
			}
			case X.tokens.substitutionTapeL.text:
				return this.parseToDelimiter(new X.Tape(X.TapeKind.substitution), X.tokens.substitutionTapeR);
			
			case X.tokens.from.text:
			{
				console.log(
					"Verify that this works and retains trailing, " +
					"leading, and duplicated space characters.");
				
				debugger;
				
				const parts: string[] = [];
				while (this.index < this.stream.length)
				{
					const peek = this.stream[this.index];
					if (peek === "\n" || peek === "\r" || peek === "\r\n")
						break;
					
					parts.push(peek);
					this.index++;
				}
				
				return X.RawToken.new(parts.join(" "));
			}
		}
		
		const existing = this.allTokens.get(token);
		if (existing)
			return existing;
		
		if (token === X.tokens.parenTapeR.text ||
			token === X.tokens.bracketTapeR.text ||
			token === X.tokens.braceTapeR.text ||
			token === X.tokens.substitutionTapeR.text)
			return this.allTokens.get(token)!;
		
		const maybeMarkup = this.tryParseMarkup(token);
		if (maybeMarkup !== null)
			return maybeMarkup;
		
		for (const flex of Object.values(X.flexTokens))
			if (flex.pattern.test(token))
				return (flex as any).new(token);
			
		throw `Unknown state - Cannot parse "${token}"`;
	}
	
	/** */
	private parseToDelimiter(tape: X.Tape, delimiter: X.FixedToken)
	{
		for (;;)
		{
			const result = this.parseAny();
			if (result === delimiter)
				break;
			
			tape.append(result);
		}
		return tape;
	}
		
	/** */
	private parseTextual(delimiter: X.FixedToken): X.RawToken
	{
		const parts: string[] = [];
		
		for (;;)
		{
			const token = this.read();
			if (token === delimiter.text)
				break;
			
			parts.push(token);
		}
		
		const clause = X.RawToken.new(parts.join(" "));
		return clause;
	}
	
	/** */
	private tryParseMarkup(token: string): X.Tape | null
	{
		let tape: X.Tape | null = null;
		
		// <tag .... 
		if (X.MarkupOpenToken.pattern.test(token))
		{
			tape = new X.Tape(X.TapeKind.markup);
			tape.append(X.MarkupOpenToken.new(token));
			
			for (;;)
			{
				if (token === X.tokens.markupClose.text ||
					token === X.tokens.markupIslandClose.text)
				{
					tape.append(X.tokens.markupClose);
					break;
				}
				
				tape.append(X.MarkupAttrStartToken.new(token));
			}
		}
		
		// <tag>
		if (X.MarkupStartToken.pattern.test(token))
		{
			tape = new X.Tape(X.TapeKind.markup);
			tape.append(X.MarkupStartToken.new(token));
		}
		
		// Parse markup content
		if (tape)
		{
			for (;;)
			{
				token = this.read();
				
				// Nested markup
				const maybeMarkupTape = this.tryParseMarkup(token);
				if (maybeMarkupTape)
				{
					tape.append(maybeMarkupTape);
					continue;
				}
				
				// Substitutions
				if (token === X.tokens.substitutionTapeL.text)
				{
					const subTape = new X.Tape(X.TapeKind.substitution);
					debugger;
					//while (this.tokens[this.index] !== X.Delimiters.substitutionTapeR)
					//	subTape.push(this.parseOne());
					
					subTape.append(subTape);
					continue;
				}
				
				// Markup done
				if (X.MarkupEndToken.pattern.test(token))
				{
					tape.append(X.MarkupEndToken.new(token));
					return tape;
				}
				
				// Text
				tape.append(X.RawToken.new(token));
			}
		}
		
		return tape;
	}
}
