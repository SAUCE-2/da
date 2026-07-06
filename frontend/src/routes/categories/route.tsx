import { TagIcon } from '@phosphor-icons/react/Tag'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet } from '@tanstack/react-router'

import { MasterDetailLayout } from '@/components/layout/master-detail-layout'
import { categoriesListOptions } from '@/lib/queries/categories'
import { queriesListOptions } from '@/lib/queries/queries'

import { RouteQueryError } from '@/components/workspace/RouteQueryError'
import { CategoryList } from './-components/CategoryList'
import {
  CategoryWorkspaceProvider,
  useCategoryWorkspaceSelection,
} from './-components/category-workspace-context'
import { useCategoryQueryCounts } from './-components/use-category-query-counts'

function CategoriesLayoutContent() {
  const { selectedCategoryId, selectCategory } = useCategoryWorkspaceSelection()
  const getQueryCount = useCategoryQueryCounts()

  const { data: categories = [] } = useQuery(categoriesListOptions())

  return (
    <MasterDetailLayout
      list={
        <CategoryList
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          getQueryCount={getQueryCount}
          onNew={() => selectCategory(null)}
        />
      }
      detail={<Outlet />}
    />
  )
}

function CategoriesLayout() {
  return (
    <CategoryWorkspaceProvider>
      <CategoriesLayoutContent />
    </CategoryWorkspaceProvider>
  )
}

export const Route = createFileRoute('/categories')({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(categoriesListOptions()),
      context.queryClient.ensureQueryData(queriesListOptions()),
    ]),
  component: CategoriesLayout,
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
