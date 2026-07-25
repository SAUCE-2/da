import { useForm, useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { categoriesListOptions } from "@/features/categories/category-server-state";
import { formatZodError } from "@/lib/format-zod-error";

import { getQueryVersion } from "./query-api";
import {
	addVariableToForm,
	createEmptyQueryForm,
	formValuesToQueryRequest,
	type QueryFormValues,
	queryToFormValues,
	removeVariableFromForm,
	toggleCategoryId,
	versionDocumentToFormFields,
} from "./query-form";
import { queryRequestSchema } from "./query-schema";
import {
	queriesListOptions,
	queryVersionsOptions,
	usePersistQuery,
	useRemoveQuery,
} from "./query-server-state";
import { useQueryPreview } from "./use-query-preview";

function readSubmitError(errorMap: unknown) {
	const err = (errorMap as { onSubmit?: unknown })?.onSubmit;
	return typeof err === "string" && err.length > 0 ? err : null;
}

function confirmDiscardIfDirty(isDirty: boolean) {
	if (!isDirty) {
		return true;
	}
	return window.confirm(
		"You have unsaved changes. Discard them and switch versions?",
	);
}

export function useQueryEditor(entityId: number | null) {
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [viewingVersionId, setViewingVersionId] = useState<number | null>(null);
	const [versionNavQueryId, setVersionNavQueryId] = useState(entityId);
	const [versionFormValues, setVersionFormValues] =
		useState<QueryFormValues | null>(null);
	const [isLoadingVersion, setIsLoadingVersion] = useState(false);
	const [isRestoring, setIsRestoring] = useState(false);

	if (versionNavQueryId !== entityId) {
		setVersionNavQueryId(entityId);
		setViewingVersionId(null);
		setVersionFormValues(null);
	}

	const persistQuery = usePersistQuery();
	const removeQuery = useRemoveQuery();

	const { data: queries = [], isFetched } = useQuery(queriesListOptions());
	const { data: categories = [] } = useQuery(categoriesListOptions());
	const { data: versionSummaries = [] } = useQuery(
		queryVersionsOptions(entityId),
	);

	const selectedQuery =
		entityId === null
			? null
			: (queries.find((query) => query.id === entityId) ?? null);
	const isNotFound = isFetched && entityId !== null && selectedQuery === null;

	const versionsAscending = useMemo(
		() =>
			[...versionSummaries].sort(
				(left, right) => left.versionNumber - right.versionNumber,
			),
		[versionSummaries],
	);

	const currentVersionId = selectedQuery?.versionId ?? null;
	const effectiveViewingVersionId = viewingVersionId ?? currentVersionId;
	const viewingIndex = versionsAscending.findIndex(
		(version) => version.versionId === effectiveViewingVersionId,
	);
	const viewingSummary =
		viewingIndex >= 0 ? versionsAscending[viewingIndex] : null;
	const isViewingHistorical =
		effectiveViewingVersionId !== null &&
		currentVersionId !== null &&
		effectiveViewingVersionId !== currentVersionId;

	const currentFormValues = useMemo(
		() =>
			entityId === null
				? createEmptyQueryForm()
				: selectedQuery
					? queryToFormValues(selectedQuery)
					: createEmptyQueryForm(),
		[entityId, selectedQuery],
	);

	// TanStack Form re-applies defaultValues on every render when untouched.
	// Keep defaults aligned with the version being viewed so loadVersion isn't
	// immediately overwritten by the current query snapshot.
	const initialFormValues =
		isViewingHistorical && versionFormValues
			? versionFormValues
			: currentFormValues;

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
				setViewingVersionId(null);
				setVersionFormValues(null);
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

	async function loadVersion(versionId: number) {
		if (
			entityId === null ||
			!Number.isFinite(versionId) ||
			versionId <= 0 ||
			versionId === effectiveViewingVersionId
		) {
			return;
		}
		if (!confirmDiscardIfDirty(isDirty)) {
			return;
		}

		setIsLoadingVersion(true);
		setErrorMessage(null);
		const currentValues = form.state.values;
		try {
			if (versionId === currentVersionId && selectedQuery) {
				const nextValues = queryToFormValues(selectedQuery);
				form.reset(nextValues);
				setViewingVersionId(null);
				setVersionFormValues(null);
				resetPreviewOverrides();
				return;
			}

			const version = await getQueryVersion(entityId, versionId);
			const documentFields = versionDocumentToFormFields(version);
			const nextValues: QueryFormValues = {
				...currentValues,
				...documentFields,
			};
			setVersionFormValues(nextValues);
			setViewingVersionId(versionId);
			form.reset(nextValues);
			resetPreviewOverrides();
		} catch {
			setErrorMessage("Unable to load that query version.");
		} finally {
			setIsLoadingVersion(false);
		}
	}

	async function handleRestore() {
		if (entityId === null || !isViewingHistorical) {
			return;
		}

		const request = queryRequestSchema.parse(
			formValuesToQueryRequest(form.state.values),
		);
		setIsRestoring(true);
		setErrorMessage(null);
		try {
			const saved = await persistQuery.mutateAsync({
				id: entityId,
				request,
			});
			form.reset(queryToFormValues(saved));
			setViewingVersionId(null);
			setVersionFormValues(null);
			resetPreviewOverrides();
		} catch {
			setErrorMessage("Unable to restore that query version.");
		} finally {
			setIsRestoring(false);
		}
	}

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

	const canGoPrevious = viewingIndex > 0;
	const canGoNext =
		viewingIndex >= 0 && viewingIndex < versionsAscending.length - 1;

	return {
		entityId,
		selectedQuery,
		selectedQueryName: selectedQuery?.name ?? null,
		isNotFound,
		form,
		categories,
		formVariables,
		previewVariableValues,
		isDirty,
		isSaving: persistQuery.isPending || isRestoring,
		isLoadingVersion,
		isRestoring,
		errorMessage: errorMessage ?? submitError ?? previewErrorMessage,
		versions: versionsAscending,
		viewingVersionId: effectiveViewingVersionId,
		viewingVersionNumber: viewingSummary?.versionNumber ?? null,
		isViewingHistorical,
		canGoPrevious,
		canGoNext,
		loadVersion,
		goToPreviousVersion: () => {
			if (!canGoPrevious) {
				return;
			}
			void loadVersion(versionsAscending[viewingIndex - 1].versionId);
		},
		goToNextVersion: () => {
			if (!canGoNext) {
				return;
			}
			void loadVersion(versionsAscending[viewingIndex + 1].versionId);
		},
		handleRestore,
		handleDelete,
		handleBack,
		toggleCategory,
		addVariable,
		removeVariable,
		updatePreviewVariable,
	};
}

export type QueryEditorForm = ReturnType<typeof useQueryEditor>["form"];
