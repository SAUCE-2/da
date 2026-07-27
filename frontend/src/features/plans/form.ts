import type { Plan, Query } from "@/lib/api-types";

export type ClientPlanItem = {
	clientId: string;
	queryId: number | null;
	sortOrder: number;
	enabled: boolean;
	disabledLines: number[];
	variableBindings: Record<string, string>;
};

export type PlanFormValues = {
	name: string;
	description: string;
	active: boolean;
	items: ClientPlanItem[];
};

export function createEmptyPlanItem(sortOrder: number): ClientPlanItem {
	return {
		clientId: crypto.randomUUID(),
		queryId: null,
		sortOrder,
		enabled: true,
		disabledLines: [],
		variableBindings: {},
	};
}

export function createEmptyPlanForm(): PlanFormValues {
	return {
		name: "",
		description: "",
		active: true,
		items: [],
	};
}

export function planToFormValues(plan: Plan): PlanFormValues {
	return {
		name: plan.name,
		description: plan.description ?? "",
		active: plan.active,
		items: plan.items.map((item) => ({
			clientId: crypto.randomUUID(),
			queryId: item.queryId,
			sortOrder: item.sortOrder,
			enabled: item.enabled,
			disabledLines: [...(item.disabledLines ?? [])],
			variableBindings: Object.fromEntries(
				item.variableBindings.map((binding) => [
					binding.name,
					binding.value ?? "",
				]),
			),
		})),
	};
}

export function formValuesToPlanRequest(value: PlanFormValues) {
	return {
		name: value.name,
		description: value.description,
		active: value.active,
		items: value.items
			.filter(
				(item): item is ClientPlanItem & { queryId: number } =>
					item.queryId !== null,
			)
			.map((item, index) => ({
				queryId: item.queryId,
				sortOrder: Number.isFinite(item.sortOrder) ? item.sortOrder : index,
				enabled: item.enabled,
				disabledLines: item.disabledLines,
				variableBindings: Object.entries(item.variableBindings).map(
					([name, value]) => ({ name, value }),
				),
			})),
	};
}

export function seedVariableBindings(
	query: Query | undefined,
): Record<string, string> {
	if (!query) {
		return {};
	}

	const bindings: Record<string, string> = {};
	for (const variable of query.variables) {
		const name = variable.name.trim();
		if (!name) {
			continue;
		}
		bindings[name] = variable.defaultValue ?? "";
	}
	return bindings;
}

function seedDisabledLines(query: Query | undefined): number[] {
	if (!query) {
		return [];
	}
	return [...query.defaultDisabledLines];
}

export function reindexPlanItems(items: ClientPlanItem[]) {
	return items.map((item, index) => ({
		...item,
		sortOrder: index,
	}));
}

export function addItemToForm(items: ClientPlanItem[]) {
	const lastSortOrder = items.at(-1)?.sortOrder ?? 0;
	return [...items, createEmptyPlanItem(lastSortOrder + 1)];
}

export function removeItemFromForm(items: ClientPlanItem[], clientId: string) {
	return reindexPlanItems(items.filter((item) => item.clientId !== clientId));
}

export function reorderItemsInForm(
	items: ClientPlanItem[],
	fromIndex: number,
	toIndex: number,
) {
	const next = [...items];
	const [removed] = next.splice(fromIndex, 1);
	next.splice(toIndex, 0, removed);
	return reindexPlanItems(next);
}

export function changeItemQuery(
	items: ClientPlanItem[],
	clientId: string,
	queryId: number | null,
	queries: Query[],
) {
	return items.map((item) =>
		item.clientId === clientId
			? {
					...item,
					queryId,
					disabledLines: seedDisabledLines(
						queries.find((query) => query.id === queryId),
					),
					variableBindings: seedVariableBindings(
						queries.find((query) => query.id === queryId),
					),
				}
			: item,
	);
}
