import {
	type QueryKey,
	type UseMutationOptions,
	useMutation,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { queryClient } from "@/lib/query-client";

/**
 * Temporary id used while a create mutation is in flight.
 * The UI hides Delete for this id; detail queries are disabled for it.
 */
export const OPTIMISTIC_ID = 0;

type PersistVariables<TRequest> = {
	id: number | null;
	request: TRequest;
};

type PersistListDetailMutationConfig<TEntity, TSummary, TRequest> = {
	listKey: QueryKey;
	detailKey: (id: number) => QueryKey;
	mutationFn: (variables: PersistVariables<TRequest>) => Promise<TEntity>;
	buildOptimisticSummary: (request: TRequest) => TSummary;
	applyRequestToSummary: (summary: TSummary, request: TRequest) => TSummary;
	toSummary: (entity: TEntity) => TSummary;
	getId: (entity: TEntity | TSummary) => number;
	successMessage: string;
	errorMessage: string;
	onSettled?: (
		data: TEntity | undefined,
		error: Error | null,
		variables: PersistVariables<TRequest>,
	) => void;
};

type RemoveListMutationConfig = {
	listKey: QueryKey;
	detailKey?: (id: number) => QueryKey;
	mutationFn: (id: number) => Promise<void>;
	successMessage: string;
	errorMessage: string;
	onSettled?: () => void;
};

export function createPersistListDetailMutation<TEntity, TSummary, TRequest>(
	config: PersistListDetailMutationConfig<TEntity, TSummary, TRequest>,
) {
	return (
		options?: Omit<
			UseMutationOptions<TEntity, Error, PersistVariables<TRequest>>,
			"mutationFn" | "onMutate" | "onSuccess" | "onError" | "onSettled"
		>,
	) =>
		useMutation({
			...options,
			mutationFn: config.mutationFn,
			onMutate: async ({ id, request }) => {
				await queryClient.cancelQueries({ queryKey: config.listKey });
				if (id !== null) {
					await queryClient.cancelQueries({
						queryKey: config.detailKey(id),
					});
				}

				const previousList = queryClient.getQueryData<TSummary[]>(
					config.listKey,
				);
				const previousDetail =
					id === null
						? undefined
						: queryClient.getQueryData<TEntity>(config.detailKey(id));

				if (id === null) {
					const optimistic = config.buildOptimisticSummary(request);
					queryClient.setQueryData<TSummary[]>(
						config.listKey,
						(current = []) => [...current, optimistic],
					);
				} else {
					queryClient.setQueryData<TSummary[]>(config.listKey, (current = []) =>
						current.map((summary) =>
							config.getId(summary) === id
								? config.applyRequestToSummary(summary, request)
								: summary,
						),
					);
				}

				return { previousList, previousDetail, id };
			},
			onSuccess: (saved, { id }) => {
				const summary = config.toSummary(saved);
				const savedId = config.getId(saved);

				if (id === null) {
					queryClient.setQueryData<TSummary[]>(config.listKey, (current = []) =>
						current.map((entity) =>
							config.getId(entity) === OPTIMISTIC_ID ? summary : entity,
						),
					);
				} else {
					queryClient.setQueryData<TSummary[]>(config.listKey, (current = []) =>
						current.map((entity) =>
							config.getId(entity) === id ? summary : entity,
						),
					);
				}

				queryClient.setQueryData(config.detailKey(savedId), saved);
				toast.success(config.successMessage);
			},
			onError: (error, variables, context) => {
				if (context?.previousList) {
					queryClient.setQueryData(config.listKey, context.previousList);
				}
				if (variables.id !== null && context?.previousDetail !== undefined) {
					queryClient.setQueryData(
						config.detailKey(variables.id),
						context.previousDetail,
					);
				}
				toast.error(
					error instanceof Error && error.message
						? error.message
						: config.errorMessage,
				);
			},
			onSettled: (data, error, variables) => {
				config.onSettled?.(data, error, variables);
			},
		});
}

/** List-only persist helper for entities without a separate detail cache. */
export function createPersistListMutation<TEntity, TRequest>(config: {
	listKey: QueryKey;
	mutationFn: (variables: PersistVariables<TRequest>) => Promise<TEntity>;
	buildOptimistic: (request: TRequest) => TEntity;
	applyRequest: (entity: TEntity, request: TRequest) => TEntity;
	getId: (entity: TEntity) => number;
	successMessage: string;
	errorMessage: string;
	onSettled?: (
		data: TEntity | undefined,
		error: Error | null,
		variables: PersistVariables<TRequest>,
	) => void;
}) {
	return createPersistListDetailMutation<TEntity, TEntity, TRequest>({
		listKey: config.listKey,
		detailKey: (id) =>
			[...(config.listKey as unknown[]), "detail", id] as QueryKey,
		mutationFn: config.mutationFn,
		buildOptimisticSummary: config.buildOptimistic,
		applyRequestToSummary: config.applyRequest,
		toSummary: (entity) => entity,
		getId: config.getId,
		successMessage: config.successMessage,
		errorMessage: config.errorMessage,
		onSettled: config.onSettled,
	});
}

export function createRemoveListMutation(config: RemoveListMutationConfig) {
	return (
		options?: Omit<
			UseMutationOptions<void, Error, number>,
			"mutationFn" | "onMutate" | "onSuccess" | "onError" | "onSettled"
		>,
	) =>
		useMutation({
			...options,
			mutationFn: config.mutationFn,
			onMutate: async (id) => {
				await queryClient.cancelQueries({ queryKey: config.listKey });
				if (config.detailKey) {
					await queryClient.cancelQueries({
						queryKey: config.detailKey(id),
					});
				}
				const previous = queryClient.getQueryData<unknown[]>(config.listKey);

				queryClient.setQueryData<unknown[]>(config.listKey, (current = []) =>
					current.filter((entity) => {
						if (!entity || typeof entity !== "object" || !("id" in entity)) {
							return true;
						}

						return entity.id !== id;
					}),
				);

				if (config.detailKey) {
					queryClient.removeQueries({ queryKey: config.detailKey(id) });
				}

				return { previous };
			},
			onSuccess: () => {
				toast.success(config.successMessage);
			},
			onError: (error, _id, context) => {
				if (context?.previous) {
					queryClient.setQueryData(config.listKey, context.previous);
				}
				toast.error(
					error instanceof Error && error.message
						? error.message
						: config.errorMessage,
				);
			},
			onSettled: () => {
				config.onSettled?.();
			},
		});
}
