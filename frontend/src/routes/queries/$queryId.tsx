import { createFileRoute } from '@tanstack/react-router'

import { QueryEditor } from './-components/QueryEditor'

function EditQueryPage() {
  const { queryId } = Route.useParams()
  return <QueryEditor key={queryId} />
}

export const Route = createFileRoute('/queries/$queryId')({
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
