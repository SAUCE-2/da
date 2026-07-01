import { queryOptions } from '@tanstack/react-query'

import { listAuditCategories } from '@/lib/audit-api'

import { auditCategoryKeys } from './audit-keys'

export const auditCategoriesListOptions = () =>
  queryOptions({
    queryKey: auditCategoryKeys.list(),
    queryFn: listAuditCategories,
    staleTime: 60_000,
  })
