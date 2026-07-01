import { createFileRoute } from '@tanstack/react-router'

import { AuditQueryDetailPage } from './-components/AuditQueryDetailPage'

export const Route = createFileRoute('/audit/queries/')({
  component: () => <AuditQueryDetailPage selectedQueryId={null} />,
})
