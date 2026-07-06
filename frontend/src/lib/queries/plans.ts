import { queryOptions } from '@tanstack/react-query'

import { listPlans, type Plan } from '@/lib/api'

import { planKeys } from './keys'

export const plansListOptions = () =>
  queryOptions({
    queryKey: planKeys.list(),
    queryFn: async () => (await listPlans()) as Plan[],
    staleTime: 60_000,
  })
