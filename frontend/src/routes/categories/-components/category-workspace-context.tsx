import { createWorkspaceContext } from '@/components/workspace/create-workspace-context'

const { Provider, useSelection } = createWorkspaceContext({
  detailRoute: '/categories/$categoryId',
  indexRoute: '/categories',
  paramName: 'categoryId',
  hookErrorMessage:
    'useCategoryWorkspaceSelection must be used within CategoryWorkspaceProvider',
})

export const CategoryWorkspaceProvider = Provider
export const useCategoryWorkspaceSelectionBase = useSelection

export function useCategoryWorkspaceSelection() {
  const { selectedId, selectEntity } = useSelection()

  return {
    selectedCategoryId: selectedId,
    selectCategory: selectEntity,
  }
}
