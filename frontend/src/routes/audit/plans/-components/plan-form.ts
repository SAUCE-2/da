import type { AuditQuery, AuditPlan } from '@/lib/audit-api'
import { variableDefaultsFromDefinitions } from '@/lib/audit-variable-utils'
import { createClientId } from '@/lib/form-client-id'

export type ClientPlanItem = {
  clientId: string
  auditQueryId: number | null
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
    auditQueryId: null,
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

export function toPlanFormState(plan: AuditPlan): PlanFormState {
  return {
    name: plan.name,
    description: plan.description ?? '',
    active: plan.active,
    items: plan.items.map((item) => ({
      clientId: createClientId(),
      auditQueryId: item.auditQueryId,
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

export function toAuditPlanRequest(value: PlanFormState) {
  return {
    name: value.name,
    description: value.description,
    active: value.active,
    items: value.items
      .filter((item) => item.auditQueryId !== null)
      .map((item, index) => ({
        auditQueryId: item.auditQueryId!,
        sortOrder: Number.isFinite(item.sortOrder) ? item.sortOrder : index,
        enabled: item.enabled,
        variableBindings: Object.entries(item.variableBindings).map(
          ([name, value]) => ({ name, value }),
        ),
      })),
  }
}

export function seedVariableBindings(
  query: AuditQuery | undefined,
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
