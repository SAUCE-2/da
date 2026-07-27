import { queryOptions } from "@tanstack/react-query";

import type { Query } from "@/lib/api-types";
import {
	createPersistListMutation,
	createRemoveListMutation,
	OPTIMISTIC_ID,
} from "@/lib/query/optimistic-list-mutations";
import { queryClient } from "@/lib/query-client";

import {
	createQuery,
	deleteQuery,
	listQueries,
	listQueryVersions,
	updateQuery,
} from "./api";
import type { QueryRequest } from "./schema";

const queryKeys = {
	all: ["queries"] as const,
	list: () => [...queryKeys.all, "list"] as const,
	versions: (id: number) => [...queryKeys.all, "versions", id] as const,
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
