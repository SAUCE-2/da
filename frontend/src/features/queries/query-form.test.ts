import { describe, expect, it, vi } from "vitest";

import type { Query } from "@/lib/api-types";

import {
	createEmptyQueryForm,
	createEmptyVariable,
	formValuesToQueryRequest,
	queryToFormValues,
	reindexVariables,
	versionDocumentToFormFields,
} from "./query-form";

const sampleQuery: Query = {
	id: 7,
	name: "Active users",
	description: "Count active users",
	active: true,
	versionId: 3,
	versionNumber: 2,
	query: "--# Main\nSELECT 1",
	queryHash: "abc",
	defaultDisabledLines: [1],
	sections: [{ name: "Main", level: 1, startLine: 1, endLine: 2 }],
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
	it("creates an empty form with a starter query", () => {
		const form = createEmptyQueryForm();

		expect(form.name).toBe("");
		expect(form.active).toBe(true);
		expect(form.query).toContain("--# Base");
		expect(form.defaultDisabledLines).toEqual([]);
		expect(form.variables).toEqual([]);
	});

	it("maps a saved query into form values with fresh client ids", () => {
		vi.spyOn(crypto, "randomUUID").mockReturnValue(
			"00000000-0000-4000-8000-000000000012",
		);

		expect(queryToFormValues(sampleQuery)).toEqual({
			name: "Active users",
			description: "Count active users",
			active: true,
			categoryIds: [4],
			query: "--# Main\nSELECT 1",
			defaultDisabledLines: [1],
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
			query: "--# Main\nSELECT 1",
			defaultDisabledLines: [1],
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
			query: "--# Main\nSELECT 1",
			defaultDisabledLines: [1],
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

	it("reindexes variables by array order", () => {
		const variables = reindexVariables([
			createEmptyVariable(5),
			createEmptyVariable(1),
		]);

		expect(variables.map((variable) => variable.sortOrder)).toEqual([0, 1]);
	});

	it("maps a version document into form fields including name and description", () => {
		vi.spyOn(crypto, "randomUUID").mockReturnValue(
			"00000000-0000-4000-8000-000000000099",
		);

		expect(
			versionDocumentToFormFields({
				name: "Historical",
				description: "Old blurb",
				query: "--# Old\nSELECT 0",
				defaultDisabledLines: [2],
				variables: [
					{
						name: "limit",
						type: "NUMBER",
						defaultValue: "10",
						required: false,
						sortOrder: 0,
					},
				],
			}),
		).toEqual({
			name: "Historical",
			description: "Old blurb",
			query: "--# Old\nSELECT 0",
			defaultDisabledLines: [2],
			variables: [
				{
					clientId: "00000000-0000-4000-8000-000000000099",
					name: "limit",
					type: "NUMBER",
					defaultValue: "10",
					required: false,
					sortOrder: 0,
				},
			],
		});
	});
});
