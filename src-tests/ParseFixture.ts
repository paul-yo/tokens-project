import * as X from "../src-language/XX.ts";
import * as Fs from "fs";
import assert from "node:assert";

/** */
export function roundTripParseCase(filePath: string)
{
	const lang = new X.ProjectLanguage();
	const codeText = Fs.readFileSync(filePath, "utf-8");
	const tape = lang.createMaskedTape(codeText);
	const tokenStrings = lang.createTokenStrings(codeText)
		.filter(s => !/^\s+$/.test(s));
	
	const tokensConcatParsed = printParsedCode(tape);
	const tokensConcatExpected = tokenStrings.join(" ");
	assert.equal(tokensConcatParsed, tokensConcatExpected);
}

/** */
function printParsedCode(tape: X.Tape)
{
	const tokens: string[] = [];
	
	const recurse = (mask: X.Mask) =>
	{
		const maskType = mask.constructor as typeof X.Mask;
		const maskEnclosure = maskType.descriptor.enclosure;
		
		if (maskEnclosure.left)
			tokens.push(maskEnclosure.left.text);
		
		for (const maskField of mask.queryFields())
		{
			for (const fixedToken of maskField.structureBefore)
				tokens.push(fixedToken.text);
			
			const enc = maskField.field.data.enclosure;
			const fieldValue = X.toArray(maskField.value).flat();
			const valueHasSameEnclosure = fieldValue.some(v =>
				v instanceof X.Mask &&
				(v.constructor as typeof X.Mask).descriptor.enclosure === enc);
			
			if (enc.left && !valueHasSameEnclosure)
				tokens.push(enc.left.text);
			
			for (const fixedToken of maskField.anchorConditional)
				tokens.push(fixedToken.text);
			
			for (const maskFieldValue of fieldValue)
			{
				if (maskFieldValue instanceof X.Mask)
					recurse(maskFieldValue);
				
				else if (maskFieldValue instanceof X.FlexToken ||
					maskFieldValue instanceof X.FixedToken ||
					maskFieldValue instanceof X.RawToken)
					tokens.push(maskFieldValue.text);
			}
			
			if (enc.right && !valueHasSameEnclosure)
				tokens.push(enc.right.text);
			
			for (const fixedToken of maskField.structureAfter)
				tokens.push(fixedToken.text);
		}
		
		if (maskEnclosure.right)
			tokens.push(maskEnclosure.right.text);
	}
	
	tape.readAll();
	
	for (const cursor of tape.scan())
		if (cursor.mask)
			recurse(cursor.mask);
	
	return tokens.join(" ");
}
