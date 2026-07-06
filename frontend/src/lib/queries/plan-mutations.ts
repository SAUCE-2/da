import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  createPlan,
  deletePlan,
  updatePlan,
  type PlanRequest,
} from '@/lib/api'
import { getErrorMessage } from '@/lib/get-error-message'
import { queryClient } from '@/lib/query-client'
import { planKeys } from '@/lib/queries/keys'

export function usePersistPlan() {
  return useMutation({
    mutationFn: ({ id, request }: { id: number | null; request: PlanRequest }) =>
      id === null ? createPlan(request) : updatePlan(id, request),
    onSuccess: () => {
      toast.success('Plan saved.')
      void queryClient.invalidateQueries({ queryKey: planKeys.list() })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Unable to save plan.'))
    },
  })
}

export function useRemovePlan() {
  return useMutation({
    mutationFn: (id: number) => deletePlan(id),
    onSuccess: () => {
      toast.success('Plan deleted.')
      void queryClient.invalidateQueries({ queryKey: planKeys.list() })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Unable to delete plan.'))
    },
  })
}
