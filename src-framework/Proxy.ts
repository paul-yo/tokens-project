import * as X from "./X.ts";

/** */
export type TProxyable = 
	X.TapeElement | 
	X.Enclosure |
	X.Mask |
	typeof X.RawToken |
	typeof X.FlexToken | 
	typeof X.Mask;

/** */
export const Proxy = new class
{
	/** */
	define(proxyable: TProxyable)
	{
		const char = String.fromCharCode(this.nextCharCode++);
		this.charProxyMap.set(proxyable, char);
		this.charProxyReverseMap.set(char, proxyable);
		return char;
	}
	
	/** */
	readonly initialCharCode = 0x25A0; // ■
	private nextCharCode = this.initialCharCode;
	
	/** Returns the proxy character associated with the specified object. */
	get(proxyable: TProxyable)
	{
		if (X.DEBUG && !proxyable)
			throw "Invalid proxyable argument.";
		
		let proxy: string | undefined = "";
			
		if (proxyable instanceof X.FixedToken)
			proxy = this.charProxyMap.get(proxyable);
		
		else if (proxyable instanceof X.FlexToken)
			proxy = this.charProxyMap.get(X.FlexToken.typeof(proxyable)!);
		
		else if (X.FlexToken.isType(proxyable))
			proxy = this.charProxyMap.get(proxyable);
		
		else if (proxyable instanceof X.RawToken)
			proxy = this.charProxyMap.get(X.RawToken);
		
		else if (proxyable instanceof X.Tape)
			proxy = this.charProxyMap.get(proxyable.enclosure);
		
		else if (X.isEnclosure(proxyable))
			proxy = this.charProxyMap.get(proxyable);
		
		else if (X.Mask.isType(proxyable))
			proxy = this.charProxyMap.get(proxyable);
		
		else if (proxyable instanceof X.Mask)
			proxy = this.charProxyMap.get(proxyable.constructor as typeof X.Mask);
		
		if (!proxy)
		{
			debugger;
			//X.DEBUG && this.get(proxyable); // try again, for debugging.
			throw "No charcode is associated with the specified element: " + proxyable;
		}
		
		return proxy;
	}
	
	/** Returns the proxyable item that is mapped to the specified proxy character. */
	resolve(char: string)
	{
		const proxyable = this.charProxyReverseMap.get(char);
		if (!proxyable)
			throw "Unknown char: " + char;
		
		return proxyable;
	}
	
	/**
	 * Calls the resolve() function on each character in the specified
	 * string and returns a string where each proxy character has
	 * been replaced with a readable representation.
	 */
	resolveString(string: string)
	{
		const out: string[] = [];
		for (const char of string)
		{
			if ((char.codePointAt(0) || 0) < X.Proxy.initialCharCode)
			{
				out.push(char);
			}
			else
			{
				const proxyable = X.Proxy.resolve(char);
				const outChar = (() =>
				{
					if (proxyable instanceof X.FixedToken)
						return proxyable.text;
					
					if (proxyable instanceof X.FlexToken)
						return X.FlexToken.typeof(proxyable)!.name;
					
					if (X.FlexToken.isType(proxyable))
						return proxyable.name;
					
					if (proxyable instanceof X.RawToken)
						return X.RawToken.name;
					
					if (X.isEnclosure(proxyable))
						return proxyable.kind.split(".").at(-1) || "?";
					
					if (X.Mask.isType(proxyable))
						return proxyable.name;
					
					if (proxyable instanceof X.Mask)
						return proxyable.constructor.name;
					
					throw "Unknown character";
				})();
				
				out.push(" " + outChar + " ");
			}
		}
		return out.join("");
	}
	
	/** */
	* each()
	{
		for (const entry of this.charProxyMap)
			yield entry;
	}
	
	/** Stores a map of tokens (eg "is") and the replacement char (eg "Ɣ") */
	private readonly charProxyMap = new Map<TProxyable, string>();
	
	/** Stores the reverse of the charLookup table. */
	private readonly charProxyReverseMap = new Map<string, TProxyable>();
}
