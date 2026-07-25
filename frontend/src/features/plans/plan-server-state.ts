import { queryOptions } from "@tanstack/react-query";

import type { Plan } from "@/lib/api-types";
import {
	createPersistListMutation,
	createRemoveListMutation,
	OPTIMISTIC_ID,
} from "@/lib/query/optimistic-list-mutations";

import { createPlan, deletePlan, listPlans, updatePlan } from "./plan-api";
import type { PlanRequest } from "./plan-schema";

export const planKeys = {
	all: ["plans"] as const,
	list: () => [...planKeys.all, "list"] as const,
};

function buildOptimisticPlan(request: PlanRequest): Plan {
	return {
		id: OPTIMISTIC_ID,
		name: request.name,
		description: request.description || null,
		active: request.active,
		items: request.items.map((item, index) => ({
			id: index,
			queryId: item.queryId,
			queryName: "",
			sortOrder: item.sortOrder,
			enabled: item.enabled,
			queryVersionId: null,
			queryVersionNumber: null,
			disabledLines: item.disabledLines ?? [],
			variableBindings: item.variableBindings.map((binding) => ({
				name: binding.name,
				value: binding.value ?? null,
			})),
		})),
	};
}

function applyRequestToPlan(plan: Plan, request: PlanRequest): Plan {
	return {
		...plan,
		name: request.name,
		description: request.description || null,
		active: request.active,
		items: request.items.map((item, index) => ({
			id: plan.items[index]?.id ?? index,
			queryId: item.queryId,
			queryName: plan.items[index]?.queryName ?? "",
			sortOrder: item.sortOrder,
			enabled: item.enabled,
			queryVersionId: plan.items[index]?.queryVersionId ?? null,
			queryVersionNumber: plan.items[index]?.queryVersionNumber ?? null,
			disabledLines:
				item.disabledLines ?? plan.items[index]?.disabledLines ?? [],
			variableBindings: item.variableBindings.map((binding) => ({
				name: binding.name,
				value: binding.value ?? null,
			})),
		})),
	};
}

export const plansListOptions = () =>
	queryOptions({
		queryKey: planKeys.list(),
		queryFn: listPlans,
		staleTime: 60_000,
	});

export const usePersistPlan = createPersistListMutation<Plan, PlanRequest>({
	listKey: planKeys.list(),
	mutationFn: ({ id, request }) =>
		id === null ? createPlan(request) : updatePlan(id, request),
	buildOptimistic: buildOptimisticPlan,
	applyRequest: applyRequestToPlan,
	getId: (plan) => plan.id,
	successMessage: "Plan saved.",
	errorMessage: "Unable to save plan.",
});

export const useRemovePlan = createRemoveListMutation({
	listKey: planKeys.list(),
	mutationFn: deletePlan,
	successMessage: "Plan deleted.",
	errorMessage: "Unable to delete plan.",
});
