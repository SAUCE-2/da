import { createFileRoute } from '@tanstack/react-router'

import { AuditQueryDetailPage } from './-components/AuditQueryDetailPage'

export const Route = createFileRoute('/audit/queries/$queryId')({
  params: {
    parse: (raw) => ({
      queryId: Number(raw.queryId),
    }),
    stringify: ({ queryId }) => ({
      queryId: String(queryId),
    }),
  },
  component: function AuditQueryEditPage() {
    const { queryId } = Route.useParams()

    return <AuditQueryDetailPage selectedQueryId={queryId} />
  },
})
