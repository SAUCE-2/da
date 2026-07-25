import type { components } from "./api-schema";

type Schemas = components["schemas"];

export type QueryVariableType = NonNullable<
	Schemas["QueryVariableResponse"]["type"]
>;

export type QuerySectionOutline = Required<
	Pick<
		Schemas["QuerySectionOutlineResponse"],
		"name" | "level" | "startLine" | "endLine"
	>
>;

export type QueryVariable = Required<
	Pick<
		Schemas["QueryVariableResponse"],
		"id" | "name" | "type" | "required" | "sortOrder"
	>
> & {
	defaultValue: string | null;
};

export type CategorySummary = Required<
	Pick<Schemas["CategorySummaryResponse"], "id" | "name">
> & {
	description: string | null;
};

export type Category = CategorySummary & {
	queryCount?: number;
};

export type Query = Required<
	Pick<
		Schemas["QueryResponse"],
		| "id"
		| "name"
		| "active"
		| "versionId"
		| "versionNumber"
		| "query"
		| "queryHash"
	>
> & {
	description: string | null;
	defaultDisabledLines: number[];
	sections: QuerySectionOutline[];
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
		"versionId" | "versionNumber" | "createdAt" | "name" | "query" | "queryHash"
	>
> & {
	description: string | null;
	defaultDisabledLines: number[];
	sections: QuerySectionOutline[];
	variables: QueryVariable[];
};

export type QueryPreviewRequest = Schemas["QueryPreviewRequest"];

export type QueryPreview = Required<
	Pick<Schemas["QueryPreviewResponse"], "id" | "versionId" | "sql">
> & {
	unresolvedVariables: string[];
};

export type PlanItemVariableBinding = Required<
	Pick<Schemas["PlanItemVariableBindingResponse"], "name">
> & {
	value: string | null;
};

export type PlanItem = Required<
	Pick<
		Schemas["PlanItemResponse"],
		"id" | "queryId" | "queryName" | "sortOrder" | "enabled"
	>
> & {
	queryVersionId: number | null;
	queryVersionNumber: number | null;
	disabledLines: number[];
	variableBindings: PlanItemVariableBinding[];
};

export type Plan = Required<
	Pick<Schemas["PlanResponse"], "id" | "name" | "active">
> & {
	description: string | null;
	items: PlanItem[];
};
