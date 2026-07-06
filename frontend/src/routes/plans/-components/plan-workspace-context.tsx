import { createWorkspaceContext } from '@/components/workspace/create-workspace-context'

const { Provider, useSelection } = createWorkspaceContext({
  detailRoute: '/plans/$planId',
  indexRoute: '/plans',
  paramName: 'planId',
  hookErrorMessage:
    'usePlanWorkspaceSelection must be used within PlanWorkspaceProvider',
})

export const PlanWorkspaceProvider = Provider
export const usePlanWorkspaceSelectionBase = useSelection

export function usePlanWorkspaceSelection() {
  const { selectedId, selectEntity } = useSelection()

  return {
    selectedPlanId: selectedId,
    selectPlan: selectEntity,
  }
}
