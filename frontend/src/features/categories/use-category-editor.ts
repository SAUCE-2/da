import { useForm, useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { formatZodError } from "@/lib/format-zod-error";

import { categoryToFormValues, createEmptyCategoryForm } from "./category-form";
import { categoryRequestSchema } from "./category-schema";
import {
	categoriesListOptions,
	usePersistCategory,
	useRemoveCategory,
} from "./category-server-state";
import { useCategoryQueryCounts } from "./use-category-query-counts";

function readSubmitError(errorMap: unknown) {
	const err = (errorMap as { onSubmit?: unknown })?.onSubmit;
	return typeof err === "string" && err.length > 0 ? err : null;
}

export function useCategoryEditor(entityId: number | null) {
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const persistCategory = usePersistCategory();
	const removeCategory = useRemoveCategory();

	const { data: categories = [], isFetched } = useQuery(
		categoriesListOptions(),
	);
	const getQueryCount = useCategoryQueryCounts();

	const selectedCategory =
		entityId === null
			? null
			: (categories.find((category) => category.id === entityId) ?? null);
	const selectedQueryCount = selectedCategory
		? getQueryCount(selectedCategory)
		: 0;
	const isNotFound =
		isFetched && entityId !== null && selectedCategory === null;

	const initialFormValues = useMemo(
		() =>
			entityId === null
				? createEmptyCategoryForm()
				: selectedCategory
					? categoryToFormValues(selectedCategory)
					: createEmptyCategoryForm(),
		[entityId, selectedCategory],
	);

	const form = useForm({
		defaultValues: initialFormValues,
		validators: {
			onSubmit: ({ value }) => {
				const result = categoryRequestSchema.safeParse(value);
				return result.success ? undefined : formatZodError(result.error);
			},
		},
		onSubmit: async ({ value }) => {
			const request = categoryRequestSchema.parse(value);
			setErrorMessage(null);

			const wasCreate = entityId === null;

			try {
				const saved = await persistCategory.mutateAsync({
					id: entityId,
					request,
				});
				form.reset(categoryToFormValues(saved));
				if (wasCreate) {
					void navigate({
						to: "/categories/$categoryId",
						params: { categoryId: saved.id },
						replace: true,
					});
				}
			} catch {
				// Stay on the current create/edit URL on failure.
			}
		},
	});

	const submitError = useStore(form.store, (state) =>
		readSubmitError(state.errorMap),
	);

	function handleDelete() {
		if (entityId === null) {
			return;
		}

		setErrorMessage(null);
		void navigate({ to: "/categories/new", replace: true });
		removeCategory.mutate(entityId);
	}

	function handleBack() {
		void navigate({ to: "/categories/new" });
	}

	return {
		entityId,
		selectedCategory,
		selectedQueryCount,
		isNotFound,
		form,
		isSaving: persistCategory.isPending,
		errorMessage: errorMessage ?? submitError,
		handleDelete,
		handleBack,
	};
}

export type CategoryEditorForm = ReturnType<typeof useCategoryEditor>["form"];
