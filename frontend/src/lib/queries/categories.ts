import { queryOptions } from '@tanstack/react-query'

import { listCategories, type Category } from '@/lib/api'

import { categoryKeys } from './keys'

export const categoriesListOptions = () =>
  queryOptions({
    queryKey: categoryKeys.list(),
    queryFn: async () => (await listCategories()) as Category[],
    staleTime: 60_000,
  })
