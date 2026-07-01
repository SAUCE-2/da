import { queryOptions } from '@tanstack/react-query'

import { getBackendHealth } from '@/lib/audit-api'

export const healthQueryOptions = () =>
  queryOptions({
    queryKey: ['health'] as const,
    queryFn: getBackendHealth,
    staleTime: 30_000,
  })
