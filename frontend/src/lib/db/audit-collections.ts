import { createCollection } from '@tanstack/db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { toast } from 'sonner'

import {
  createAuditCategory,
  createAuditQuery,
  deleteAuditCategory,
  deleteAuditQuery,
  listAuditCategories,
  listAuditQueries,
  updateAuditCategory,
  updateAuditQuery,
  type AuditCategory,
  type AuditCategoryRequest,
  type AuditQuery,
  type AuditQueryRequest,
} from '@/lib/audit-api'
import { getErrorMessage } from '@/lib/get-error-message'
import { auditCategoryKeys, auditQueryKeys } from '@/lib/queries/audit-keys'
import { queryClient } from '@/lib/query-client'

type AuditQueryMutationMetadata = {
  request: AuditQueryRequest
}

type AuditCategoryMutationMetadata = {
  request: AuditCategoryRequest
}

let pendingQueryCreate: AuditQuery | null = null
let pendingCategoryCreate: AuditCategory | null = null

export async function refreshAuditMetadata() {
  await Promise.all([
    auditQueriesCollection.utils.refetch(),
    auditCategoriesCollection.utils.refetch(),
  ])
}

function buildOptimisticQuery(request: AuditQueryRequest): AuditQuery {
  return {
    id: 0,
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

function applyRequestToQuery(draft: AuditQuery, request: AuditQueryRequest) {
  draft.name = request.name
  draft.description = request.description || null
  draft.active = request.active
  draft.sections = request.sections.map((section, index) => ({
    id: draft.sections[index]?.id ?? index,
    ...section,
  }))
}

export const auditQueriesCollection = createCollection(
  queryCollectionOptions({
    queryKey: auditQueryKeys.list(),
    queryFn: listAuditQueries,
    staleTime: 60_000,
    queryClient,
    getKey: (query) => query.id,
    onInsert: async ({ transaction }) => {
      const request = (
        transaction.mutations[0]?.metadata as
          | AuditQueryMutationMetadata
          | undefined
      )?.request

      if (!request) {
        throw new Error('Missing audit query request metadata.')
      }

      const saved = await createAuditQuery(request)
      pendingQueryCreate = saved
      await refreshAuditMetadata()
    },
    onUpdate: async ({ transaction }) => {
      for (const mutation of transaction.mutations) {
        const request = (mutation.metadata as AuditQueryMutationMetadata | undefined)
          ?.request

        if (!request) {
          throw new Error('Missing audit query request metadata.')
        }

        await updateAuditQuery(mutation.key as number, request)
      }

      await refreshAuditMetadata()
    },
    onDelete: async ({ transaction }) => {
      for (const mutation of transaction.mutations) {
        await deleteAuditQuery(mutation.key as number)
      }

      await refreshAuditMetadata()
    },
  }),
)

export const auditCategoriesCollection = createCollection(
  queryCollectionOptions({
    queryKey: auditCategoryKeys.list(),
    queryFn: listAuditCategories,
    staleTime: 60_000,
    queryClient,
    getKey: (category) => category.id,
    onInsert: async ({ transaction }) => {
      const request = (
        transaction.mutations[0]?.metadata as
          | AuditCategoryMutationMetadata
          | undefined
      )?.request

      if (!request) {
        throw new Error('Missing audit category request metadata.')
      }

      const saved = await createAuditCategory(request)
      pendingCategoryCreate = saved
      await refreshAuditMetadata()
    },
    onUpdate: async ({ transaction }) => {
      for (const mutation of transaction.mutations) {
        const request = (
          mutation.metadata as AuditCategoryMutationMetadata | undefined
        )?.request

        if (!request) {
          throw new Error('Missing audit category request metadata.')
        }

        await updateAuditCategory(mutation.key as number, request)
      }

      await refreshAuditMetadata()
    },
    onDelete: async ({ transaction }) => {
      for (const mutation of transaction.mutations) {
        await deleteAuditCategory(mutation.key as number)
      }

      await refreshAuditMetadata()
    },
  }),
)

export async function persistAuditQuery(
  id: number | null,
  request: AuditQueryRequest,
): Promise<AuditQuery> {
  try {
    if (id === null) {
      pendingQueryCreate = null
      const tx = auditQueriesCollection.insert(buildOptimisticQuery(request), {
        metadata: { request } satisfies AuditQueryMutationMetadata,
      })
      await tx.isPersisted.promise

      if (!pendingQueryCreate) {
        throw new Error('Unable to save audit query.')
      }

      toast.success('Audit query saved.')
      return pendingQueryCreate
    }

    const tx = auditQueriesCollection.update(
      id,
      { metadata: { request } satisfies AuditQueryMutationMetadata },
      (draft) => {
        applyRequestToQuery(draft as AuditQuery, request)
      },
    )
    await tx.isPersisted.promise

    const saved = auditQueriesCollection.get(id) as AuditQuery | undefined

    if (!saved) {
      throw new Error('Unable to save audit query.')
    }

    toast.success('Audit query saved.')
    return saved
  } catch (error) {
    toast.error(getErrorMessage(error, 'Unable to save audit query.'))
    throw error
  }
}

export async function removeAuditQuery(id: number) {
  try {
    const tx = auditQueriesCollection.delete(id)
    await tx.isPersisted.promise
    toast.success('Audit query deleted.')
  } catch (error) {
    toast.error(getErrorMessage(error, 'Unable to delete audit query.'))
    throw error
  }
}

export async function persistAuditCategory(
  id: number | null,
  request: AuditCategoryRequest,
): Promise<AuditCategory> {
  try {
    if (id === null) {
      pendingCategoryCreate = null
      const tx = auditCategoriesCollection.insert(
        {
          id: 0,
          name: request.name,
          description: request.description || null,
        },
        { metadata: { request } satisfies AuditCategoryMutationMetadata },
      )
      await tx.isPersisted.promise

      if (!pendingCategoryCreate) {
        throw new Error('Unable to save category.')
      }

      toast.success('Audit category saved.')
      return pendingCategoryCreate
    }

    const tx = auditCategoriesCollection.update(
      id,
      { metadata: { request } satisfies AuditCategoryMutationMetadata },
      (draft) => {
        const category = draft as AuditCategory
        category.name = request.name
        category.description = request.description || null
      },
    )
    await tx.isPersisted.promise

    const saved = auditCategoriesCollection.get(id) as AuditCategory | undefined

    if (!saved) {
      throw new Error('Unable to save category.')
    }

    toast.success('Audit category saved.')
    return saved
  } catch (error) {
    toast.error(getErrorMessage(error, 'Unable to save category.'))
    throw error
  }
}

export async function removeAuditCategory(id: number) {
  try {
    const tx = auditCategoriesCollection.delete(id)
    await tx.isPersisted.promise
    toast.success('Audit category deleted.')
  } catch (error) {
    toast.error(getErrorMessage(error, 'Unable to delete category.'))
    throw error
  }
}
