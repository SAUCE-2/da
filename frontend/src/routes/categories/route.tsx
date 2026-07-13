import { TagIcon } from '@phosphor-icons/react/Tag'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet } from '@tanstack/react-router'

import { RouteQueryError } from '@/components/workspace/RouteQueryError'
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { categoriesListOptions } from '@/lib/queries/categories'
import { queriesListOptions } from '@/lib/queries/queries'

import { CategoryList } from './-components/CategoryList'
import {
  CategoryWorkspaceProvider,
  useCategoryWorkspaceSelectionBase,
} from './-components/category-workspace-context'
import { useCategoryQueryCounts } from './-components/use-category-query-counts'

function CategoriesWorkspace() {
  const { selectedId, selectEntity } = useCategoryWorkspaceSelectionBase()
  const { data: categories = [] } = useQuery(categoriesListOptions())
  const getQueryCount = useCategoryQueryCounts()

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <Sidebar
          collapsible="none"
          className="md:w-[min(300px,30%)] md:min-w-[260px] border-r"
        >
          <CategoryList
            categories={categories}
            selectedCategoryId={selectedId}
            getQueryCount={getQueryCount}
            onNew={() => selectEntity(null)}
          />
        </Sidebar>
        <SidebarInset className="min-h-0 overflow-hidden">
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export const Route = createFileRoute('/categories')({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(categoriesListOptions()),
      context.queryClient.ensureQueryData(queriesListOptions()),
    ]),
  component: () => (
    <CategoryWorkspaceProvider>
      <CategoriesWorkspace />
    </CategoryWorkspaceProvider>
  ),
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
