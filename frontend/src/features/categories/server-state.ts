import { queryOptions } from "@tanstack/react-query";

import type { Category } from "@/lib/api-types";
import {
	createPersistListMutation,
	createRemoveListMutation,
	OPTIMISTIC_ID,
} from "@/lib/query/optimistic-list-mutations";
import { queryClient } from "@/lib/query-client";

import {
	createCategory,
	deleteCategory,
	listCategories,
	updateCategory,
} from "./api";
import type { CategoryRequest } from "./schema";

const categoryKeys = {
	all: ["categories"] as const,
	list: () => [...categoryKeys.all, "list"] as const,
};

function refreshMetadata() {
	void Promise.all([
		queryClient.invalidateQueries({ queryKey: ["queries", "list"] }),
		queryClient.invalidateQueries({ queryKey: categoryKeys.list() }),
	]);
}

function buildOptimisticCategory(request: CategoryRequest): Category {
	return {
		id: OPTIMISTIC_ID,
		name: request.name,
		description: request.description || null,
	};
}

export const categoriesListOptions = () =>
	queryOptions({
		queryKey: categoryKeys.list(),
		queryFn: listCategories,
		staleTime: 60_000,
	});

export const usePersistCategory = createPersistListMutation<
	Category,
	CategoryRequest
>({
	listKey: categoryKeys.list(),
	mutationFn: ({ id, request }) =>
		id === null ? createCategory(request) : updateCategory(id, request),
	buildOptimistic: buildOptimisticCategory,
	applyRequest: (category, request) => ({
		...category,
		name: request.name,
		description: request.description || null,
	}),
	getId: (category) => category.id,
	successMessage: "Category saved.",
	errorMessage: "Unable to save category.",
	onSettled: refreshMetadata,
});

export const useRemoveCategory = createRemoveListMutation({
	listKey: categoryKeys.list(),
	mutationFn: deleteCategory,
	successMessage: "Category deleted.",
	errorMessage: "Unable to delete category.",
	onSettled: refreshMetadata,
});
