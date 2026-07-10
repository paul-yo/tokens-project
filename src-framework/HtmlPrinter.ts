import * as X from "./X.ts";

/** */
export type TClassifiable = X.Mask | X.Token | X.Tape | X.Fragment;
export type ClassifierFn = (node: TClassifiable) => readonly string[];

/**
 * Prints the specified Tape into an HTML string, as described by the
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
	return [
		"<!DOCTYPE html>",
		`<link rel="preconnect" href="https://fonts.googleapis.com">`,
		`<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
		`<link href="https://fonts.googleapis.com/css2?family=Geist:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">`,
		`<link rel="stylesheet" type="text/css" href="sample.css">`,
		`<link rel="stylesheet" type="text/css" href="sample.css">`,
		toSpanStringRecursive(rootSpan),
	].join("\n");
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
		
		const enc = maskField.field.data.enclosure;
		if (enc.left && enc.right)
		{
			const enclosureContent: TSpanChild[] = [];
			
			if (enc.left)
				enclosureContent.push(spanifyToken(enc.left, classifierFn));
			
			enclosureContent.push(...translateField(maskField, classifierFn));
			
			if (enc.right)
				enclosureContent.push(spanifyToken(enc.right, classifierFn));
			
			content.push(span([enc.kind], ...enclosureContent));
		}
		else content.push(...translateField(maskField, classifierFn));
		
		for (const fixedToken of maskField.structureAfter)
			content.push(spanifyToken(fixedToken, classifierFn));
	}
	
	return span(classes, ...content);
}

/** */
function translateField(reflected: X.IMaskReflectedField, classifierFn: ClassifierFn)
{
	const content: TSpanChild[] = [];
	
	if (reflected.field.kind === "has")
	{
		if (reflected.value === true)
			content.push(...reflected.field.match.map(t => spanifyToken(t, classifierFn)));
	}
	else for (const maskFieldValue of X.toArray(reflected.value).flat())
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
	
	return content;
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
function toSpanStringRecursive(span: ISpan, depth = 0): string
{
	const cls = span.classes.length > 0 ? ` class="${span.classes.join(" ")}"` : "";
	const indent = "\t".repeat(depth);
	const hasStringChild = span.children.some(c => typeof c === "string");
	
	if (hasStringChild)
	{
		const inner = span.children.map(toSpanStringInline).join("");
		return `${indent}<span${cls}>${inner}</span>`;
	}
	
	if (span.children.length === 0)
		return `${indent}<span${cls}></span>`;
	
	const inner = span.children
		.map(c => toSpanStringRecursive(c as ISpan, depth + 1))
		.join("\n");
	
	return `${indent}<span${cls}>\n${inner}\n${indent}</span>`;
}

/**
 * Renders a span and all of its descendants on a single line, with
 * no indentation and no separators between children.
 */
function toSpanStringInline(child: TSpanChild): string
{
	if (typeof child === "string")
		return child;
	
	const cls = child.classes.length > 0 ? ` class="${child.classes.join(" ")}"` : "";
	const inner = child.children.map(toSpanStringInline).join("");
	return `<span${cls}>${inner}</span>`;
}


/** */
export function toCssClass(maskName: string): string
{
	const trimmed = maskName.endsWith("Mask") ? maskName.slice(0, -4) : maskName;
	return trimmed
		.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
		.replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
		.toLowerCase();
}
