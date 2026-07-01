import { FileMagnifyingGlassIcon } from '@phosphor-icons/react'
import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { useLiveQuery } from '@tanstack/react-db'
import {
  createFileRoute,
  Outlet,
  useMatch,
  useRouter,
} from '@tanstack/react-router'
import { useEffect } from 'react'

import { AuditMasterDetailLayout } from '@/components/layout/audit-master-detail-layout'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { auditQueriesCollection } from '@/lib/db/audit-collections'
import type { AuditQuery } from '@/lib/audit-api'
import { auditCategoriesListOptions } from '@/lib/queries/audit-categories'
import { auditQueriesListOptions } from '@/lib/queries/audit-queries'

import { AuditQueryList } from './-components/AuditQueryList'

function AuditQueriesLayout() {
  const match = useMatch({
    from: '/audit/queries/$queryId',
    shouldThrow: false,
  })
  const selectedQueryId = match?.params.queryId
    ? Number(match.params.queryId)
    : null

  const { data = [] } = useLiveQuery((q) =>
    q.from({ query: auditQueriesCollection }),
  )
  const queries = data as unknown as AuditQuery[]

  return (
    <AuditMasterDetailLayout
      list={
        <AuditQueryList queries={queries} selectedQueryId={selectedQueryId} />
      }
      detail={<Outlet />}
    />
  )
}

function AuditQueriesError({ error }: { error: Error }) {
  const router = useRouter()
  const queryErrorResetBoundary = useQueryErrorResetBoundary()

  useEffect(() => {
    queryErrorResetBoundary.reset()
  }, [queryErrorResetBoundary])

  return (
    <div className="flex flex-col gap-3 p-6">
      <Alert variant="destructive">
        <AlertDescription>
          {error.message || 'Unable to load audit queries.'}
        </AlertDescription>
      </Alert>
      <Button type="button" size="sm" onClick={() => void router.invalidate()}>
        Retry
      </Button>
    </div>
  )
}

export const Route = createFileRoute('/audit/queries')({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(auditQueriesListOptions()),
      context.queryClient.ensureQueryData(auditCategoriesListOptions()),
    ]),
  component: AuditQueriesLayout,
  errorComponent: AuditQueriesError,
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
