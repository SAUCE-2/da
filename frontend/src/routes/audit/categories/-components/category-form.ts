import type { AuditCategory } from '@/lib/audit-api'

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
