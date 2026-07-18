import { describe, expect, test } from "bun:test";
import { Table } from "./table";

describe("Table Unit Tests", () => {
	test("Table component exists", () => {
		expect(Table).toBeDefined();
	});

	test("Table renders", () => {
		const columns = [
			{ header: "Name", key: "name" },
			{ header: "Age", key: "age" },
		];
		const rows = [
			{ name: "Alice", age: 30 },
			{ name: "Bob", age: 25 },
		];

		const table = Table({ columns, rows });
		expect(table).toBeDefined();
		// In a real environment we might want to check the rendered output
		// but since we are in a unit test without a DOM, we just check it doesn't crash
		// and returns a JSX object.
		expect(typeof table).toBe("object");
	});
});
