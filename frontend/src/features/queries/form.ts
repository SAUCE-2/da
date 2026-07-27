import type { Query, QueryVariableType } from "@/lib/api-types";

export type ClientVariable = {
	clientId: string;
	name: string;
	type: QueryVariableType;
	defaultValue: string;
	required: boolean;
	sortOrder: number;
};

export type QueryFormValues = {
	name: string;
	description: string;
	active: boolean;
	categoryIds: number[];
	query: string;
	defaultDisabledLines: number[];
	variables: ClientVariable[];
};

const DEFAULT_QUERY = `--# Base
select 1
from dual
`;

export function createEmptyVariable(sortOrder: number): ClientVariable {
	return {
		clientId: crypto.randomUUID(),
		name: "",
		type: "STRING",
		defaultValue: "",
		required: false,
		sortOrder,
	};
}

function mapVariablesToForm(
	variables: Array<{
		name: string;
		type: QueryVariableType;
		defaultValue: string | null;
		required: boolean;
		sortOrder: number;
	}>,
): ClientVariable[] {
	if (variables.length === 0) {
		return [createEmptyVariable(0)];
	}

	return variables.map((variable) => ({
		clientId: crypto.randomUUID(),
		name: variable.name,
		type: variable.type,
		defaultValue: variable.defaultValue ?? "",
		required: variable.required,
		sortOrder: variable.sortOrder,
	}));
}

export function createEmptyQueryForm(): QueryFormValues {
	return {
		name: "",
		description: "",
		active: true,
		categoryIds: [],
		query: DEFAULT_QUERY,
		defaultDisabledLines: [],
		variables: [createEmptyVariable(0)],
	};
}

export function queryToFormValues(query: Query): QueryFormValues {
	return {
		name: query.name,
		description: query.description ?? "",
		active: query.active,
		categoryIds: query.categories.map((category) => category.id),
		query: query.query,
		defaultDisabledLines: [...query.defaultDisabledLines],
		variables: mapVariablesToForm(query.variables),
	};
}

export function formValuesToQueryRequest(value: QueryFormValues) {
	const variables = value.variables
		.filter((variable) => variable.name.trim().length > 0)
		.map((variable, index) => ({
			name: variable.name,
			type: variable.type,
			defaultValue: variable.defaultValue,
			required: variable.required,
			sortOrder: index,
		}));

	return {
		name: value.name,
		description: value.description,
		active: value.active,
		query: value.query,
		defaultDisabledLines: value.defaultDisabledLines,
		variables,
		categoryIds: value.categoryIds,
	};
}

export function reindexVariables(variables: ClientVariable[]) {
	return variables.map((variable, index) => ({
		...variable,
		sortOrder: index,
	}));
}

export function addVariableToForm(variables: ClientVariable[]) {
	const lastSortOrder = variables.at(-1)?.sortOrder ?? 0;
	return [...variables, createEmptyVariable(lastSortOrder + 1)];
}

export function removeVariableFromForm(
	variables: ClientVariable[],
	clientId: string,
) {
	return reindexVariables(
		variables.filter((variable) => variable.clientId !== clientId),
	);
}

export function versionDocumentToFormFields(version: {
	name: string;
	description: string | null;
	query: string;
	defaultDisabledLines: number[];
	variables: Array<{
		name: string;
		type: QueryVariableType;
		defaultValue: string | null;
		required: boolean;
		sortOrder: number;
	}>;
}): Pick<
	QueryFormValues,
	"name" | "description" | "query" | "defaultDisabledLines" | "variables"
> {
	return {
		name: version.name,
		description: version.description ?? "",
		query: version.query,
		defaultDisabledLines: [...version.defaultDisabledLines],
		variables: mapVariablesToForm(version.variables),
	};
}

export function toggleCategoryId(categoryIds: number[], categoryId: number) {
	return categoryIds.includes(categoryId)
		? categoryIds.filter((id) => id !== categoryId)
		: [...categoryIds, categoryId];
}
