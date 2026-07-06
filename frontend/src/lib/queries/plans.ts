import { queryOptions } from '@tanstack/react-query'

import { listPlans } from '@/lib/api'

import { planKeys } from './keys'

export const plansListOptions = () =>
  queryOptions({
    queryKey: planKeys.list(),
    queryFn: listPlans,
    staleTime: 60_000,
  })
