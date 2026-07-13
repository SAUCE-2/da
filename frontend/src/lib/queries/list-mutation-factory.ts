import {
  useMutation,
  type QueryKey,
  type UseMutationOptions,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { queryClient } from '@/lib/query-client'

export const OPTIMISTIC_ID = 0

type PersistVariables<TRequest> = {
  id: number | null
  request: TRequest
}

type PersistListMutationConfig<TEntity, TRequest> = {
  listKey: QueryKey
  mutationFn: (variables: PersistVariables<TRequest>) => Promise<TEntity>
  buildOptimistic: (request: TRequest) => TEntity
  applyRequest: (entity: TEntity, request: TRequest) => TEntity
  getId: (entity: TEntity) => number
  successMessage: string
  errorMessage: string
  onSettled?: (
    data: TEntity | undefined,
    error: Error | null,
    variables: PersistVariables<TRequest>,
  ) => void
}

type RemoveListMutationConfig = {
  listKey: QueryKey
  mutationFn: (id: number) => Promise<void>
  successMessage: string
  errorMessage: string
  onSettled?: () => void
}

export function createPersistListMutation<TEntity, TRequest>(
  config: PersistListMutationConfig<TEntity, TRequest>,
) {
  return (
    options?: Omit<
      UseMutationOptions<TEntity, Error, PersistVariables<TRequest>>,
      'mutationFn' | 'onMutate' | 'onSuccess' | 'onError' | 'onSettled'
    >,
  ) =>
    useMutation({
      ...options,
      mutationFn: config.mutationFn,
      onMutate: async ({ id, request }) => {
        await queryClient.cancelQueries({ queryKey: config.listKey })
        const previous = queryClient.getQueryData<TEntity[]>(config.listKey)

        if (id === null) {
          const optimistic = config.buildOptimistic(request)
          queryClient.setQueryData<TEntity[]>(config.listKey, (current = []) => [
            ...current,
            optimistic,
          ])
        } else {
          queryClient.setQueryData<TEntity[]>(config.listKey, (current = []) =>
            current.map((entity) =>
              config.getId(entity) === id
                ? config.applyRequest(entity, request)
                : entity,
            ),
          )
        }

        return { previous }
      },
      onSuccess: (saved, { id }) => {
        if (id === null) {
          queryClient.setQueryData<TEntity[]>(config.listKey, (current = []) =>
            current.map((entity) =>
              config.getId(entity) === OPTIMISTIC_ID ? saved : entity,
            ),
          )
        } else {
          queryClient.setQueryData<TEntity[]>(config.listKey, (current = []) =>
            current.map((entity) =>
              config.getId(entity) === id ? saved : entity,
            ),
          )
        }

        toast.success(config.successMessage)
      },
      onError: (error, _variables, context) => {
        if (context?.previous) {
          queryClient.setQueryData(config.listKey, context.previous)
        }
        toast.error(
          error instanceof Error && error.message
            ? error.message
            : config.errorMessage,
        )
      },
      onSettled: (data, error, variables) => {
        config.onSettled?.(data, error, variables)
      },
    })
}

export function createRemoveListMutation(config: RemoveListMutationConfig) {
  return (
    options?: Omit<
      UseMutationOptions<void, Error, number>,
      'mutationFn' | 'onMutate' | 'onSuccess' | 'onError' | 'onSettled'
    >,
  ) =>
    useMutation({
      ...options,
      mutationFn: config.mutationFn,
      onMutate: async (id) => {
        await queryClient.cancelQueries({ queryKey: config.listKey })
        const previous = queryClient.getQueryData<unknown[]>(config.listKey)

        queryClient.setQueryData<unknown[]>(config.listKey, (current = []) =>
          current.filter((entity) => {
            if (!entity || typeof entity !== 'object' || !('id' in entity)) {
              return true
            }

            return entity.id !== id
          }),
        )

        return { previous }
      },
      onSuccess: () => {
        toast.success(config.successMessage)
      },
      onError: (error, _id, context) => {
        if (context?.previous) {
          queryClient.setQueryData(config.listKey, context.previous)
        }
        toast.error(
          error instanceof Error && error.message
            ? error.message
            : config.errorMessage,
        )
      },
      onSettled: () => {
        config.onSettled?.()
      },
    })
}
