import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  createAuditPlan,
  deleteAuditPlan,
  updateAuditPlan,
  type AuditPlanRequest,
} from '@/lib/audit-api'
import { getErrorMessage } from '@/lib/get-error-message'
import { queryClient } from '@/lib/query-client'
import { auditPlanKeys } from '@/lib/queries/audit-keys'

export function usePersistAuditPlan() {
  return useMutation({
    mutationFn: ({ id, request }: { id: number | null; request: AuditPlanRequest }) =>
      id === null ? createAuditPlan(request) : updateAuditPlan(id, request),
    onSuccess: () => {
      toast.success('Audit plan saved.')
      void queryClient.invalidateQueries({ queryKey: auditPlanKeys.list() })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Unable to save audit plan.'))
    },
  })
}

export function useRemoveAuditPlan() {
  return useMutation({
    mutationFn: (id: number) => deleteAuditPlan(id),
    onSuccess: () => {
      toast.success('Audit plan deleted.')
      void queryClient.invalidateQueries({ queryKey: auditPlanKeys.list() })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Unable to delete audit plan.'))
    },
  })
}
