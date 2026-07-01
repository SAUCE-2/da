import {
  auditCategoryRequestSchema,
  formatZodError,
  type AuditCategory,
  type AuditCategoryRequest,
  type AuditQuery,
} from '@/lib/audit-api'

export type CategoryFormState = {
  name: string
  description: string
}

export function createBlankForm(): CategoryFormState {
  return {
    name: '',
    description: '',
  }
}

export function toFormState(category: AuditCategory): CategoryFormState {
  return {
    name: category.name,
    description: category.description ?? '',
  }
}

export function buildRequest(form: CategoryFormState): {
  request?: AuditCategoryRequest
  error?: string
} {
  const result = auditCategoryRequestSchema.safeParse({
    name: form.name,
    description: form.description,
  })

  if (!result.success) {
    return { error: formatZodError(result.error) }
  }

  return { request: result.data }
}

export function buildDerivedQueryCounts(queries: AuditQuery[]) {
  const counts = new Map<number, number>()

  for (const query of queries) {
    for (const category of query.categories) {
      counts.set(category.id, (counts.get(category.id) ?? 0) + 1)
    }
  }

  return counts
}

export function getCategoryQueryCount(
  category: AuditCategory,
  derivedCounts: Map<number, number>,
) {
  return typeof category.queryCount === 'number'
    ? category.queryCount
    : (derivedCounts.get(category.id) ?? 0)
}
