import type { Query, Plan } from '@/lib/api'
import { variableDefaultsFromDefinitions } from '@/lib/variable-utils'
import { createClientId } from '@/lib/form-client-id'

export type ClientPlanItem = {
  clientId: string
  queryId: number | null
  sortOrder: number
  enabled: boolean
  variableBindings: Record<string, string>
}

export type PlanFormState = {
  name: string
  description: string
  active: boolean
  items: ClientPlanItem[]
}

export function createBlankPlanItem(sortOrder: number): ClientPlanItem {
  return {
    clientId: createClientId(),
    queryId: null,
    sortOrder,
    enabled: true,
    variableBindings: {},
  }
}

export function createBlankPlanForm(): PlanFormState {
  return {
    name: '',
    description: '',
    active: true,
    items: [],
  }
}

export function toPlanFormState(plan: Plan): PlanFormState {
  return {
    name: plan.name,
    description: plan.description ?? '',
    active: plan.active,
    items: plan.items.map((item) => ({
      clientId: createClientId(),
      queryId: item.queryId,
      sortOrder: item.sortOrder,
      enabled: item.enabled,
      variableBindings: Object.fromEntries(
        item.variableBindings.map((binding) => [
          binding.name,
          binding.value ?? '',
        ]),
      ),
    })),
  }
}

export function toPlanRequest(value: PlanFormState) {
  return {
    name: value.name,
    description: value.description,
    active: value.active,
    items: value.items
      .filter((item) => item.queryId !== null)
      .map((item, index) => ({
        queryId: item.queryId!,
        sortOrder: Number.isFinite(item.sortOrder) ? item.sortOrder : index,
        enabled: item.enabled,
        variableBindings: Object.entries(item.variableBindings).map(
          ([name, value]) => ({ name, value }),
        ),
      })),
  }
}

export function seedVariableBindings(
  query: Query | undefined,
): Record<string, string> {
  if (!query) {
    return {}
  }
  return variableDefaultsFromDefinitions(query.variables)
}

export function reindexPlanItems(items: ClientPlanItem[]) {
  return items.map((item, index) => ({
    ...item,
    sortOrder: index,
  }))
}
