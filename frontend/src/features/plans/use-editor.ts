import { useForm, useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { queriesListOptions } from "@/features/queries/server-state";
import { formatZodError } from "@/lib/format-zod-error";

import {
	addItemToForm,
	changeItemQuery,
	createEmptyPlanForm,
	formValuesToPlanRequest,
	planToFormValues,
	removeItemFromForm,
	reorderItemsInForm,
} from "./form";
import { planRequestSchema } from "./schema";
import {
	plansListOptions,
	usePersistPlan,
	useRemovePlan,
} from "./server-state";

function readSubmitError(errorMap: unknown) {
	const err = (errorMap as { onSubmit?: unknown })?.onSubmit;
	return typeof err === "string" && err.length > 0 ? err : null;
}

export function usePlanEditor(entityId: number | null) {
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const persistPlan = usePersistPlan();
	const removePlan = useRemovePlan();

	const { data: plans = [], isFetched } = useQuery(plansListOptions());
	const { data: queries = [] } = useQuery(queriesListOptions());

	const selectedPlan =
		entityId === null
			? null
			: (plans.find((plan) => plan.id === entityId) ?? null);
	const isNotFound = isFetched && entityId !== null && selectedPlan === null;

	// Stabilize defaultValues: planToFormValues mints new clientIds each call,
	// and TanStack Form's update() resets untouched forms when defaults change —
	// which would infinite-loop on every render.
	const initialFormValues = useMemo(
		() =>
			entityId === null
				? createEmptyPlanForm()
				: selectedPlan
					? planToFormValues(selectedPlan)
					: createEmptyPlanForm(),
		[entityId, selectedPlan],
	);

	const form = useForm({
		defaultValues: initialFormValues,
		validators: {
			onSubmit: ({ value }) => {
				const unselected = value.items.find((item) => item.queryId === null);
				if (unselected) {
					return "Select a query for every step in the plan.";
				}
				const result = planRequestSchema.safeParse(
					formValuesToPlanRequest(value),
				);
				return result.success ? undefined : formatZodError(result.error);
			},
		},
		onSubmit: async ({ value }) => {
			const request = planRequestSchema.parse(formValuesToPlanRequest(value));
			setErrorMessage(null);

			const wasCreate = entityId === null;

			try {
				const saved = await persistPlan.mutateAsync({
					id: entityId,
					request,
				});
				form.reset(planToFormValues(saved));
				if (wasCreate) {
					void navigate({
						to: "/plans/$planId",
						params: { planId: saved.id },
						replace: true,
					});
				}
			} catch {
				// Stay on the current create/edit URL on failure.
			}
		},
	});

	const submitError = useStore(form.store, (state) =>
		readSubmitError(state.errorMap),
	);

	function handleDelete() {
		if (entityId === null) {
			return;
		}
		setErrorMessage(null);
		void navigate({ to: "/plans/new", replace: true });
		removePlan.mutate(entityId);
	}

	function handleBack() {
		void navigate({ to: "/plans/new" });
	}

	function addItem() {
		form.setFieldValue("items", addItemToForm(form.getFieldValue("items")));
	}

	function removeItem(clientId: string) {
		form.setFieldValue(
			"items",
			removeItemFromForm(form.getFieldValue("items"), clientId),
		);
	}

	function reorderItem(fromIndex: number, toIndex: number) {
		form.setFieldValue(
			"items",
			reorderItemsInForm(form.getFieldValue("items"), fromIndex, toIndex),
		);
	}

	function handleQueryChange(clientId: string, queryId: number | null) {
		form.setFieldValue(
			"items",
			changeItemQuery(form.getFieldValue("items"), clientId, queryId, queries),
		);
	}

	return {
		entityId,
		selectedPlanName: selectedPlan?.name ?? null,
		isNotFound,
		form,
		queries,
		isSaving: persistPlan.isPending,
		errorMessage: errorMessage ?? submitError,
		handleDelete,
		handleBack,
		addItem,
		removeItem,
		reorderItem,
		handleQueryChange,
	};
}

export type PlanEditorForm = ReturnType<typeof usePlanEditor>["form"];
