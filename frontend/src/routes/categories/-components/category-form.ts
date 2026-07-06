import type { Category } from '@/lib/api'

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

export function toFormState(category: Category): CategoryFormState {
  return {
    name: category.name,
    description: category.description ?? '',
  }
}
