import { queryOptions } from '@tanstack/react-query'

import { listCategories } from '@/lib/api'

import { categoryKeys } from './keys'

export const categoriesListOptions = () =>
  queryOptions({
    queryKey: categoryKeys.list(),
    queryFn: listCategories,
    staleTime: 60_000,
  })
