import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  createCategory,
  createQuery,
  deleteCategory,
  deleteQuery,
  updateCategory,
  updateQuery,
  type Category,
  type CategoryRequest,
  type Query,
  type QueryRequest,
} from '@/lib/api'
import { getErrorMessage } from '@/lib/get-error-message'
import { queryClient } from '@/lib/query-client'

import { categoryKeys, queryKeys } from './keys'

export const OPTIMISTIC_ID = 0

function refreshMetadata() {
  void Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.list() }),
    queryClient.invalidateQueries({ queryKey: categoryKeys.list() }),
  ])
}

function buildOptimisticQuery(request: QueryRequest): Query {
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
  query: Query,
  request: QueryRequest,
): Query {
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

function buildOptimisticCategory(request: CategoryRequest): Category {
  return {
    id: OPTIMISTIC_ID,
    name: request.name,
    description: request.description || null,
  }
}

type PersistQueryVariables = {
  id: number | null
  request: QueryRequest
}

type PersistCategoryVariables = {
  id: number | null
  request: CategoryRequest
}

export function usePersistQuery() {
  return useMutation({
    mutationFn: ({ id, request }: PersistQueryVariables) =>
      id === null
        ? createQuery(request)
        : updateQuery(id, request),
    onMutate: async ({ id, request }) => {
      const listKey = queryKeys.list()
      await queryClient.cancelQueries({ queryKey: listKey })
      const previous = queryClient.getQueryData<Query[]>(listKey)

      if (id === null) {
        const optimistic = buildOptimisticQuery(request)
        queryClient.setQueryData<Query[]>(listKey, (current = []) => [
          ...current,
          optimistic,
        ])
      } else {
        queryClient.setQueryData<Query[]>(listKey, (current = []) =>
          current.map((query) =>
            query.id === id ? applyRequestToQuery(query, request) : query,
          ),
        )
      }

      return { previous }
    },
    onSuccess: (saved, { id }) => {
      const listKey = queryKeys.list()

      if (id === null) {
        queryClient.setQueryData<Query[]>(listKey, (current = []) =>
          current.map((query) => (query.id === OPTIMISTIC_ID ? saved : query)),
        )
      } else {
        queryClient.setQueryData<Query[]>(listKey, (current = []) =>
          current.map((query) => (query.id === id ? saved : query)),
        )
      }

      toast.success('Query saved.')
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.list(), context.previous)
      }
      toast.error(getErrorMessage(error, 'Unable to save query.'))
    },
    onSettled: (_data, _error, variables) => {
      void refreshMetadata()
      if (variables.id !== null) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.preview(variables.id),
        })
        void queryClient.invalidateQueries({
          queryKey: queryKeys.versions(variables.id),
        })
      }
    },
  })
}

export function useRemoveQuery() {
  return useMutation({
    mutationFn: deleteQuery,
    onMutate: async (id) => {
      const listKey = queryKeys.list()
      await queryClient.cancelQueries({ queryKey: listKey })
      const previous = queryClient.getQueryData<Query[]>(listKey)

      queryClient.setQueryData<Query[]>(listKey, (current = []) =>
        current.filter((query) => query.id !== id),
      )

      return { previous }
    },
    onSuccess: () => {
      toast.success('Query deleted.')
    },
    onError: (error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.list(), context.previous)
      }
      toast.error(getErrorMessage(error, 'Unable to delete query.'))
    },
    onSettled: () => {
      void refreshMetadata()
    },
  })
}

export function usePersistCategory() {
  return useMutation({
    mutationFn: ({ id, request }: PersistCategoryVariables) =>
      id === null
        ? createCategory(request)
        : updateCategory(id, request),
    onMutate: async ({ id, request }) => {
      const listKey = categoryKeys.list()
      await queryClient.cancelQueries({ queryKey: listKey })
      const previous = queryClient.getQueryData<Category[]>(listKey)

      if (id === null) {
        const optimistic = buildOptimisticCategory(request)
        queryClient.setQueryData<Category[]>(listKey, (current = []) => [
          ...current,
          optimistic,
        ])
      } else {
        queryClient.setQueryData<Category[]>(listKey, (current = []) =>
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
      const listKey = categoryKeys.list()

      if (id === null) {
        queryClient.setQueryData<Category[]>(listKey, (current = []) =>
          current.map((category) =>
            category.id === OPTIMISTIC_ID ? saved : category,
          ),
        )
      } else {
        queryClient.setQueryData<Category[]>(listKey, (current = []) =>
          current.map((category) => (category.id === id ? saved : category)),
        )
      }

      toast.success('Category saved.')
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(categoryKeys.list(), context.previous)
      }
      toast.error(getErrorMessage(error, 'Unable to save category.'))
    },
    onSettled: () => {
      void refreshMetadata()
    },
  })
}

export function useRemoveCategory() {
  return useMutation({
    mutationFn: deleteCategory,
    onMutate: async (id) => {
      const listKey = categoryKeys.list()
      await queryClient.cancelQueries({ queryKey: listKey })
      const previous = queryClient.getQueryData<Category[]>(listKey)

      queryClient.setQueryData<Category[]>(listKey, (current = []) =>
        current.filter((category) => category.id !== id),
      )

      return { previous }
    },
    onSuccess: () => {
      toast.success('Category deleted.')
    },
    onError: (error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(categoryKeys.list(), context.previous)
      }
      toast.error(getErrorMessage(error, 'Unable to delete category.'))
    },
    onSettled: () => {
      void refreshMetadata()
    },
  })
}
