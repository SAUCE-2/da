import { createFileRoute } from '@tanstack/react-router'

import { AuditPlanEditor } from './-components/AuditPlanEditor'

export const Route = createFileRoute('/audit/plans/$planId')({
  component: AuditPlanEditor,
})
