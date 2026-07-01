import {
  auditQueryRequestSchema,
  formatZodError,
  type AuditQuery,
  type AuditQueryRequest,
} from '@/lib/audit-api'

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

const createClientId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

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

export function buildRequest(form: QueryFormState): {
  request?: AuditQueryRequest
  error?: string
} {
  const sections = form.sections.map((section, index) => ({
    name: section.name,
    sqlFragment: section.sqlFragment,
    sortOrder: Number.isFinite(section.sortOrder)
      ? section.sortOrder
      : (index + 1) * 10,
    defaultEnabled: section.defaultEnabled,
  }))

  const result = auditQueryRequestSchema.safeParse({
    name: form.name,
    description: form.description,
    active: form.active,
    sections,
    categoryIds: form.categoryIds,
  })

  if (!result.success) {
    return { error: formatZodError(result.error) }
  }

  return { request: result.data }
}

export function sortQueries(queries: AuditQuery[]) {
  return [...queries].sort((left, right) => left.name.localeCompare(right.name))
}

export function reindexSections(sections: ClientSection[]) {
  return sections.map((section, index) => ({
    ...section,
    sortOrder: (index + 1) * 10,
  }))
}
