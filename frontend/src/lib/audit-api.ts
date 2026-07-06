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

export type AuditCategorySummary = {
  id: number
  name: string
  description: string | null
}

export type AuditCategory = AuditCategorySummary & {
  queryCount?: number
}

export type AuditQuery = {
  id: number
  name: string
  description: string | null
  active: boolean
  versionId: number
  versionNumber: number
  sections: QuerySection[]
  variables: QueryVariable[]
  categories: AuditCategorySummary[]
}

export type AuditQueryVersionSummary = {
  versionId: number
  versionNumber: number
  createdAt: string
}

export type AuditQueryVersion = AuditQueryVersionSummary & {
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

export const auditCategoryRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Category name is required.')
    .max(200, 'Category name must be 200 characters or fewer.'),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or fewer.'),
})

export const auditQueryRequestSchema = z.object({
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
export type AuditCategoryRequest = z.infer<typeof auditCategoryRequestSchema>
export type AuditQueryRequest = z.infer<typeof auditQueryRequestSchema>

export type AuditQueryPreviewRequest = {
  versionId?: number | null
  variables?: Record<string, string>
}

export type AuditQueryPreview = {
  id: number
  versionId: number
  sql: string
  unresolvedVariables: string[]
}

export type Environment = {
  id: number
  name: string
  code: string
  active: boolean
}

export type Project = {
  id: number
  environmentId: number
  name: string
  code: string
  schemaName: string | null
  active: boolean
}

export type PlanItemVariableBinding = {
  name: string
  value: string | null
}

export type PlanItem = {
  id: number
  auditQueryId: number
  auditQueryName: string
  auditQueryVersionId: number | null
  auditQueryVersionNumber: number | null
  sortOrder: number
  enabled: boolean
  variableBindings: PlanItemVariableBinding[]
}

export type AuditPlan = {
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
  auditQueryId: z.number(),
  auditQueryVersionId: z.number().nullable().optional(),
  sortOrder: z.number().finite(),
  enabled: z.boolean(),
  variableBindings: z.array(planItemVariableBindingRequestSchema),
})

export const auditPlanRequestSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().max(1000),
  active: z.boolean(),
  items: z.array(planItemRequestSchema),
})

export type PlanItemRequest = z.infer<typeof planItemRequestSchema>
export type AuditPlanRequest = z.infer<typeof auditPlanRequestSchema>

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

export function listAuditQueries() {
  return apiRequest<AuditQuery[]>('/api/audit-queries')
}

export function createAuditQuery(request: AuditQueryRequest) {
  return apiRequest<AuditQuery>('/api/audit-queries', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function updateAuditQuery(id: number, request: AuditQueryRequest) {
  return apiRequest<AuditQuery>(`/api/audit-queries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function deleteAuditQuery(id: number) {
  return apiRequest<void>(`/api/audit-queries/${id}`, {
    method: 'DELETE',
  })
}

export function listAuditQueryVersions(queryId: number) {
  return apiRequest<AuditQueryVersionSummary[]>(
    `/api/audit-queries/${queryId}/versions`,
  )
}

export function previewAuditQuery(
  id: number,
  request: AuditQueryPreviewRequest = {},
) {
  return apiRequest<AuditQueryPreview>(`/api/audit-queries/${id}/preview`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function listAuditCategories() {
  return apiRequest<AuditCategory[]>('/api/audit-categories')
}

export function createAuditCategory(request: AuditCategoryRequest) {
  return apiRequest<AuditCategory>('/api/audit-categories', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function updateAuditCategory(id: number, request: AuditCategoryRequest) {
  return apiRequest<AuditCategory>(`/api/audit-categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function deleteAuditCategory(id: number) {
  return apiRequest<void>(`/api/audit-categories/${id}`, {
    method: 'DELETE',
  })
}

export function listEnvironments() {
  return apiRequest<Environment[]>('/api/environments')
}

export function listProjects(environmentId: number) {
  return apiRequest<Project[]>(`/api/environments/${environmentId}/projects`)
}

export function listAuditPlans() {
  return apiRequest<AuditPlan[]>('/api/audit-plans')
}

export function createAuditPlan(request: AuditPlanRequest) {
  return apiRequest<AuditPlan>('/api/audit-plans', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function updateAuditPlan(id: number, request: AuditPlanRequest) {
  return apiRequest<AuditPlan>(`/api/audit-plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function deleteAuditPlan(id: number) {
  return apiRequest<void>(`/api/audit-plans/${id}`, {
    method: 'DELETE',
  })
}
