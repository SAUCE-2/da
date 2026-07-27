import { describe, expect, it, vi } from "vitest";

import type { Plan, Query } from "@/lib/api-types";

import {
	createEmptyPlanForm,
	createEmptyPlanItem,
	formValuesToPlanRequest,
	planToFormValues,
	reindexPlanItems,
	seedVariableBindings,
} from "./form";

const samplePlan: Plan = {
	id: 11,
	name: "Nightly audit",
	description: "Runs core checks",
	active: true,
	items: [
		{
			id: 1,
			queryId: 7,
			queryName: "Active users",
			sortOrder: 0,
			enabled: true,
			queryVersionId: 3,
			queryVersionNumber: 2,
			disabledLines: [2],
			variableBindings: [{ name: "status", value: "active" }],
		},
		{
			id: 2,
			queryId: 8,
			queryName: "Skipped",
			sortOrder: 1,
			enabled: false,
			queryVersionId: null,
			queryVersionNumber: null,
			disabledLines: [],
			variableBindings: [],
		},
	],
};

const sampleQuery: Query = {
	id: 7,
	name: "Active users",
	description: null,
	active: true,
	versionId: 3,
	versionNumber: 2,
	query: "select 1",
	queryHash: "x",
	defaultDisabledLines: [],
	sections: [],
	variables: [
		{
			id: 1,
			name: "status",
			type: "STRING",
			defaultValue: "active",
			required: true,
			sortOrder: 0,
		},
		{
			id: 2,
			name: "  ",
			type: "STRING",
			defaultValue: "ignored",
			required: false,
			sortOrder: 1,
		},
	],
	categories: [],
};

describe("form", () => {
	it("creates an empty plan form", () => {
		expect(createEmptyPlanForm()).toEqual({
			name: "",
			description: "",
			active: true,
			items: [],
		});
	});

	it("maps a saved plan into form values with fresh client ids", () => {
		vi.spyOn(crypto, "randomUUID")
			.mockReturnValueOnce("00000000-0000-4000-8000-000000000021")
			.mockReturnValueOnce("00000000-0000-4000-8000-000000000022");

		expect(planToFormValues(samplePlan)).toEqual({
			name: "Nightly audit",
			description: "Runs core checks",
			active: true,
			items: [
				{
					clientId: "00000000-0000-4000-8000-000000000021",
					queryId: 7,
					sortOrder: 0,
					enabled: true,
					disabledLines: [2],
					variableBindings: { status: "active" },
				},
				{
					clientId: "00000000-0000-4000-8000-000000000022",
					queryId: 8,
					sortOrder: 1,
					enabled: false,
					disabledLines: [],
					variableBindings: {},
				},
			],
		});
	});

	it("drops items without a selected query when building a request", () => {
		const request = formValuesToPlanRequest({
			name: "Nightly audit",
			description: "Runs core checks",
			active: true,
			items: [
				{
					clientId: "item-1",
					queryId: 7,
					sortOrder: 0,
					enabled: true,
					disabledLines: [2],
					variableBindings: { status: "active" },
				},
				{
					clientId: "item-2",
					queryId: null,
					sortOrder: 1,
					enabled: true,
					disabledLines: [],
					variableBindings: {},
				},
			],
		});

		expect(request).toEqual({
			name: "Nightly audit",
			description: "Runs core checks",
			active: true,
			items: [
				{
					queryId: 7,
					sortOrder: 0,
					enabled: true,
					disabledLines: [2],
					variableBindings: [{ name: "status", value: "active" }],
				},
			],
		});
	});

	it("seeds variable bindings from a query and skips blank names", () => {
		expect(seedVariableBindings(sampleQuery)).toEqual({ status: "active" });
		expect(seedVariableBindings(undefined)).toEqual({});
	});

	it("reindexes plan items by array order", () => {
		const items = reindexPlanItems([
			createEmptyPlanItem(4),
			createEmptyPlanItem(9),
		]);

		expect(items.map((item) => item.sortOrder)).toEqual([0, 1]);
	});
});
