import { queryOptions } from "@tanstack/react-query";

import type { Query, QueryPreviewRequest } from "@/lib/api-types";
import {
	createPersistListMutation,
	createRemoveListMutation,
	OPTIMISTIC_ID,
} from "@/lib/query/optimistic-list-mutations";
import { queryClient } from "@/lib/query-client";

import {
	createQuery,
	deleteQuery,
	getQueryVersion,
	listQueries,
	listQueryVersions,
	previewQuery,
	updateQuery,
} from "./query-api";
import type { QueryRequest } from "./query-schema";

export { OPTIMISTIC_ID };

export const queryKeys = {
	all: ["queries"] as const,
	list: () => [...queryKeys.all, "list"] as const,
	versions: (id: number) => [...queryKeys.all, "versions", id] as const,
	version: (id: number, versionId: number) =>
		[...queryKeys.all, "version", id, versionId] as const,
	preview: (id: number | null, request: Record<string, unknown> = {}) =>
		[...queryKeys.all, "preview", id ?? "new", request] as const,
};

function refreshMetadata() {
	void Promise.all([
		queryClient.invalidateQueries({ queryKey: queryKeys.list() }),
		queryClient.invalidateQueries({ queryKey: ["categories", "list"] }),
	]);
}

function buildOptimisticQuery(request: QueryRequest): Query {
	return {
		id: OPTIMISTIC_ID,
		name: request.name,
		description: request.description || null,
		active: request.active,
		versionId: OPTIMISTIC_ID,
		versionNumber: 1,
		query: request.query,
		queryHash: "",
		defaultDisabledLines: request.defaultDisabledLines ?? [],
		sections: [],
		variables: request.variables.map((variable, index) => ({
			id: index,
			...variable,
			defaultValue: variable.defaultValue || null,
		})),
		categories: [],
	};
}

function applyRequestToQuery(query: Query, request: QueryRequest): Query {
	return {
		...query,
		name: request.name,
		description: request.description || null,
		active: request.active,
		query: request.query,
		defaultDisabledLines: request.defaultDisabledLines ?? [],
		variables: request.variables.map((variable, index) => ({
			id: query.variables[index]?.id ?? index,
			...variable,
			defaultValue: variable.defaultValue || null,
		})),
	};
}

export const queriesListOptions = () =>
	queryOptions({
		queryKey: queryKeys.list(),
		queryFn: listQueries,
		staleTime: 60_000,
	});

export const queryVersionsOptions = (id: number | null) =>
	queryOptions({
		queryKey: queryKeys.versions(id ?? OPTIMISTIC_ID),
		queryFn: async () => {
			if (id === null) {
				throw new Error("A saved query is required to load versions.");
			}
			return listQueryVersions(id);
		},
		enabled: id !== null && id !== OPTIMISTIC_ID,
		staleTime: 30_000,
	});

export const queryVersionOptions = (
	id: number | null,
	versionId: number | null,
) =>
	queryOptions({
		queryKey: queryKeys.version(
			id ?? OPTIMISTIC_ID,
			versionId ?? OPTIMISTIC_ID,
		),
		queryFn: async () => {
			if (id === null || versionId === null) {
				throw new Error("A saved query version is required.");
			}
			return getQueryVersion(id, versionId);
		},
		enabled:
			id !== null &&
			id !== OPTIMISTIC_ID &&
			versionId !== null &&
			versionId !== OPTIMISTIC_ID,
		staleTime: 60_000,
	});

export const queryPreviewOptions = (
	id: number | null,
	request: QueryPreviewRequest = {},
) =>
	queryOptions({
		queryKey: queryKeys.preview(id, request),
		queryFn: async () => {
			if (id === null) {
				throw new Error("A saved query is required to load a preview.");
			}

			return previewQuery(id, request);
		},
		enabled: id !== null && id !== OPTIMISTIC_ID,
		staleTime: 0,
	});

export const usePersistQuery = createPersistListMutation<Query, QueryRequest>({
	listKey: queryKeys.list(),
	mutationFn: ({ id, request }) =>
		id === null ? createQuery(request) : updateQuery(id, request),
	buildOptimistic: buildOptimisticQuery,
	applyRequest: applyRequestToQuery,
	getId: (query) => query.id,
	successMessage: "Query saved.",
	errorMessage: "Unable to save query.",
	onSettled: (data, _error, variables) => {
		void refreshMetadata();
		if (variables.id !== null) {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.preview(variables.id),
			});
			if (data) {
				queryClient.setQueryData(
					queryKeys.versions(variables.id),
					(current: Awaited<ReturnType<typeof listQueryVersions>> = []) => {
						if (
							current.some((version) => version.versionId === data.versionId)
						) {
							return current;
						}
						return [
							{
								versionId: data.versionId,
								versionNumber: data.versionNumber,
								createdAt: new Date().toISOString(),
							},
							...current,
						];
					},
				);
			}
			void queryClient.invalidateQueries({
				queryKey: queryKeys.versions(variables.id),
			});
		} else if (data) {
			queryClient.setQueryData(queryKeys.versions(data.id), [
				{
					versionId: data.versionId,
					versionNumber: data.versionNumber,
					createdAt: new Date().toISOString(),
				},
			]);
		}
	},
});

export const useRemoveQuery = createRemoveListMutation({
	listKey: queryKeys.list(),
	mutationFn: deleteQuery,
	successMessage: "Query deleted.",
	errorMessage: "Unable to delete query.",
	onSettled: refreshMetadata,
});
