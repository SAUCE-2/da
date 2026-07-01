import { createFileRoute } from '@tanstack/react-router'

import { AuditQueryEditor } from './-components/AuditQueryEditor'

export const Route = createFileRoute('/audit/queries/$queryId')({
  params: {
    parse: (raw) => ({
      queryId: Number(raw.queryId),
    }),
    stringify: ({ queryId }) => ({
      queryId: String(queryId),
    }),
  },
  component: AuditQueryEditor,
})
