import { describe, expect, it } from "vitest";

import type { ClientVariable } from "./form";
import { buildPreviewVariableValues } from "./use-preview";

const variables: ClientVariable[] = [
	{
		clientId: "a",
		name: "status",
		type: "STRING",
		defaultValue: "active",
		required: true,
		sortOrder: 0,
	},
	{
		clientId: "b",
		name: "limit",
		type: "NUMBER",
		defaultValue: "10",
		required: false,
		sortOrder: 1,
	},
	{
		clientId: "c",
		name: "   ",
		type: "STRING",
		defaultValue: "ignored",
		required: false,
		sortOrder: 2,
	},
];

describe("buildPreviewVariableValues", () => {
	it("uses defaults when there are no overrides", () => {
		expect(buildPreviewVariableValues(variables, {})).toEqual({
			status: "active",
			limit: "10",
		});
	});

	it("applies overrides for named variables and prunes stale overrides", () => {
		expect(
			buildPreviewVariableValues(variables, {
				status: "inactive",
				removed: "gone",
			}),
		).toEqual({
			status: "inactive",
			limit: "10",
		});
	});
});
