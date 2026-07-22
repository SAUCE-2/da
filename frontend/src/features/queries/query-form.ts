import type { Query, QueryVariableType } from "@/lib/api-types";

export type ClientSection = {
	clientId: string;
	name: string;
	sqlFragment: string;
	sortOrder: number;
	defaultEnabled: boolean;
};

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
	sections: ClientSection[];
	variables: ClientVariable[];
};

export function createEmptySection(sortOrder: number): ClientSection {
	return {
		clientId: crypto.randomUUID(),
		name: "",
		sqlFragment: "",
		sortOrder,
		defaultEnabled: true,
	};
}

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

export function createEmptyQueryForm(): QueryFormValues {
	return {
		name: "",
		description: "",
		active: true,
		categoryIds: [],
		sections: [createEmptySection(0)],
		variables: [],
	};
}

export function queryToFormValues(query: Query): QueryFormValues {
	return {
		name: query.name,
		description: query.description ?? "",
		active: query.active,
		categoryIds: query.categories.map((category) => category.id),
		sections: query.sections.map((section) => ({
			clientId: crypto.randomUUID(),
			name: section.name,
			sqlFragment: section.sqlFragment,
			sortOrder: section.sortOrder,
			defaultEnabled: section.defaultEnabled,
		})),
		variables: query.variables.map((variable) => ({
			clientId: crypto.randomUUID(),
			name: variable.name,
			type: variable.type,
			defaultValue: variable.defaultValue ?? "",
			required: variable.required,
			sortOrder: variable.sortOrder,
		})),
	};
}

export function formValuesToQueryRequest(value: QueryFormValues) {
	const sections = value.sections.map((section, index) => ({
		name: section.name,
		sqlFragment: section.sqlFragment,
		sortOrder: Number.isFinite(section.sortOrder) ? section.sortOrder : index,
		defaultEnabled: section.defaultEnabled,
	}));

	const variables = value.variables.map((variable, index) => ({
		name: variable.name,
		type: variable.type,
		defaultValue: variable.defaultValue,
		required: variable.required,
		sortOrder: Number.isFinite(variable.sortOrder) ? variable.sortOrder : index,
	}));

	return {
		name: value.name,
		description: value.description,
		active: value.active,
		sections,
		variables,
		categoryIds: value.categoryIds,
	};
}

export function reindexSections(sections: ClientSection[]) {
	return sections.map((section, index) => ({
		...section,
		sortOrder: index,
	}));
}

export function reindexVariables(variables: ClientVariable[]) {
	return variables.map((variable, index) => ({
		...variable,
		sortOrder: index,
	}));
}

export function addSectionToForm(sections: ClientSection[]) {
	const lastSortOrder = sections.at(-1)?.sortOrder ?? 0;
	return [...sections, createEmptySection(lastSortOrder + 1)];
}

export function removeSectionFromForm(
	sections: ClientSection[],
	clientId: string,
) {
	return reindexSections(
		sections.filter((section) => section.clientId !== clientId),
	);
}

export function reorderSectionsInForm(
	sections: ClientSection[],
	fromIndex: number,
	toIndex: number,
) {
	const next = [...sections];
	const [removed] = next.splice(fromIndex, 1);
	next.splice(toIndex, 0, removed);
	return reindexSections(next);
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

export function toggleCategoryId(categoryIds: number[], categoryId: number) {
	return categoryIds.includes(categoryId)
		? categoryIds.filter((id) => id !== categoryId)
		: [...categoryIds, categoryId];
}
