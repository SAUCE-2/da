import { describe, expect, it } from "vitest";

import type { Category, QuerySummary } from "@/lib/api-types";

import { buildDerivedQueryCounts, getCategoryQueryCount } from "./utils";

const queries: QuerySummary[] = [
	{
		id: 1,
		name: "One",
		description: null,
		active: true,
		versionId: 1,
		versionNumber: 1,
		categories: [
			{ id: 4, name: "Users", description: null },
			{ id: 5, name: "Billing", description: null },
		],
	},
	{
		id: 2,
		name: "Two",
		description: null,
		active: true,
		versionId: 2,
		versionNumber: 1,
		categories: [{ id: 4, name: "Users", description: null }],
	},
];

describe("utils", () => {
	it("counts query memberships per category id", () => {
		const counts = buildDerivedQueryCounts(queries);

		expect(counts.get(4)).toBe(2);
		expect(counts.get(5)).toBe(1);
		expect(counts.get(99)).toBeUndefined();
	});

	it("prefers the API queryCount when present", () => {
		const category: Category = {
			id: 4,
			name: "Users",
			description: null,
			queryCount: 9,
		};
		const counts = buildDerivedQueryCounts(queries);

		expect(getCategoryQueryCount(category, counts)).toBe(9);
	});

	it("falls back to derived counts when queryCount is missing", () => {
		const category: Category = {
			id: 4,
			name: "Users",
			description: null,
		};
		const counts = buildDerivedQueryCounts(queries);

		expect(getCategoryQueryCount(category, counts)).toBe(2);
	});
});
