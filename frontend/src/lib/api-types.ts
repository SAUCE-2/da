import type { components } from "./api-schema";

type Schemas = components["schemas"];

export type QueryVariableType = NonNullable<
	Schemas["QueryVariableResponse"]["type"]
>;

type QueryVariable = Required<
	Pick<
		Schemas["QueryVariableResponse"],
		"id" | "name" | "type" | "required" | "sortOrder"
	>
> & {
	defaultValue: string | null;
};

type CategorySummary = Required<
	Pick<Schemas["CategorySummaryResponse"], "id" | "name">
> & {
	description: string | null;
};

export type Category = CategorySummary & {
	queryCount?: number;
};

export type QuerySummary = Required<
	Pick<
		Schemas["QuerySummaryResponse"],
		"id" | "name" | "active" | "versionId" | "versionNumber"
	>
> & {
	description: string | null;
	categories: CategorySummary[];
};

export type Query = Required<
	Pick<
		Schemas["QueryResponse"],
		"id" | "name" | "active" | "versionId" | "versionNumber" | "query"
	>
> & {
	description: string | null;
	defaultDisabledLines: number[];
	variables: QueryVariable[];
	categories: CategorySummary[];
};

export type QueryVersionSummary = Required<
	Pick<
		Schemas["QueryVersionSummaryResponse"],
		"versionId" | "versionNumber" | "createdAt"
	>
>;

export type QueryVersion = Required<
	Pick<
		Schemas["QueryVersionResponse"],
		"versionId" | "versionNumber" | "createdAt" | "name" | "query"
	>
> & {
	description: string | null;
	defaultDisabledLines: number[];
	variables: QueryVariable[];
};

type PlanItemVariableBinding = Required<
	Pick<Schemas["PlanItemVariableBindingResponse"], "name">
> & {
	value: string | null;
};

type PlanItem = Required<
	Pick<Schemas["PlanItemResponse"], "id" | "queryId" | "sortOrder" | "enabled">
> & {
	disabledLines: number[];
	variableBindings: PlanItemVariableBinding[];
};

export type PlanSummary = Required<
	Pick<Schemas["PlanSummaryResponse"], "id" | "name" | "active" | "itemCount">
> & {
	description: string | null;
};

export type Plan = Required<
	Pick<Schemas["PlanResponse"], "id" | "name" | "active">
> & {
	description: string | null;
	items: PlanItem[];
};
