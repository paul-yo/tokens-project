import * as X from "./src-language/XX.ts";
import { Legend } from "./src-framework/Legend.ts";
import * as Fs from "fs";
import * as P from "./src-tests/ParseFixture.ts";

const CASES_FOLDER = "./cases/";
const HTML_FOLDER = "./cases-html/";

/** */
(function startup()
{
	writeLegend();
	writeParserTests();
	writeCasesHtml();
})();

/** */
function writeLegend()
{
	const legendPath = "./context/legend.md";
	console.log("Writing lengend file to: " + legendPath);
	Legend.write(legendPath);
}

/** */
function writeParserTests()
{
	console.log("Writing out parser tests");
	
	const fnName = P.roundTripParseCase.name;
	const testFileLines: string[] = [
		`// THIS FILE IS GENERATED. DO NOT EDIT.`,
		`// Update by running: npm prebuild`,
		``,
		`import { test } from "node:test";`,
		`import { ${fnName} } from "./ParseFixture.ts";`,
		``,
	];
	
	for (const fileName of Fs.readdirSync(CASES_FOLDER))
	{
		testFileLines.push(
			`test("Round-tripping: ${fileName}", () => `,
			`	${fnName}("${CASES_FOLDER + fileName}"));`,
		);
	}
	
	const testFileCode = testFileLines.join("\n");
	Fs.writeFileSync("./src-tests/Parse.test.ts", testFileCode);
}

/** */
function writeCasesHtml()
{
	console.log("Writing out the cases in HTML");
	
	const lang = new X.ProjectLanguage();
	for (const codeFileName of Fs.readdirSync(CASES_FOLDER))
	{
		const codeText = Fs.readFileSync(CASES_FOLDER + codeFileName, "utf8");
		const outFileName = codeFileName.replace(/\.[^/.]+$/, ".html");
		
		try
		{
			const tape = lang.createMaskedTape(codeText);
			const printer = new X.HtmlPrinter(tape);
			const html = printer.toHtml();
			Fs.writeFileSync(HTML_FOLDER + outFileName, html);
		}
		catch (e)
		{
			debugger;
			console.log("Failed trying to print the HTML for: " + codeFileName);
			console.error(e);
		}
	}
}
