import { describe, expect, it } from "vitest";

import type { Category } from "@/lib/api-types";

import { categoryToFormValues, createEmptyCategoryForm } from "./form";

const sampleCategory: Category = {
	id: 4,
	name: "Users",
	description: "User-facing audits",
	queryCount: 2,
};

describe("form", () => {
	it("creates an empty category form", () => {
		expect(createEmptyCategoryForm()).toEqual({
			name: "",
			description: "",
		});
	});

	it("maps a saved category into form values", () => {
		expect(categoryToFormValues(sampleCategory)).toEqual({
			name: "Users",
			description: "User-facing audits",
		});
	});

	it("treats a null description as an empty string", () => {
		expect(
			categoryToFormValues({
				...sampleCategory,
				description: null,
			}),
		).toEqual({
			name: "Users",
			description: "",
		});
	});
});
