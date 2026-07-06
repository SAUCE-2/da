import { useMutation } from '@tanstack/react-query'
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
    versionId: OPTIMISTIC_ID,
    versionNumber: 1,
    sections: request.sections.map((section, index) => ({
      id: index,
      ...section,
    })),
    variables: request.variables.map((variable, index) => ({
      id: index,
      ...variable,
      defaultValue: variable.defaultValue || null,
    })),
    categories: [],
  }
}

function applyRequestToQuery(
  query: AuditQuery,
  request: AuditQueryRequest,
): AuditQuery {
  return {
    ...query,
    name: request.name,
    description: request.description || null,
    active: request.active,
    sections: request.sections.map((section, index) => ({
      id: query.sections[index]?.id ?? index,
      ...section,
    })),
    variables: request.variables.map((variable, index) => ({
      id: query.variables[index]?.id ?? index,
      ...variable,
      defaultValue: variable.defaultValue || null,
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

type PersistQueryVariables = {
  id: number | null
  request: AuditQueryRequest
}

type PersistCategoryVariables = {
  id: number | null
  request: AuditCategoryRequest
}

export function usePersistAuditQuery() {
  return useMutation({
    mutationFn: ({ id, request }: PersistQueryVariables) =>
      id === null
        ? createAuditQuery(request)
        : updateAuditQuery(id, request),
    onMutate: async ({ id, request }) => {
      const listKey = auditQueryKeys.list()
      await queryClient.cancelQueries({ queryKey: listKey })
      const previous = queryClient.getQueryData<AuditQuery[]>(listKey)

      if (id === null) {
        const optimistic = buildOptimisticQuery(request)
        queryClient.setQueryData<AuditQuery[]>(listKey, (current = []) => [
          ...current,
          optimistic,
        ])
      } else {
        queryClient.setQueryData<AuditQuery[]>(listKey, (current = []) =>
          current.map((query) =>
            query.id === id ? applyRequestToQuery(query, request) : query,
          ),
        )
      }

      return { previous }
    },
    onSuccess: (saved, { id }) => {
      const listKey = auditQueryKeys.list()

      if (id === null) {
        queryClient.setQueryData<AuditQuery[]>(listKey, (current = []) =>
          current.map((query) => (query.id === OPTIMISTIC_ID ? saved : query)),
        )
      } else {
        queryClient.setQueryData<AuditQuery[]>(listKey, (current = []) =>
          current.map((query) => (query.id === id ? saved : query)),
        )
      }

      toast.success('Audit query saved.')
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(auditQueryKeys.list(), context.previous)
      }
      toast.error(getErrorMessage(error, 'Unable to save audit query.'))
    },
    onSettled: (_data, _error, variables) => {
      void refreshAuditMetadata()
      if (variables.id !== null) {
        void queryClient.invalidateQueries({
          queryKey: auditQueryKeys.preview(variables.id),
        })
        void queryClient.invalidateQueries({
          queryKey: auditQueryKeys.versions(variables.id),
        })
      }
    },
  })
}

export function useRemoveAuditQuery() {
  return useMutation({
    mutationFn: deleteAuditQuery,
    onMutate: async (id) => {
      const listKey = auditQueryKeys.list()
      await queryClient.cancelQueries({ queryKey: listKey })
      const previous = queryClient.getQueryData<AuditQuery[]>(listKey)

      queryClient.setQueryData<AuditQuery[]>(listKey, (current = []) =>
        current.filter((query) => query.id !== id),
      )

      return { previous }
    },
    onSuccess: () => {
      toast.success('Audit query deleted.')
    },
    onError: (error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(auditQueryKeys.list(), context.previous)
      }
      toast.error(getErrorMessage(error, 'Unable to delete audit query.'))
    },
    onSettled: () => {
      void refreshAuditMetadata()
    },
  })
}

export function usePersistAuditCategory() {
  return useMutation({
    mutationFn: ({ id, request }: PersistCategoryVariables) =>
      id === null
        ? createAuditCategory(request)
        : updateAuditCategory(id, request),
    onMutate: async ({ id, request }) => {
      const listKey = auditCategoryKeys.list()
      await queryClient.cancelQueries({ queryKey: listKey })
      const previous = queryClient.getQueryData<AuditCategory[]>(listKey)

      if (id === null) {
        const optimistic = buildOptimisticCategory(request)
        queryClient.setQueryData<AuditCategory[]>(listKey, (current = []) => [
          ...current,
          optimistic,
        ])
      } else {
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
      }

      return { previous }
    },
    onSuccess: (saved, { id }) => {
      const listKey = auditCategoryKeys.list()

      if (id === null) {
        queryClient.setQueryData<AuditCategory[]>(listKey, (current = []) =>
          current.map((category) =>
            category.id === OPTIMISTIC_ID ? saved : category,
          ),
        )
      } else {
        queryClient.setQueryData<AuditCategory[]>(listKey, (current = []) =>
          current.map((category) => (category.id === id ? saved : category)),
        )
      }

      toast.success('Audit category saved.')
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(auditCategoryKeys.list(), context.previous)
      }
      toast.error(getErrorMessage(error, 'Unable to save category.'))
    },
    onSettled: () => {
      void refreshAuditMetadata()
    },
  })
}

export function useRemoveAuditCategory() {
  return useMutation({
    mutationFn: deleteAuditCategory,
    onMutate: async (id) => {
      const listKey = auditCategoryKeys.list()
      await queryClient.cancelQueries({ queryKey: listKey })
      const previous = queryClient.getQueryData<AuditCategory[]>(listKey)

      queryClient.setQueryData<AuditCategory[]>(listKey, (current = []) =>
        current.filter((category) => category.id !== id),
      )

      return { previous }
    },
    onSuccess: () => {
      toast.success('Audit category deleted.')
    },
    onError: (error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(auditCategoryKeys.list(), context.previous)
      }
      toast.error(getErrorMessage(error, 'Unable to delete category.'))
    },
    onSettled: () => {
      void refreshAuditMetadata()
    },
  })
}
