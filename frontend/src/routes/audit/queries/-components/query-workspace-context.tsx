import { createAuditWorkspaceContext } from '../../-components/create-audit-workspace-context'

const { Provider, useSelection } = createAuditWorkspaceContext({
  detailRoute: '/audit/queries/$queryId',
  indexRoute: '/audit/queries',
  paramName: 'queryId',
  hookErrorMessage:
    'useQueryWorkspaceSelection must be used within QueryWorkspaceProvider',
})

export const QueryWorkspaceProvider = Provider

export function useQueryWorkspaceSelection() {
  const { selectedId, selectEntity } = useSelection()

  return {
    selectedQueryId: selectedId,
    selectQuery: selectEntity,
  }
}
