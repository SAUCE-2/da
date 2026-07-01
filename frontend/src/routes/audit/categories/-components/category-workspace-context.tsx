import { createAuditWorkspaceContext } from '../../-components/create-audit-workspace-context'

const { Provider, useSelection } = createAuditWorkspaceContext({
  detailRoute: '/audit/categories/$categoryId',
  indexRoute: '/audit/categories',
  paramName: 'categoryId',
  hookErrorMessage:
    'useCategoryWorkspaceSelection must be used within CategoryWorkspaceProvider',
})

export const CategoryWorkspaceProvider = Provider

export function useCategoryWorkspaceSelection() {
  const { selectedId, selectEntity } = useSelection()

  return {
    selectedCategoryId: selectedId,
    selectCategory: selectEntity,
  }
}
