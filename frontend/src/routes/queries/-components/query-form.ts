import type { Query, QueryVariableType } from '@/lib/api'
import { createClientId } from '@/lib/form-client-id'

export type ClientSection = {
  clientId: string
  name: string
  sqlFragment: string
  sortOrder: number
  defaultEnabled: boolean
}

export type ClientVariable = {
  clientId: string
  name: string
  type: QueryVariableType
  defaultValue: string
  required: boolean
  sortOrder: number
}

export type QueryFormState = {
  name: string
  description: string
  active: boolean
  categoryIds: number[]
  sections: ClientSection[]
  variables: ClientVariable[]
}

export function createBlankSection(sortOrder: number): ClientSection {
  return {
    clientId: createClientId(),
    name: '',
    sqlFragment: '',
    sortOrder,
    defaultEnabled: true,
  }
}

export function createBlankVariable(sortOrder: number): ClientVariable {
  return {
    clientId: createClientId(),
    name: '',
    type: 'STRING',
    defaultValue: '',
    required: false,
    sortOrder,
  }
}

export function createBlankForm(): QueryFormState {
  return {
    name: '',
    description: '',
    active: true,
    categoryIds: [],
    sections: [createBlankSection(0)],
    variables: [],
  }
}

export function toFormState(query: Query): QueryFormState {
  return {
    name: query.name,
    description: query.description ?? '',
    active: query.active,
    categoryIds: query.categories.map((category) => category.id),
    sections: query.sections.map((section) => ({
      clientId: createClientId(),
      name: section.name,
      sqlFragment: section.sqlFragment,
      sortOrder: section.sortOrder,
      defaultEnabled: section.defaultEnabled,
    })),
    variables: query.variables.map((variable) => ({
      clientId: createClientId(),
      name: variable.name,
      type: variable.type,
      defaultValue: variable.defaultValue ?? '',
      required: variable.required,
      sortOrder: variable.sortOrder,
    })),
  }
}

export function toQueryRequest(value: QueryFormState) {
  const sections = value.sections.map((section, index) => ({
    name: section.name,
    sqlFragment: section.sqlFragment,
    sortOrder: Number.isFinite(section.sortOrder) ? section.sortOrder : index,
    defaultEnabled: section.defaultEnabled,
  }))

  const variables = value.variables.map((variable, index) => ({
    name: variable.name,
    type: variable.type,
    defaultValue: variable.defaultValue,
    required: variable.required,
    sortOrder: Number.isFinite(variable.sortOrder) ? variable.sortOrder : index,
  }))

  return {
    name: value.name,
    description: value.description,
    active: value.active,
    sections,
    variables,
    categoryIds: value.categoryIds,
  }
}

export function reindexSections(sections: ClientSection[]) {
  return sections.map((section, index) => ({
    ...section,
    sortOrder: index,
  }))
}

export function reindexVariables(variables: ClientVariable[]) {
  return variables.map((variable, index) => ({
    ...variable,
    sortOrder: index,
  }))
}

