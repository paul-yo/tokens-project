import * as X from "./X.ts";

/** */
export type TClassifiable = X.Mask | X.Token | X.Tape | X.Fragment;
export type ClassifierFn = (node: TClassifiable) => readonly string[];

/**
 * Projects the specified Tape into an HTML string, as described by the
 * "HTML Emitter Specification". The emitter itself carries no language
 * -specific knowledge; all such classification is delegated to classifierFn.
 */
export function translateTapeToHtml(tape: X.Tape, classifierFn: ClassifierFn)
{
	// Rendering assumes a fully-read tape. readAll() is presumed idempotent
	// when the tape has already been (fully or partially) read.
	tape.readAll();
	
	const spans: ISpan[] = [];
	
	for (const cursor of tape.scan())
	{
		if (!cursor.mask)
			continue;
		
		const span = mapMaskToSpanRecursive(cursor.mask, classifierFn);
		spans.push(span);
	}
	
	const rootSpan = span(["root"], ...spans);
	return toSpanStringRecursive(rootSpan);
}

/** */
function mapMaskToSpanRecursive(mask: X.Mask, classifierFn: ClassifierFn)
{
	const classes = [toCssClass(mask.constructor.name)];
	const content: TSpanChild[] = [];
	
	for (const maskField of mask.queryFields())
	{
		for (const fixedToken of maskField.structureBefore)
			content.push(spanifyToken(fixedToken, classifierFn));
		
		if (maskField.field.kind === "has")
		{
			if (maskField.value === true)
				content.push(...maskField.field.match.map(t => spanifyToken(t, classifierFn)));
		}
		else for (const maskFieldValue of X.toArray(maskField.value).flat())
		{
			if (maskFieldValue === null)
				continue;
			
			if (maskFieldValue instanceof X.Mask)
				content.push(mapMaskToSpanRecursive(maskFieldValue, classifierFn));
			
			else if (maskFieldValue instanceof X.FlexToken ||
				maskFieldValue instanceof X.FixedToken ||
				maskFieldValue instanceof X.RawToken)
				content.push(spanifyToken(maskFieldValue, classifierFn));
			
			else debugger;
		}
		
		for (const fixedToken of maskField.structureAfter)
			content.push(spanifyToken(fixedToken, classifierFn));
	}
	
	return span(classes, ...content);
}

/** */
function spanifyToken(token: X.FixedToken, classifierFn: ClassifierFn)
{
	const classes = ["token", ...classifierFn(token)];
	const spn = span(classes, token.text);
	return spn;
}


//# Span IR / printing

/** */
interface ISpan
{
	readonly classes: readonly string[];
	readonly children: readonly TSpanChild[];
}

type TSpanChild = string | ISpan;

/** */
function span(classes: readonly string[], ...children: readonly TSpanChild[]): ISpan
{
	return { classes, children };
}

/** */
function toSpanString(...spans: ISpan[])
{
	return spans.map(toSpanStringRecursive).join("");
}

/** */
function toSpanStringRecursive(span: ISpan): string
{
	const cls = span.classes.length > 0 ? ` class="${span.classes.join(" ")}"` : "";
	const inner = span.children.map(c => typeof c === "string" ? c : toSpanStringRecursive(c)).join("");
	return `<span${cls}>${inner}</span>`;
}

/** */
function toCssClass(maskName: string): string
{
	const trimmed = maskName.endsWith("Mask") ? maskName.slice(0, -4) : maskName;
	return trimmed
		.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
		.replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
		.toLowerCase();
}
