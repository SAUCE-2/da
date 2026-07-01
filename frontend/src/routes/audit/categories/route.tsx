import { TagIcon } from '@phosphor-icons/react/Tag'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet } from '@tanstack/react-router'

import { AuditMasterDetailLayout } from '@/components/layout/audit-master-detail-layout'
import { auditCategoriesListOptions } from '@/lib/queries/audit-categories'
import { auditQueriesListOptions } from '@/lib/queries/audit-queries'

import { AuditRouteQueryError } from '../-components/AuditRouteQueryError'
import { AuditCategoryList } from './-components/AuditCategoryList'
import {
  CategoryWorkspaceProvider,
  useCategoryWorkspaceSelection,
} from './-components/category-workspace-context'
import { useCategoryQueryCounts } from './-components/use-category-query-counts'

function AuditCategoriesLayoutContent() {
  const { selectedCategoryId, selectCategory } = useCategoryWorkspaceSelection()
  const getQueryCount = useCategoryQueryCounts()

  const { data: categories = [] } = useQuery(auditCategoriesListOptions())

  return (
    <AuditMasterDetailLayout
      list={
        <AuditCategoryList
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

function AuditCategoriesLayout() {
  return (
    <CategoryWorkspaceProvider>
      <AuditCategoriesLayoutContent />
    </CategoryWorkspaceProvider>
  )
}

export const Route = createFileRoute('/audit/categories')({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(auditCategoriesListOptions()),
      context.queryClient.ensureQueryData(auditQueriesListOptions()),
    ]),
  component: AuditCategoriesLayout,
  errorComponent: ({ error }) => (
    <AuditRouteQueryError
      error={error}
      fallbackMessage="Unable to load audit categories."
    />
  ),
  staticData: {
    nav: {
      id: 'audit.categories',
      label: 'Audit Categories',
      icon: TagIcon,
      subsectionId: 'audit',
      order: 40,
    },
  },
})
