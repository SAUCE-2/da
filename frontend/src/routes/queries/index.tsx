import { createFileRoute } from '@tanstack/react-router'

import { QueryEditor } from './-components/QueryEditor'

function CreateQueryPage() {
  return <QueryEditor key="new" />
}

export const Route = createFileRoute('/queries/')({
  component: CreateQueryPage,
})
