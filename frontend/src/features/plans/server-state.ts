import { queryOptions } from "@tanstack/react-query";

import type { Plan, PlanSummary } from "@/lib/api-types";
import {
	createPersistListDetailMutation,
	createRemoveListMutation,
	OPTIMISTIC_ID,
} from "@/lib/query/optimistic-list-mutations";

import { createPlan, deletePlan, getPlan, listPlans, updatePlan } from "./api";
import type { PlanRequest } from "./schema";

const planKeys = {
	all: ["plans"] as const,
	list: () => [...planKeys.all, "list"] as const,
	detail: (id: number) => [...planKeys.all, "detail", id] as const,
};

function toPlanSummary(plan: Plan): PlanSummary {
	return {
		id: plan.id,
		name: plan.name,
		description: plan.description,
		active: plan.active,
		itemCount: plan.items.length,
	};
}

function buildOptimisticSummary(request: PlanRequest): PlanSummary {
	return {
		id: OPTIMISTIC_ID,
		name: request.name,
		description: request.description || null,
		active: request.active,
		itemCount: request.items.length,
	};
}

function applyRequestToSummary(
	summary: PlanSummary,
	request: PlanRequest,
): PlanSummary {
	return {
		...summary,
		name: request.name,
		description: request.description || null,
		active: request.active,
		itemCount: request.items.length,
	};
}

export const plansListOptions = () =>
	queryOptions({
		queryKey: planKeys.list(),
		queryFn: listPlans,
		staleTime: 60_000,
	});

export const planDetailOptions = (id: number | null) =>
	queryOptions({
		queryKey: planKeys.detail(id ?? OPTIMISTIC_ID),
		queryFn: async () => {
			if (id === null) {
				throw new Error("A saved plan is required to load details.");
			}
			return getPlan(id);
		},
		enabled: id !== null && id !== OPTIMISTIC_ID,
		staleTime: 30_000,
	});

export const usePersistPlan = createPersistListDetailMutation<
	Plan,
	PlanSummary,
	PlanRequest
>({
	listKey: planKeys.list(),
	detailKey: planKeys.detail,
	mutationFn: ({ id, request }) =>
		id === null ? createPlan(request) : updatePlan(id, request),
	buildOptimisticSummary,
	applyRequestToSummary,
	toSummary: toPlanSummary,
	getId: (entity) => entity.id,
	successMessage: "Plan saved.",
	errorMessage: "Unable to save plan.",
});

export const useRemovePlan = createRemoveListMutation({
	listKey: planKeys.list(),
	detailKey: planKeys.detail,
	mutationFn: deletePlan,
	successMessage: "Plan deleted.",
	errorMessage: "Unable to delete plan.",
});
