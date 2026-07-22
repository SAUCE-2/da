import { describe, expect, it, vi } from "vitest";

import type { Query } from "@/lib/api-types";

import {
	createEmptyQueryForm,
	createEmptySection,
	createEmptyVariable,
	formValuesToQueryRequest,
	queryToFormValues,
	reindexSections,
	reindexVariables,
} from "./query-form";

const sampleQuery: Query = {
	id: 7,
	name: "Active users",
	description: "Count active users",
	active: true,
	versionId: 3,
	versionNumber: 2,
	sections: [
		{
			id: 1,
			name: "Main",
			sqlFragment: "SELECT 1",
			sortOrder: 0,
			defaultEnabled: true,
		},
	],
	variables: [
		{
			id: 1,
			name: "status",
			type: "STRING",
			defaultValue: "active",
			required: true,
			sortOrder: 0,
		},
	],
	categories: [{ id: 4, name: "Users", description: null }],
};

describe("query-form", () => {
	it("creates an empty form with one blank section", () => {
		vi.spyOn(crypto, "randomUUID").mockReturnValue(
			"00000000-0000-4000-8000-000000000001",
		);

		const form = createEmptyQueryForm();

		expect(form).toEqual({
			name: "",
			description: "",
			active: true,
			categoryIds: [],
			sections: [
				{
					clientId: "00000000-0000-4000-8000-000000000001",
					name: "",
					sqlFragment: "",
					sortOrder: 0,
					defaultEnabled: true,
				},
			],
			variables: [],
		});
	});

	it("maps a saved query into form values with fresh client ids", () => {
		vi.spyOn(crypto, "randomUUID")
			.mockReturnValueOnce("00000000-0000-4000-8000-000000000011")
			.mockReturnValueOnce("00000000-0000-4000-8000-000000000012");

		expect(queryToFormValues(sampleQuery)).toEqual({
			name: "Active users",
			description: "Count active users",
			active: true,
			categoryIds: [4],
			sections: [
				{
					clientId: "00000000-0000-4000-8000-000000000011",
					name: "Main",
					sqlFragment: "SELECT 1",
					sortOrder: 0,
					defaultEnabled: true,
				},
			],
			variables: [
				{
					clientId: "00000000-0000-4000-8000-000000000012",
					name: "status",
					type: "STRING",
					defaultValue: "active",
					required: true,
					sortOrder: 0,
				},
			],
		});
	});

	it("maps form values to a query request without client ids", () => {
		const request = formValuesToQueryRequest({
			name: "Active users",
			description: "Count active users",
			active: true,
			categoryIds: [4],
			sections: [
				{
					clientId: "section-id",
					name: "Main",
					sqlFragment: "SELECT 1",
					sortOrder: 0,
					defaultEnabled: true,
				},
			],
			variables: [
				{
					clientId: "variable-id",
					name: "status",
					type: "STRING",
					defaultValue: "active",
					required: true,
					sortOrder: 0,
				},
			],
		});

		expect(request).toEqual({
			name: "Active users",
			description: "Count active users",
			active: true,
			sections: [
				{
					name: "Main",
					sqlFragment: "SELECT 1",
					sortOrder: 0,
					defaultEnabled: true,
				},
			],
			variables: [
				{
					name: "status",
					type: "STRING",
					defaultValue: "active",
					required: true,
					sortOrder: 0,
				},
			],
			categoryIds: [4],
		});
	});

	it("reindexes sections and variables by array order", () => {
		const sections = reindexSections([
			createEmptySection(9),
			createEmptySection(3),
		]);
		const variables = reindexVariables([
			createEmptyVariable(5),
			createEmptyVariable(1),
		]);

		expect(sections.map((section) => section.sortOrder)).toEqual([0, 1]);
		expect(variables.map((variable) => variable.sortOrder)).toEqual([0, 1]);
	});
});
