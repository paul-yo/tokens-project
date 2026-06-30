import * as Fs from "node:fs";
import * as X from "./XX.ts";

/** */
async function start()
{
	X.DEBUG && console.log("\n".repeat(10)); // Because VS Code's terminal is weird.
	
	//# Setup the proxy characters
	
	const lang = new X.Language({
		masks: Object.values(await import("./Masks.ts")),
		fragmentationToken: X.tokens.comma,
		fixedTokens: Object.values(X.tokens),
		physicalFlexTokens: X.flexTokens,
		abstractFlexTokens: X.flexTokensAbstract,
	});
	
	//#
	
	//if (1) return void await testTapeMasks();
	//if (1) return void (await import("../src-framework/Legend.ts")).Legend.write("./legend.md");
	
	const code = readCase("simple-function-0");
	const tape = lang.createTape(code);
	X.applyApexMasks(tape, X.SpaceBodyMasks);
	
	X.walkTape(tape, cursor =>
	{
		if (cursor.isAscending)
			return;
		
		console.log("\t".repeat(cursor.spine.length) + cursor.element.constructor.name);
	});
}

/** */
function readCase(fileBase: string)
{
	const content = Fs.readFileSync("./cases/" + fileBase + ".code", "utf-8");
	return content;
}

setTimeout(start, 100);
