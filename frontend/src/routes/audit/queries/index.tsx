import { createFileRoute } from '@tanstack/react-router'

import { AuditQueryEditor } from './-components/AuditQueryEditor'

function CreateQueryPage() {
  return <AuditQueryEditor key="new" />
}

export const Route = createFileRoute('/audit/queries/')({
  component: CreateQueryPage,
})
