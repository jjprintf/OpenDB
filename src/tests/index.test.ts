import { test, expect, describe } from '@jest/globals';
import { Client } from '../index';

describe("Test database", () =>
{
	test("Test all functions", async () =>
	{
		const OpenDB = new Client({ Path: "../.." });// Important! do not put / at the end of the path

		expect(await OpenDB.Start());
		expect(await OpenDB.CreateDatabase("Test"));
		expect(OpenDB.SetDatabase("Test"));
		expect(await OpenDB.CreatePointer("TestPointer")).toBe(undefined);
		expect(OpenDB.GetPointer("TestPointer"));
	});
});
