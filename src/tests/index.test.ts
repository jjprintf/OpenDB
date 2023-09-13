import { test, expect, describe } from '@jest/globals';
import { Client } from '../index';
import BSON from 'bson';
import colors from 'colors';
import { uid } from 'uid';

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

		const data = OpenDB.GetPointer("TestPointer");

		if (data === undefined) return;

		console.log("pointer ID => " + colors.yellow(data.ID) + "\n" + "pointer Reference => " + colors.yellow(data.Reference) + "\n" + "pointer Containers => " + "[ " + colors.yellow(data.Containers.join(", ")) + " ]" );

		const push = OpenDB.Push<string>("Nashe", "TestPointer", 1);
		expect(push);
		
		const container = OpenDB.GetContainer(data.Containers[0]);

		if (container === undefined) return;
		
		console.log("container ID => " + colors.yellow(container.ID) + "\n" + "container Tables => " + colors.yellow(container.Tables));
		
		expect(OpenDB.Edit<string>("TestPointer", "Nashe", "Nashe", "MEGANASHE"));

		console.log("container ID => " + colors.yellow(container.ID) + "\n" + "container Tables => " + colors.yellow(container.Tables));
	});
});
