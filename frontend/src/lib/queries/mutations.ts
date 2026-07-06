import {
  createCategory,
  createPlan,
  createQuery,
  deleteCategory,
  deletePlan,
  deleteQuery,
  updateCategory,
  updatePlan,
  updateQuery,
  type Category,
  type CategoryRequest,
  type Plan,
  type PlanRequest,
  type Query,
  type QueryRequest,
} from '@/lib/api'
import { queryClient } from '@/lib/query-client'

import { categoryKeys, planKeys, queryKeys } from './keys'
import {
  createPersistListMutation,
  createRemoveListMutation,
  OPTIMISTIC_ID,
} from './list-mutation-factory'

export { OPTIMISTIC_ID }

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

function applyRequestToQuery(query: Query, request: QueryRequest): Query {
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

function buildOptimisticPlan(request: PlanRequest): Plan {
  return {
    id: OPTIMISTIC_ID,
    name: request.name,
    description: request.description || null,
    active: request.active,
    items: request.items.map((item, index) => ({
      id: index,
      queryId: item.queryId,
      queryName: '',
      sortOrder: item.sortOrder,
      enabled: item.enabled,
      queryVersionId: null,
      queryVersionNumber: null,
      variableBindings: item.variableBindings.map((binding) => ({
        name: binding.name,
        value: binding.value ?? null,
      })),
    })),
  }
}

function applyRequestToPlan(plan: Plan, request: PlanRequest): Plan {
  return {
    ...plan,
    name: request.name,
    description: request.description || null,
    active: request.active,
    items: request.items.map((item, index) => ({
      id: plan.items[index]?.id ?? index,
      queryId: item.queryId,
      queryName: plan.items[index]?.queryName ?? '',
      sortOrder: item.sortOrder,
      enabled: item.enabled,
      queryVersionId: plan.items[index]?.queryVersionId ?? null,
      queryVersionNumber: plan.items[index]?.queryVersionNumber ?? null,
      variableBindings: item.variableBindings.map((binding) => ({
        name: binding.name,
        value: binding.value ?? null,
      })),
    })),
  }
}

export const usePersistQuery = createPersistListMutation<Query, QueryRequest>({
  listKey: queryKeys.list(),
  mutationFn: ({ id, request }) =>
    (id === null
      ? createQuery(request)
      : updateQuery(id, request)) as Promise<Query>,
  buildOptimistic: buildOptimisticQuery,
  applyRequest: applyRequestToQuery,
  getId: (query) => query.id,
  successMessage: 'Query saved.',
  errorMessage: 'Unable to save query.',
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

export const useRemoveQuery = createRemoveListMutation({
  listKey: queryKeys.list(),
  mutationFn: deleteQuery,
  successMessage: 'Query deleted.',
  errorMessage: 'Unable to delete query.',
  onSettled: refreshMetadata,
})

export const usePersistCategory = createPersistListMutation<
  Category,
  CategoryRequest
>({
  listKey: categoryKeys.list(),
  mutationFn: ({ id, request }) =>
    (id === null
      ? createCategory(request)
      : updateCategory(id, request)) as Promise<Category>,
  buildOptimistic: buildOptimisticCategory,
  applyRequest: (category, request) => ({
    ...category,
    name: request.name,
    description: request.description || null,
  }),
  getId: (category) => category.id,
  successMessage: 'Category saved.',
  errorMessage: 'Unable to save category.',
  onSettled: refreshMetadata,
})

export const useRemoveCategory = createRemoveListMutation({
  listKey: categoryKeys.list(),
  mutationFn: deleteCategory,
  successMessage: 'Category deleted.',
  errorMessage: 'Unable to delete category.',
  onSettled: refreshMetadata,
})

export const usePersistPlan = createPersistListMutation<Plan, PlanRequest>({
  listKey: planKeys.list(),
  mutationFn: ({ id, request }) =>
    (id === null
      ? createPlan(request as never)
      : updatePlan(id, request as never)) as Promise<Plan>,
  buildOptimistic: buildOptimisticPlan,
  applyRequest: applyRequestToPlan,
  getId: (plan) => plan.id,
  successMessage: 'Plan saved.',
  errorMessage: 'Unable to save plan.',
})

export const useRemovePlan = createRemoveListMutation({
  listKey: planKeys.list(),
  mutationFn: deletePlan,
  successMessage: 'Plan deleted.',
  errorMessage: 'Unable to delete plan.',
})
