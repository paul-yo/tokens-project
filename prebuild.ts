import { Legend } from "./src-framework/Legend.ts";
import * as Fs from "fs";
import * as P from "./src-tests/ParseFixture.ts";

(function writeLegend()
{
	const legendPath = "./context/legend.md";
	console.log("Writing lengend file to: " + legendPath);
	Legend.write(legendPath);
})();

(function writeParserTests()
{
	console.log("Writing out parser tests");
	
	const fnName = P.roundTripParseCase.name;
	const casesFolder = "./cases";
	const casesFileNames = Fs.readdirSync(casesFolder);
	const testFileLines: string[] = [
		`// THIS FILE IS GENERATED. DO NOT EDIT.`,
		`// Update by running: npm prebuild`,
		``,
		`import { test } from "node:test";`,
		`import { ${fnName} } from "./ParseFixture.ts";`,
		``,
	];
	
	for (const fileName of casesFileNames)
	{
		testFileLines.push(
			`test("Round-tripping: ${fileName}", () => `,
			`	${fnName}("${casesFolder}/${fileName}"));`,
		);
	}
	
	const testFileCode = testFileLines.join("\n");
	Fs.writeFileSync("./src-tests/Parse.test.ts", testFileCode);
})();
