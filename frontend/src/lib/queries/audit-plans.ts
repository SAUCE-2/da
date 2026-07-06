import { queryOptions } from '@tanstack/react-query'

import { listAuditPlans } from '@/lib/audit-api'

import { auditPlanKeys } from './audit-keys'

export const auditPlansListOptions = () =>
  queryOptions({
    queryKey: auditPlanKeys.list(),
    queryFn: listAuditPlans,
    staleTime: 60_000,
  })
