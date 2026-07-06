import { createFileRoute } from '@tanstack/react-router'

import { AuditQueryEditor } from './-components/AuditQueryEditor'

function EditQueryPage() {
  const { queryId } = Route.useParams()
  return <AuditQueryEditor key={queryId} />
}

export const Route = createFileRoute('/audit/queries/$queryId')({
  params: {
    parse: (raw) => ({
      queryId: Number(raw.queryId),
    }),
    stringify: ({ queryId }) => ({
      queryId: String(queryId),
    }),
  },
  component: EditQueryPage,
})
