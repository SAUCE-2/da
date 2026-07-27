import { useForm, useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { categoriesListOptions } from "@/features/categories/server-state";
import { formatZodError } from "@/lib/format-zod-error";

import {
	addVariableToForm,
	formValuesToQueryRequest,
	queryToFormValues,
	removeVariableFromForm,
	toggleCategoryId,
} from "./form";
import { queryRequestSchema } from "./schema";
import {
	queryDetailOptions,
	usePersistQuery,
	useRemoveQuery,
} from "./server-state";
import { useQueryPreview } from "./use-preview";
import { useQueryVersions } from "./use-versions";

function readSubmitError(errorMap: unknown) {
	const err = (errorMap as { onSubmit?: unknown })?.onSubmit;
	return typeof err === "string" && err.length > 0 ? err : null;
}

export function useQueryEditor(entityId: number | null) {
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const persistQuery = usePersistQuery();
	const removeQuery = useRemoveQuery();

	const {
		data: selectedQuery = null,
		isFetched,
		isError,
	} = useQuery(queryDetailOptions(entityId));
	const { data: categories = [] } = useQuery(categoriesListOptions());

	const isNotFound =
		entityId !== null && isFetched && (selectedQuery === null || isError);

	const versions = useQueryVersions({ entityId, selectedQuery });

	const form = useForm({
		defaultValues: versions.initialFormValues,
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
				versions.resetVersionView();
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
		previewVariableValues,
		previewErrorMessage,
		updatePreviewVariable,
		resetPreviewOverrides,
	} = useQueryPreview(formVariables);

	const isDirty = useStore(form.store, (state) => state.isDirty);
	const submitError = useStore(form.store, (state) =>
		readSubmitError(state.errorMap),
	);

	const versionOpts = {
		form,
		isDirty,
		resetPreviewOverrides,
		setErrorMessage,
	};

	return {
		query: {
			entityId,
			selectedQuery,
			selectedQueryName: selectedQuery?.name ?? null,
			isNotFound,
			categories,
			errorMessage: errorMessage ?? submitError ?? previewErrorMessage,
			isSaving: persistQuery.isPending || versions.isRestoring,
		},
		form,
		formVariables,
		previewVariableValues,
		versions: {
			list: versions.list,
			viewingVersionId: versions.viewingVersionId,
			viewingVersionNumber: versions.viewingVersionNumber,
			isViewingHistorical: versions.isViewingHistorical,
			isLoadingVersion: versions.isLoadingVersion,
			isRestoring: versions.isRestoring,
			canGoPrevious: versions.canGoPrevious,
			canGoNext: versions.canGoNext,
			loadVersion: (versionId: number) =>
				versions.loadVersion(versionId, versionOpts),
			goToPreviousVersion: () => versions.goToPreviousVersion(versionOpts),
			goToNextVersion: () => versions.goToNextVersion(versionOpts),
			handleRestore: () =>
				versions.handleRestore({
					form,
					persistQuery,
					resetPreviewOverrides,
					setErrorMessage,
				}),
		},
		actions: {
			handleDelete: () => {
				if (entityId === null) {
					return;
				}
				setErrorMessage(null);
				void navigate({ to: "/queries/new", replace: true });
				removeQuery.mutate(entityId);
			},
			handleBack: () => {
				void navigate({ to: "/queries/new" });
			},
			toggleCategory: (categoryId: number) => {
				form.setFieldValue(
					"categoryIds",
					toggleCategoryId(form.getFieldValue("categoryIds"), categoryId),
				);
			},
			addVariable: () => {
				form.setFieldValue(
					"variables",
					addVariableToForm(form.getFieldValue("variables")),
				);
			},
			removeVariable: (clientId: string) => {
				form.setFieldValue(
					"variables",
					removeVariableFromForm(form.getFieldValue("variables"), clientId),
				);
			},
			updatePreviewVariable,
		},
	};
}

export type QueryEditorForm = ReturnType<typeof useQueryEditor>["form"];
