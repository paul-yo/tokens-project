import * as X from "./XX.ts";

/** */
export class HtmlPrinter
{
	/** */
	constructor(tape: X.Tape)
	{
		this.fixedTokenClassMap = buildFixedTokenClassMap(X.tokenGroups);
		this.innerPrinter = new X.GenericHtmlPrinter(tape, n => this.classifier(n));
	}
	
	/** Map of FixedToken text -> classification path (e.g. ["primitives", "ints", "int"]) */
	private readonly fixedTokenClassMap;
	private readonly innerPrinter;
	
	/** */
	toHtml()
	{
		return this.innerPrinter.toHtml();
	}
	
	/** */
	private classifier(classifiable: X.TClassifiable)
	{
		if (classifiable instanceof X.FixedToken)
			return (this.fixedTokenClassMap.get(classifiable.text) || []).map(c => X.toCssClass(c));
		
		if (classifiable instanceof X.FlexToken)
		{
			const type = X.FlexToken.typeof(classifiable);
			return type ? [X.toCssClass(type.name)] : [];
		}
		
		return [];
	}
}

/**
 * Recursively scans an object tree (such as tokenGroups), and returns
 * a Map that associates each FixedToken's text with the array of key
 * names that were traversed to reach it (i.e. its classification layers).
 */
function buildFixedTokenClassMap(root: object): Map<string, string[]>
{
	const map = new Map<string, string[]>();
	
	const visit = (node: unknown, path: string[]) =>
	{
		if (node instanceof X.FixedToken)
		{
			map.set(node.text, path);
			return;
		}
		
		if (node !== null && typeof node === "object")
			for (const [key, value] of Object.entries(node))
				visit(value, [...path, key]);
	};
	
	visit(root, []);
	return map;
}
