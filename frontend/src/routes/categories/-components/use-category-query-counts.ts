import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import type { Category } from '@/lib/api'
import {
  buildDerivedQueryCounts,
  getCategoryQueryCount,
} from '@/lib/category-utils'
import { queriesListOptions } from '@/lib/queries/queries'

export function useCategoryQueryCounts() {
  const { data: queries = [] } = useQuery(queriesListOptions())
  const counts = useMemo(() => buildDerivedQueryCounts(queries), [queries])

  return useCallback(
    (category: Category) => getCategoryQueryCount(category, counts),
    [counts],
  )
}
