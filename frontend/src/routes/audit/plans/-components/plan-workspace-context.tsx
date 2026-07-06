import { createAuditWorkspaceContext } from '../../-components/create-audit-workspace-context'

const { Provider, useSelection } = createAuditWorkspaceContext({
  detailRoute: '/audit/plans/$planId',
  indexRoute: '/audit/plans',
  paramName: 'planId',
  hookErrorMessage:
    'usePlanWorkspaceSelection must be used within PlanWorkspaceProvider',
})

export const PlanWorkspaceProvider = Provider

export function usePlanWorkspaceSelection() {
  const { selectedId, selectEntity } = useSelection()

  return {
    selectedPlanId: selectedId,
    selectPlan: selectEntity,
  }
}
