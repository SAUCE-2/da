import type { AuditQuery } from '@/lib/audit-api'

export type ClientSection = {
  clientId: string
  name: string
  sqlFragment: string
  sortOrder: number
  defaultEnabled: boolean
}

export type QueryFormState = {
  name: string
  description: string
  active: boolean
  categoryIds: number[]
  sections: ClientSection[]
}

const createClientId = () => crypto.randomUUID()

export function createBlankSection(sortOrder: number): ClientSection {
  return {
    clientId: createClientId(),
    name: '',
    sqlFragment: '',
    sortOrder,
    defaultEnabled: true,
  }
}

export function createBlankForm(): QueryFormState {
  return {
    name: '',
    description: '',
    active: true,
    categoryIds: [],
    sections: [createBlankSection(10)],
  }
}

export function toFormState(query: AuditQuery): QueryFormState {
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
  }
}

export function toAuditQueryRequest(value: QueryFormState) {
  const sections = value.sections.map((section, index) => ({
    name: section.name,
    sqlFragment: section.sqlFragment,
    sortOrder: Number.isFinite(section.sortOrder)
      ? section.sortOrder
      : (index + 1) * 10,
    defaultEnabled: section.defaultEnabled,
  }))

  return {
    name: value.name,
    description: value.description,
    active: value.active,
    sections,
    categoryIds: value.categoryIds,
  }
}

export function reindexSections(sections: ClientSection[]) {
  return sections.map((section, index) => ({
    ...section,
    sortOrder: (index + 1) * 10,
  }))
}
