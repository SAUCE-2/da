import type { Category } from "@/lib/api-types";

export type CategoryFormValues = {
	name: string;
	description: string;
};

export function createEmptyCategoryForm(): CategoryFormValues {
	return {
		name: "",
		description: "",
	};
}

export function categoryToFormValues(category: Category): CategoryFormValues {
	return {
		name: category.name,
		description: category.description ?? "",
	};
}
