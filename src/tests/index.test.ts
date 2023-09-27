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

		for(let i = 0; i<5000; i++) {
			let names = ["Printf", "Leerot", "Nacho"];

			await OpenDB.Push({ name: names[Math.floor(Math.random() * names.length)] }, "TestPointer");
		}

		const container = OpenDB.GetContainer(pointer.Containers[0]);

		console.log(container);

	}, 500000);
});
