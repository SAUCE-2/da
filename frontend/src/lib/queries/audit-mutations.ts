import { toast } from 'sonner'

import {
  createAuditCategory,
  createAuditQuery,
  deleteAuditCategory,
  deleteAuditQuery,
  updateAuditCategory,
  updateAuditQuery,
  type AuditCategory,
  type AuditCategoryRequest,
  type AuditQuery,
  type AuditQueryRequest,
} from '@/lib/audit-api'
import { getErrorMessage } from '@/lib/get-error-message'
import { queryClient } from '@/lib/query-client'

import { auditCategoryKeys, auditQueryKeys } from './audit-keys'

export const OPTIMISTIC_ID = 0

function refreshAuditMetadata() {
  void Promise.all([
    queryClient.invalidateQueries({ queryKey: auditQueryKeys.list() }),
    queryClient.invalidateQueries({ queryKey: auditCategoryKeys.list() }),
  ])
}

function buildOptimisticQuery(request: AuditQueryRequest): AuditQuery {
  return {
    id: OPTIMISTIC_ID,
    name: request.name,
    description: request.description || null,
    active: request.active,
    sections: request.sections.map((section, index) => ({
      id: index,
      ...section,
    })),
    categories: [],
  }
}

function applyRequestToQuery(query: AuditQuery, request: AuditQueryRequest): AuditQuery {
  return {
    ...query,
    name: request.name,
    description: request.description || null,
    active: request.active,
    sections: request.sections.map((section, index) => ({
      id: query.sections[index]?.id ?? index,
      ...section,
    })),
  }
}

function buildOptimisticCategory(request: AuditCategoryRequest): AuditCategory {
  return {
    id: OPTIMISTIC_ID,
    name: request.name,
    description: request.description || null,
  }
}

export async function persistAuditQuery(
  id: number | null,
  request: AuditQueryRequest,
): Promise<AuditQuery> {
  const listKey = auditQueryKeys.list()
  const previous = queryClient.getQueryData<AuditQuery[]>(listKey)

  try {
    if (id === null) {
      const optimistic = buildOptimisticQuery(request)
      queryClient.setQueryData<AuditQuery[]>(listKey, (current = []) => [
        ...current,
        optimistic,
      ])

      const saved = await createAuditQuery(request)
      queryClient.setQueryData<AuditQuery[]>(listKey, (current = []) =>
        current.map((query) => (query.id === OPTIMISTIC_ID ? saved : query)),
      )

      toast.success('Audit query saved.')
      return saved
    }

    queryClient.setQueryData<AuditQuery[]>(listKey, (current = []) =>
      current.map((query) =>
        query.id === id ? applyRequestToQuery(query, request) : query,
      ),
    )

    const saved = await updateAuditQuery(id, request)
    queryClient.setQueryData<AuditQuery[]>(listKey, (current = []) =>
      current.map((query) => (query.id === id ? saved : query)),
    )

    toast.success('Audit query saved.')
    return saved
  } catch (error) {
    queryClient.setQueryData(listKey, previous)
    toast.error(getErrorMessage(error, 'Unable to save audit query.'))
    throw error
  } finally {
    await refreshAuditMetadata()
  }
}

export async function removeAuditQuery(id: number) {
  const listKey = auditQueryKeys.list()
  const previous = queryClient.getQueryData<AuditQuery[]>(listKey)

  try {
    queryClient.setQueryData<AuditQuery[]>(listKey, (current = []) =>
      current.filter((query) => query.id !== id),
    )

    await deleteAuditQuery(id)
    toast.success('Audit query deleted.')
  } catch (error) {
    queryClient.setQueryData(listKey, previous)
    toast.error(getErrorMessage(error, 'Unable to delete audit query.'))
    throw error
  } finally {
    await refreshAuditMetadata()
  }
}

export async function persistAuditCategory(
  id: number | null,
  request: AuditCategoryRequest,
): Promise<AuditCategory> {
  const listKey = auditCategoryKeys.list()
  const previous = queryClient.getQueryData<AuditCategory[]>(listKey)

  try {
    if (id === null) {
      const optimistic = buildOptimisticCategory(request)
      queryClient.setQueryData<AuditCategory[]>(listKey, (current = []) => [
        ...current,
        optimistic,
      ])

      const saved = await createAuditCategory(request)
      queryClient.setQueryData<AuditCategory[]>(listKey, (current = []) =>
        current.map((category) =>
          category.id === OPTIMISTIC_ID ? saved : category,
        ),
      )

      toast.success('Audit category saved.')
      return saved
    }

    queryClient.setQueryData<AuditCategory[]>(listKey, (current = []) =>
      current.map((category) =>
        category.id === id
          ? {
              ...category,
              name: request.name,
              description: request.description || null,
            }
          : category,
      ),
    )

    const saved = await updateAuditCategory(id, request)
    queryClient.setQueryData<AuditCategory[]>(listKey, (current = []) =>
      current.map((category) => (category.id === id ? saved : category)),
    )

    toast.success('Audit category saved.')
    return saved
  } catch (error) {
    queryClient.setQueryData(listKey, previous)
    toast.error(getErrorMessage(error, 'Unable to save category.'))
    throw error
  } finally {
    await refreshAuditMetadata()
  }
}

export async function removeAuditCategory(id: number) {
  const listKey = auditCategoryKeys.list()
  const previous = queryClient.getQueryData<AuditCategory[]>(listKey)

  try {
    queryClient.setQueryData<AuditCategory[]>(listKey, (current = []) =>
      current.filter((category) => category.id !== id),
    )

    await deleteAuditCategory(id)
    toast.success('Audit category deleted.')
  } catch (error) {
    queryClient.setQueryData(listKey, previous)
    toast.error(getErrorMessage(error, 'Unable to delete category.'))
    throw error
  } finally {
    await refreshAuditMetadata()
  }
}
