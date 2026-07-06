import { createWorkspaceContext } from '@/components/workspace/create-workspace-context'

const { Provider, useSelection } = createWorkspaceContext({
  detailRoute: '/queries/$queryId',
  indexRoute: '/queries',
  paramName: 'queryId',
  hookErrorMessage:
    'useQueryWorkspaceSelection must be used within QueryWorkspaceProvider',
})

export const QueryWorkspaceProvider = Provider
export const useQueryWorkspaceSelectionBase = useSelection

export function useQueryWorkspaceSelection() {
  const { selectedId, selectEntity } = useSelection()

  return {
    selectedQueryId: selectedId,
    selectQuery: selectEntity,
  }
}
