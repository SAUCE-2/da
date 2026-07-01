import { z } from 'zod'

export type QuerySection = {
  id: number
  name: string
  sqlFragment: string
  sortOrder: number
  defaultEnabled: boolean
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
  sections: QuerySection[]
  categories: AuditCategorySummary[]
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
  categoryIds: z.array(z.number()),
})

export type QuerySectionRequest = z.infer<typeof querySectionRequestSchema>
export type AuditCategoryRequest = z.infer<typeof auditCategoryRequestSchema>
export type AuditQueryRequest = z.infer<typeof auditQueryRequestSchema>

export type AuditQueryPreview = {
  id: number
  sql: string
}

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

export function getAuditQueryPreview(id: number) {
  return apiRequest<AuditQueryPreview>(`/api/audit-queries/${id}/preview`)
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
