import { test, expect, describe } from '@jest/globals';
import { Client } from '../index';
import path from 'path';

describe("Test database", () =>
{
	test("Test all functions", async () =>
	{
		const OpenDB = new Client({ Path: 'src/..' });// Important! do not put / at the end of the path

		expect(await OpenDB.Start());
		expect(await OpenDB.CreateDatabase("Test"));
		expect(OpenDB.SetDatabase("Test"));
		expect(await OpenDB.CreatePointer("TestPointer")).toBe(undefined);
		expect(OpenDB.GetPointer("TestPointer"));
	});
});
