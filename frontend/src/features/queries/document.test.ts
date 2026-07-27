import { describe, expect, it } from "vitest";

import { parseSections, renderBody, toggleLines } from "./document";

describe("document", () => {
	const body = `--# Base
select 1
--# Filters
where 1 = 1
--## Amount
  and amount > 0
--# Tail
order by 1`;

	it("parses nested section ranges", () => {
		const sections = parseSections(body);
		expect(sections).toEqual([
			{ name: "Base", level: 1, startLine: 1, endLine: 2 },
			{ name: "Filters", level: 1, startLine: 3, endLine: 6 },
			{ name: "Amount", level: 2, startLine: 5, endLine: 6 },
			{ name: "Tail", level: 1, startLine: 7, endLine: 8 },
		]);
	});

	it("toggles a single line", () => {
		expect(toggleLines(body, [], 2)).toEqual([2]);
		expect(toggleLines(body, [2], 2)).toEqual([]);
	});

	it("toggles a whole section including subsections", () => {
		expect(toggleLines(body, [], 3)).toEqual([3, 4, 5, 6]);
	});

	it("renders by dropping disabled lines and stripping headers", () => {
		expect(renderBody(body, [5, 6])).toBe("select 1\nwhere 1 = 1\norder by 1");
	});
});
