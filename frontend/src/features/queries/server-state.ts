import { queryOptions } from "@tanstack/react-query";

import type { Query, QuerySummary } from "@/lib/api-types";
import {
	createPersistListDetailMutation,
	createRemoveListMutation,
	OPTIMISTIC_ID,
} from "@/lib/query/optimistic-list-mutations";
import { queryClient } from "@/lib/query-client";

import {
	createQuery,
	deleteQuery,
	getQuery,
	listQueries,
	listQueryVersions,
	updateQuery,
} from "./api";
import type { QueryRequest } from "./schema";

const queryKeys = {
	all: ["queries"] as const,
	list: () => [...queryKeys.all, "list"] as const,
	detail: (id: number) => [...queryKeys.all, "detail", id] as const,
	versions: (id: number) => [...queryKeys.all, "versions", id] as const,
};

function refreshMetadata() {
	void Promise.all([
		queryClient.invalidateQueries({ queryKey: queryKeys.list() }),
		queryClient.invalidateQueries({ queryKey: ["categories", "list"] }),
	]);
}

function toQuerySummary(query: Query): QuerySummary {
	return {
		id: query.id,
		name: query.name,
		description: query.description,
		active: query.active,
		versionId: query.versionId,
		versionNumber: query.versionNumber,
		categories: query.categories,
	};
}

function buildOptimisticSummary(request: QueryRequest): QuerySummary {
	return {
		id: OPTIMISTIC_ID,
		name: request.name,
		description: request.description || null,
		active: request.active,
		versionId: OPTIMISTIC_ID,
		versionNumber: 1,
		categories: [],
	};
}

function applyRequestToSummary(
	summary: QuerySummary,
	request: QueryRequest,
): QuerySummary {
	return {
		...summary,
		name: request.name,
		description: request.description || null,
		active: request.active,
	};
}

export const queriesListOptions = () =>
	queryOptions({
		queryKey: queryKeys.list(),
		queryFn: listQueries,
		staleTime: 60_000,
	});

export const queryDetailOptions = (id: number | null) =>
	queryOptions({
		queryKey: queryKeys.detail(id ?? OPTIMISTIC_ID),
		queryFn: async () => {
			if (id === null) {
				throw new Error("A saved query is required to load details.");
			}
			return getQuery(id);
		},
		enabled: id !== null && id !== OPTIMISTIC_ID,
		staleTime: 30_000,
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

export const usePersistQuery = createPersistListDetailMutation<
	Query,
	QuerySummary,
	QueryRequest
>({
	listKey: queryKeys.list(),
	detailKey: queryKeys.detail,
	mutationFn: ({ id, request }) =>
		id === null ? createQuery(request) : updateQuery(id, request),
	buildOptimisticSummary,
	applyRequestToSummary,
	toSummary: toQuerySummary,
	getId: (entity) => entity.id,
	successMessage: "Query saved.",
	errorMessage: "Unable to save query.",
	onSettled: (data, _error, variables) => {
		void refreshMetadata();
		if (variables.id !== null) {
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
			void queryClient.invalidateQueries({
				queryKey: queryKeys.detail(variables.id),
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
	detailKey: queryKeys.detail,
	mutationFn: deleteQuery,
	successMessage: "Query deleted.",
	errorMessage: "Unable to delete query.",
	onSettled: refreshMetadata,
});
