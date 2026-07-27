import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import type { Query } from "@/lib/api-types";

import { getQueryVersion } from "./api";
import {
	createEmptyQueryForm,
	formValuesToQueryRequest,
	type QueryFormValues,
	queryToFormValues,
	versionDocumentToFormFields,
} from "./form";
import { queryRequestSchema } from "./schema";
import { queryVersionsOptions } from "./server-state";

function confirmDiscardIfDirty(isDirty: boolean) {
	if (!isDirty) {
		return true;
	}
	return window.confirm(
		"You have unsaved changes. Discard them and switch versions?",
	);
}

type QueryFormApi = {
	state: { values: QueryFormValues };
	reset: (values: QueryFormValues) => void;
};

type PersistQuery = {
	mutateAsync: (args: {
		id: number | null;
		request: ReturnType<typeof formValuesToQueryRequest>;
	}) => Promise<Query>;
};

type UseQueryVersionsArgs = {
	entityId: number | null;
	selectedQuery: Query | null;
};

/**
 * Version history navigation for the query editor.
 * Form-dependent actions take the form as an argument so this hook can run
 * before `useForm` (whose defaultValues depend on version state).
 */
export function useQueryVersions({
	entityId,
	selectedQuery,
}: UseQueryVersionsArgs) {
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

	const { data: versionSummaries = [] } = useQuery(
		queryVersionsOptions(entityId),
	);

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

	function resetVersionView() {
		setViewingVersionId(null);
		setVersionFormValues(null);
	}

	async function loadVersion(
		versionId: number,
		opts: {
			form: QueryFormApi;
			isDirty: boolean;
			resetPreviewOverrides: () => void;
			setErrorMessage: (message: string | null) => void;
		},
	) {
		if (
			entityId === null ||
			!Number.isFinite(versionId) ||
			versionId <= 0 ||
			versionId === effectiveViewingVersionId
		) {
			return;
		}
		if (!confirmDiscardIfDirty(opts.isDirty)) {
			return;
		}

		setIsLoadingVersion(true);
		opts.setErrorMessage(null);
		const currentValues = opts.form.state.values;
		try {
			if (versionId === currentVersionId && selectedQuery) {
				const nextValues = queryToFormValues(selectedQuery);
				opts.form.reset(nextValues);
				resetVersionView();
				opts.resetPreviewOverrides();
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
			opts.form.reset(nextValues);
			opts.resetPreviewOverrides();
		} catch {
			opts.setErrorMessage("Unable to load that query version.");
		} finally {
			setIsLoadingVersion(false);
		}
	}

	async function handleRestore(opts: {
		form: QueryFormApi;
		persistQuery: PersistQuery;
		resetPreviewOverrides: () => void;
		setErrorMessage: (message: string | null) => void;
	}) {
		if (entityId === null || !isViewingHistorical) {
			return;
		}

		const request = queryRequestSchema.parse(
			formValuesToQueryRequest(opts.form.state.values),
		);
		setIsRestoring(true);
		opts.setErrorMessage(null);
		try {
			const saved = await opts.persistQuery.mutateAsync({
				id: entityId,
				request,
			});
			opts.form.reset(queryToFormValues(saved));
			resetVersionView();
			opts.resetPreviewOverrides();
		} catch {
			opts.setErrorMessage("Unable to restore that query version.");
		} finally {
			setIsRestoring(false);
		}
	}

	const canGoPrevious = viewingIndex > 0;
	const canGoNext =
		viewingIndex >= 0 && viewingIndex < versionsAscending.length - 1;

	return {
		list: versionsAscending,
		viewingVersionId: effectiveViewingVersionId,
		viewingVersionNumber: viewingSummary?.versionNumber ?? null,
		isViewingHistorical,
		isLoadingVersion,
		isRestoring,
		initialFormValues,
		canGoPrevious,
		canGoNext,
		resetVersionView,
		loadVersion,
		handleRestore,
		goToPreviousVersion: (opts: Parameters<typeof loadVersion>[1]) => {
			if (!canGoPrevious) {
				return;
			}
			void loadVersion(versionsAscending[viewingIndex - 1].versionId, opts);
		},
		goToNextVersion: (opts: Parameters<typeof loadVersion>[1]) => {
			if (!canGoNext) {
				return;
			}
			void loadVersion(versionsAscending[viewingIndex + 1].versionId, opts);
		},
	};
}
