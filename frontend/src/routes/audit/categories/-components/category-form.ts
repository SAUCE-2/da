import {
  auditCategoryRequestSchema,
  formatZodError,
  type AuditCategory,
  type AuditCategoryRequest,
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
