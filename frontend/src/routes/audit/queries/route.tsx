import { FileMagnifyingGlassIcon } from '@phosphor-icons/react/FileMagnifyingGlass'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet } from '@tanstack/react-router'

import { AuditMasterDetailLayout } from '@/components/layout/audit-master-detail-layout'
import { auditCategoriesListOptions } from '@/lib/queries/audit-categories'
import { auditQueriesListOptions } from '@/lib/queries/audit-queries'

import { AuditRouteQueryError } from '../-components/AuditRouteQueryError'
import { AuditQueryList } from './-components/AuditQueryList'
import {
  QueryWorkspaceProvider,
  useQueryWorkspaceSelection,
} from './-components/query-workspace-context'

function AuditQueriesLayoutContent() {
  const { selectedQueryId, selectQuery } = useQueryWorkspaceSelection()

  const { data: queries = [] } = useQuery(auditQueriesListOptions())

  return (
    <AuditMasterDetailLayout
      list={
        <AuditQueryList
          queries={queries}
          selectedQueryId={selectedQueryId}
          onNew={() => selectQuery(null)}
        />
      }
      detail={<Outlet />}
    />
  )
}

function AuditQueriesLayout() {
  return (
    <QueryWorkspaceProvider>
      <AuditQueriesLayoutContent />
    </QueryWorkspaceProvider>
  )
}

export const Route = createFileRoute('/audit/queries')({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(auditQueriesListOptions()),
      context.queryClient.ensureQueryData(auditCategoriesListOptions()),
    ]),
  component: AuditQueriesLayout,
  errorComponent: ({ error }) => (
    <AuditRouteQueryError
      error={error}
      fallbackMessage="Unable to load audit queries."
    />
  ),
  staticData: {
    nav: {
      id: 'audit.queries',
      label: 'Audit Queries',
      icon: FileMagnifyingGlassIcon,
      subsectionId: 'audit',
      order: 30,
    },
  },
})
