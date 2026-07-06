import { z } from 'zod'

export type QueryVariableType = 'STRING' | 'NUMBER' | 'DATE'

export type QuerySection = {
  id: number
  name: string
  sqlFragment: string
  sortOrder: number
  defaultEnabled: boolean
}

export type QueryVariable = {
  id: number
  name: string
  type: QueryVariableType
  defaultValue: string | null
  required: boolean
  sortOrder: number
}

export type CategorySummary = {
  id: number
  name: string
  description: string | null
}

export type Category = CategorySummary & {
  queryCount?: number
}

export type Query = {
  id: number
  name: string
  description: string | null
  active: boolean
  versionId: number
  versionNumber: number
  sections: QuerySection[]
  variables: QueryVariable[]
  categories: CategorySummary[]
}

export type QueryVersionSummary = {
  versionId: number
  versionNumber: number
  createdAt: string
}

export type QueryVersion = QueryVersionSummary & {
  sections: QuerySection[]
  variables: QueryVariable[]
}

export const querySectionRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Section name is required.')
    .max(200, 'Section name must be 200 characters or fewer.'),
  sqlFragment: z
    .string()
    .trim()
    .min(1, 'Every query section needs a SQL fragment.'),
  sortOrder: z.number().finite(),
  defaultEnabled: z.boolean(),
})

export const queryVariableRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Variable name is required.')
    .max(100, 'Variable name must be 100 characters or fewer.')
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]*$/,
      'Variable names must start with a letter and use letters, numbers, or underscores.',
    ),
  type: z.enum(['STRING', 'NUMBER', 'DATE']),
  defaultValue: z
    .string()
    .max(1000, 'Default value must be 1000 characters or fewer.'),
  required: z.boolean(),
  sortOrder: z.number().finite(),
})

export const categoryRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Category name is required.')
    .max(200, 'Category name must be 200 characters or fewer.'),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or fewer.'),
})

export const queryRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Query name is required.')
    .max(200, 'Query name must be 200 characters or fewer.'),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or fewer.'),
  active: z.boolean(),
  sections: z
    .array(querySectionRequestSchema)
    .min(1, 'At least one query section is required.'),
  variables: z.array(queryVariableRequestSchema),
  categoryIds: z.array(z.number()),
})

export type QuerySectionRequest = z.infer<typeof querySectionRequestSchema>
export type QueryVariableRequest = z.infer<typeof queryVariableRequestSchema>
export type CategoryRequest = z.infer<typeof categoryRequestSchema>
export type QueryRequest = z.infer<typeof queryRequestSchema>

export type QueryPreviewRequest = {
  versionId?: number | null
  variables?: Record<string, string>
}

export type QueryPreview = {
  id: number
  versionId: number
  sql: string
  unresolvedVariables: string[]
}

export type PlanItemVariableBinding = {
  name: string
  value: string | null
}

export type PlanItem = {
  id: number
  queryId: number
  queryName: string
  queryVersionId: number | null
  queryVersionNumber: number | null
  sortOrder: number
  enabled: boolean
  variableBindings: PlanItemVariableBinding[]
}

export type Plan = {
  id: number
  name: string
  description: string | null
  active: boolean
  items: PlanItem[]
}

export const planItemVariableBindingRequestSchema = z.object({
  name: z.string().trim().min(1).max(100),
  value: z.string().max(1000),
})

export const planItemRequestSchema = z.object({
  queryId: z.number(),
  queryVersionId: z.number().nullable().optional(),
  sortOrder: z.number().finite(),
  enabled: z.boolean(),
  variableBindings: z.array(planItemVariableBindingRequestSchema),
})

export const planRequestSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().max(1000),
  active: z.boolean(),
  items: z.array(planItemRequestSchema),
})

export type PlanItemRequest = z.infer<typeof planItemRequestSchema>
export type PlanRequest = z.infer<typeof planRequestSchema>

export function formatZodError(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Validation failed.'
}

async function apiRequest<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || `Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export function listQueries() {
  return apiRequest<Query[]>('/api/queries')
}

export function createQuery(request: QueryRequest) {
  return apiRequest<Query>('/api/queries', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function updateQuery(id: number, request: QueryRequest) {
  return apiRequest<Query>(`/api/queries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function deleteQuery(id: number) {
  return apiRequest<void>(`/api/queries/${id}`, {
    method: 'DELETE',
  })
}

export function listQueryVersions(queryId: number) {
  return apiRequest<QueryVersionSummary[]>(
    `/api/queries/${queryId}/versions`,
  )
}

export function previewQuery(
  id: number,
  request: QueryPreviewRequest = {},
) {
  return apiRequest<QueryPreview>(`/api/queries/${id}/preview`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function listCategories() {
  return apiRequest<Category[]>('/api/categories')
}

export function createCategory(request: CategoryRequest) {
  return apiRequest<Category>('/api/categories', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function updateCategory(id: number, request: CategoryRequest) {
  return apiRequest<Category>(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function deleteCategory(id: number) {
  return apiRequest<void>(`/api/categories/${id}`, {
    method: 'DELETE',
  })
}

export function listPlans() {
  return apiRequest<Plan[]>('/api/plans')
}

export function createPlan(request: PlanRequest) {
  return apiRequest<Plan>('/api/plans', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function updatePlan(id: number, request: PlanRequest) {
  return apiRequest<Plan>(`/api/plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function deletePlan(id: number) {
  return apiRequest<void>(`/api/plans/${id}`, {
    method: 'DELETE',
  })
}
