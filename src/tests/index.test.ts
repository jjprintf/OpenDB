import { test, expect, describe } from '@jest/globals';
import { Client, Pointer, Container } from '../index';
import path from 'path';

describe("Test database", () =>
{
	test("Test all functions", async () =>
	{
		const OpenDB = new Client({ Path: 'src/..', Buffer: 10240 });// Important! do not put / at the end of the path

		expect(await OpenDB.Start());
		expect(await OpenDB.CreateDatabase("Test"));
		expect(OpenDB.SetDatabase("Test"));
		expect(await OpenDB.CreatePointer("TestPointer")).toBe(undefined);
		const pointer = OpenDB.GetPointer("TestPointer") as Pointer;

		await OpenDB.Add({ name: "Printf", level: 0 }, "TestPointer");
		await OpenDB.Add({ name: "Nacho", level: 0 }, "TestPointer");
		await OpenDB.Add({ name: "Simon", level: 0 }, "TestPointer");

		const table: any = OpenDB.Find("TestPointer", (x: any) => x?.Content["name"] === "Nacho");

		if(!table) return;

		table.Content["level"] += 1;

		await table.save();

		OpenDB.Update();

		console.log(table);

		const container = OpenDB.Filter("TestPointer", (x) => x?.ID);

		console.log(container);
	}, 500000);
});
