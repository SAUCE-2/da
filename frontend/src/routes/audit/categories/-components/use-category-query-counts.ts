import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import type { AuditCategory } from '@/lib/audit-api'
import {
  buildDerivedQueryCounts,
  getCategoryQueryCount,
} from '@/lib/audit-category-utils'
import { auditQueriesListOptions } from '@/lib/queries/audit-queries'

export function useCategoryQueryCounts() {
  const { data: queries = [] } = useQuery(auditQueriesListOptions())
  const counts = useMemo(() => buildDerivedQueryCounts(queries), [queries])

  return useCallback(
    (category: AuditCategory) => getCategoryQueryCount(category, counts),
    [counts],
  )
}
