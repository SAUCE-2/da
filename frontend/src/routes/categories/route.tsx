import { TagIcon } from '@phosphor-icons/react/Tag'
import { createFileRoute } from '@tanstack/react-router'

import {
  EntityWorkspaceLayout,
  entityWorkspaceLoader,
} from '@/components/workspace/entity-workspace-layout'
import { categoriesListOptions } from '@/lib/queries/categories'
import { queriesListOptions } from '@/lib/queries/queries'

import { RouteQueryError } from '@/components/workspace/RouteQueryError'
import { CategoryList } from './-components/CategoryList'
import {
  CategoryWorkspaceProvider,
  useCategoryWorkspaceSelectionBase,
} from './-components/category-workspace-context'
import { useCategoryQueryCounts } from './-components/use-category-query-counts'

function CategoriesWorkspaceLayout() {
  const getQueryCount = useCategoryQueryCounts()

  return (
    <EntityWorkspaceLayout
      Provider={CategoryWorkspaceProvider}
      useSelection={useCategoryWorkspaceSelectionBase}
      listOptions={categoriesListOptions}
      renderList={({ items, selectedId, onNew }) => (
        <CategoryList
          categories={items}
          selectedCategoryId={selectedId}
          getQueryCount={getQueryCount}
          onNew={onNew}
        />
      )}
    />
  )
}

export const Route = createFileRoute('/categories')({
  loader: ({ context }) =>
    entityWorkspaceLoader(
      context.queryClient,
      categoriesListOptions,
      queriesListOptions,
    ),
  component: CategoriesWorkspaceLayout,
  errorComponent: ({ error }) => (
    <RouteQueryError
      error={error}
      fallbackMessage="Unable to load categories."
    />
  ),
  staticData: {
    nav: {
      id: 'categories',
      label: 'Categories',
      icon: TagIcon,
      subsectionId: 'config',
      order: 30,
    },
  },
})
