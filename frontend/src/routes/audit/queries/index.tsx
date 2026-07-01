import { createFileRoute } from '@tanstack/react-router'

import { AuditQueryEditor } from './-components/AuditQueryEditor'

export const Route = createFileRoute('/audit/queries/')({
  component: AuditQueryEditor,
})
