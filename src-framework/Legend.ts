import * as X from "./X.ts";
import * as Fs from "fs";

/** */
export const Legend = new class
{
	/** */
	write(path: string)
	{
		const mdText = this.generate();
		Fs.writeFileSync(path, mdText, "utf-8");
	}
	
	/** */
	generate()
	{
		const fixedTokenRows: IFixedTokenRow[] = [];
		for (const [proxyable, char] of X.Proxy.each())
		{
			if (proxyable instanceof X.FixedToken)
			{
				const { code, unicode } = getCodes(char);
				fixedTokenRows.push({
					character: char,
					code,
					unicode,
					description: proxyable.text,
				});
			}
		}
		
		const flexTokenRows: IFlexTokenRow[] = [];
		for (const [proxyable, character] of X.Proxy.each())
		{
			if (X.FlexToken.isType(proxyable))
			{
				const { code, unicode } = getCodes(character);
				flexTokenRows.push({
					character,
					code,
					unicode,
					description: proxyable.name,
					pattern: proxyable.pattern?.source || "(no pattern)",
				});
			}
		}
		
		const tapeRows: ITapeRow[] = [];
		for (const [proxyable, character] of X.Proxy.each())
		{
			if (X.isEnclosure(proxyable))
			{
				const { code, unicode } = getCodes(character);
				tapeRows.push({
					character,
					code,
					unicode,
					kind: proxyable.kind
				})
			}
		}
		
		const maskRows: IMaskRow[] = [];
		for (const [proxyable, character] of X.Proxy.each())
		{
			if (X.Mask.isType(proxyable))
			{
				const { code, unicode } = getCodes(character);
				const schema = proxyable.schema;
				maskRows.push({
					type: proxyable.name,
					character,
					code,
					unicode,
					fullPattern: schema.enclosureIgnoringMatcher?.source || "(no pattern)",
					debugFullPattern: schema.getReadablePattern(false),
					fastPattern: schema.insidePattern,
					debugFastPattern: schema.getReadablePattern(true),
				});
			}
		}
		
		const lines: string[] = ["# Abstract Regular Expression Legend"];
		
		// Fixed Tokens
		lines.push("## Fixed Tokens");
		lines.push("");
		lines.push("| Character | Code | Unicode | Description |");
		lines.push("| --- | --- | --- | --- |");
		
		for (const row of fixedTokenRows)
			lines.push(`| ${row.character} | ${row.code} | ${row.unicode} | ${row.description} |`);
		
		lines.push("");
		
		// Flex Tokens
		lines.push("## Flex Tokens");
		lines.push("");
		lines.push("| Character | Code | Unicode | Description | Pattern |");
		lines.push("| --- | --- | --- | --- | --- |");
		
		for (const row of flexTokenRows)
			lines.push(`| ${row.character} | ${row.code} | ${row.unicode} | ${row.description} | \`${row.pattern}\` |`);
		
		lines.push("");
		
		// Tape Kinds
		lines.push("## Tape Kinds");
		lines.push("");
		lines.push("| Character | Code | Unicode | Kind |");
		lines.push("| --- | --- | --- | --- |");
		
		for (const row of tapeRows)
			lines.push(`| ${row.character} | ${row.code} | ${row.unicode} | ${row.kind} |`);
		
		lines.push("");
		
		// Masks (one section per mask)
		lines.push("## Masks");
		lines.push("");
		
		for (const row of maskRows)
		{
			lines.push(`### ${row.type}`);
			lines.push("");
			lines.push(`- **Character:** ${row.character}`);
			lines.push(`- **Code:** ${row.code}`);
			lines.push(`- **Unicode:** ${row.unicode}`);
			lines.push(`- **Full Pattern:** \`${row.fullPattern}\``);
			lines.push(`- **Fast Pattern:** \`${row.fastPattern}\``);
			lines.push(`- **Debug Full Pattern:** \`${row.debugFullPattern}\``);
			lines.push(`- **Debug Fast Pattern:** \`${row.debugFastPattern}\``);
			lines.push("");
		}
		
		return lines.join("\n");
	}
}

/** */
function getCodes(char: string)
{
	const cp = char.codePointAt(0) || 0;
	return {
		code: cp,
		unicode: "U+" + ("0000" + cp.toString(16).toUpperCase()).slice(-4),
	}
}

/** */
interface IFixedTokenRow
{
	character: string;
	code: number;
	unicode: string;
	description: string;
}

/** */
interface IFlexTokenRow
{
	character: string;
	code: number;
	unicode: string;
	description: string;
	pattern: string;
}

/** */
interface ITapeRow
{
	character: string;
	code: number;
	unicode: string;
	kind: string;
}

/** */
interface IMaskRow
{
	type: string;
	character: string;
	code: number;
	unicode: string;
	fullPattern: string;
	fastPattern: string;
	debugFullPattern: string;
	debugFastPattern: string;
}
