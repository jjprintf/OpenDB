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

		await OpenDB.Add({ name: "Printf" }, "TestPointer");
		await OpenDB.Add({ name: "Nacho" }, "TestPointer");
		await OpenDB.Add({ name: "Simon" }, "TestPointer");

		const table: any = OpenDB.Find("TestPointer", (x: any) => x?.Content["name"] === "Printf");

		if(!table) return;

		table.Content["name"] = "Nacho"

		await table.save();

		OpenDB.Update();

		console.log(table);

		const container = OpenDB.Filter("TestPointer", (x) => x?.ID);

		console.log(container);
	}, 500000);
});
