import { TagIcon } from '@phosphor-icons/react'
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
import {
  auditCategoriesCollection,
  auditQueriesCollection,
} from '@/lib/db/audit-collections'
import type { AuditCategory, AuditQuery } from '@/lib/audit-api'
import { auditCategoriesListOptions } from '@/lib/queries/audit-categories'
import { auditQueriesListOptions } from '@/lib/queries/audit-queries'

import { AuditCategoryList } from './-components/AuditCategoryList'
import { buildDerivedQueryCounts, getCategoryQueryCount } from './-components/category-form'

function AuditCategoriesLayout() {
  const match = useMatch({
    from: '/audit/categories/$categoryId',
    shouldThrow: false,
  })
  const selectedCategoryId = match?.params.categoryId
    ? Number(match.params.categoryId)
    : null

  const { data: categoryRows = [] } = useLiveQuery((q) =>
    q.from({ category: auditCategoriesCollection }),
  )
  const { data: queryRows = [] } = useLiveQuery((q) =>
    q.from({ query: auditQueriesCollection }),
  )
  const categories = categoryRows as unknown as AuditCategory[]
  const queries = queryRows as unknown as AuditQuery[]
  const derivedCounts = buildDerivedQueryCounts(queries)

  return (
    <AuditMasterDetailLayout
      list={
        <AuditCategoryList
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          getQueryCount={(category) =>
            getCategoryQueryCount(category, derivedCounts)
          }
        />
      }
      detail={<Outlet />}
    />
  )
}

function AuditCategoriesError({ error }: { error: Error }) {
  const router = useRouter()
  const queryErrorResetBoundary = useQueryErrorResetBoundary()

  useEffect(() => {
    queryErrorResetBoundary.reset()
  }, [queryErrorResetBoundary])

  return (
    <div className="flex flex-col gap-3 p-6">
      <Alert variant="destructive">
        <AlertDescription>
          {error.message || 'Unable to load audit categories.'}
        </AlertDescription>
      </Alert>
      <Button type="button" size="sm" onClick={() => void router.invalidate()}>
        Retry
      </Button>
    </div>
  )
}

export const Route = createFileRoute('/audit/categories')({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(auditCategoriesListOptions()),
      context.queryClient.ensureQueryData(auditQueriesListOptions()),
    ]),
  component: AuditCategoriesLayout,
  errorComponent: AuditCategoriesError,
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
