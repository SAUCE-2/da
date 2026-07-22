import { useForm, useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { categoriesListOptions } from "@/features/categories/category-server-state";
import { formatZodError } from "@/lib/format-zod-error";

import {
	addSectionToForm,
	addVariableToForm,
	createEmptyQueryForm,
	formValuesToQueryRequest,
	queryToFormValues,
	removeSectionFromForm,
	removeVariableFromForm,
	reorderSectionsInForm,
	toggleCategoryId,
} from "./query-form";
import { queryRequestSchema } from "./query-schema";
import {
	queriesListOptions,
	usePersistQuery,
	useRemoveQuery,
} from "./query-server-state";
import { useQueryPreview } from "./use-query-preview";

function readSubmitError(errorMap: unknown) {
	const err = (errorMap as { onSubmit?: unknown })?.onSubmit;
	return typeof err === "string" && err.length > 0 ? err : null;
}

export function useQueryEditor(entityId: number | null) {
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const persistQuery = usePersistQuery();
	const removeQuery = useRemoveQuery();

	const { data: queries = [], isFetched } = useQuery(queriesListOptions());
	const { data: categories = [] } = useQuery(categoriesListOptions());

	const selectedQuery =
		entityId === null
			? null
			: (queries.find((query) => query.id === entityId) ?? null);
	const isNotFound = isFetched && entityId !== null && selectedQuery === null;

	// Stabilize defaultValues: queryToFormValues mints new clientIds each call,
	// and TanStack Form's update() resets untouched forms when defaults change —
	// which would infinite-loop on every render.
	const initialFormValues = useMemo(
		() =>
			entityId === null
				? createEmptyQueryForm()
				: selectedQuery
					? queryToFormValues(selectedQuery)
					: createEmptyQueryForm(),
		[entityId, selectedQuery],
	);

	const form = useForm({
		defaultValues: initialFormValues,
		validators: {
			onSubmit: ({ value }) => {
				const result = queryRequestSchema.safeParse(
					formValuesToQueryRequest(value),
				);
				return result.success ? undefined : formatZodError(result.error);
			},
		},
		onSubmit: async ({ value }) => {
			const request = queryRequestSchema.parse(formValuesToQueryRequest(value));
			setErrorMessage(null);

			const wasCreate = entityId === null;

			try {
				const saved = await persistQuery.mutateAsync({
					id: entityId,
					request,
				});
				form.reset(queryToFormValues(saved));
				resetPreviewOverrides();
				if (wasCreate) {
					void navigate({
						to: "/queries/$queryId",
						params: { queryId: saved.id },
						replace: true,
					});
				}
			} catch {
				// Stay on the current create/edit URL on failure.
			}
		},
	});

	const formVariables = useStore(form.store, (state) => state.values.variables);
	const {
		preview,
		previewVariableValues,
		isPreviewLoading,
		previewErrorMessage,
		updatePreviewVariable,
		resetPreviewOverrides,
	} = useQueryPreview(entityId, formVariables);

	const isDirty = useStore(form.store, (state) => state.isDirty);
	const submitError = useStore(form.store, (state) =>
		readSubmitError(state.errorMap),
	);

	function handleDelete() {
		if (entityId === null) {
			return;
		}

		setErrorMessage(null);
		void navigate({ to: "/queries/new", replace: true });
		removeQuery.mutate(entityId);
	}

	function handleBack() {
		void navigate({ to: "/queries/new" });
	}

	function toggleCategory(categoryId: number) {
		form.setFieldValue(
			"categoryIds",
			toggleCategoryId(form.getFieldValue("categoryIds"), categoryId),
		);
	}

	function addSection() {
		form.setFieldValue(
			"sections",
			addSectionToForm(form.getFieldValue("sections")),
		);
	}

	function removeSection(clientId: string) {
		const nextSections = removeSectionFromForm(
			form.getFieldValue("sections"),
			clientId,
		);
		const result = queryRequestSchema.safeParse(
			formValuesToQueryRequest({
				...form.state.values,
				sections: nextSections,
			}),
		);

		if (!result.success) {
			setErrorMessage(formatZodError(result.error));
			return;
		}

		setErrorMessage(null);
		form.setFieldValue("sections", nextSections);
	}

	function reorderSection(fromIndex: number, toIndex: number) {
		form.setFieldValue(
			"sections",
			reorderSectionsInForm(form.getFieldValue("sections"), fromIndex, toIndex),
		);
	}

	function addVariable() {
		form.setFieldValue(
			"variables",
			addVariableToForm(form.getFieldValue("variables")),
		);
	}

	function removeVariable(clientId: string) {
		form.setFieldValue(
			"variables",
			removeVariableFromForm(form.getFieldValue("variables"), clientId),
		);
	}

	return {
		entityId,
		selectedQuery,
		selectedQueryName: selectedQuery?.name ?? null,
		isNotFound,
		form,
		categories,
		formVariables,
		preview,
		previewVariableValues,
		isDirty,
		isSaving: persistQuery.isPending,
		isPreviewLoading,
		errorMessage: errorMessage ?? submitError ?? previewErrorMessage,
		handleDelete,
		handleBack,
		toggleCategory,
		addSection,
		removeSection,
		reorderSection,
		addVariable,
		removeVariable,
		updatePreviewVariable,
	};
}

export type QueryEditorForm = ReturnType<typeof useQueryEditor>["form"];
