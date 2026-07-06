import { createFileRoute } from '@tanstack/react-router'

import { PlanEditor } from './-components/PlanEditor'

function EditPlanPage() {
  const { planId } = Route.useParams()
  return <PlanEditor key={planId} />
}

export const Route = createFileRoute('/plans/$planId')({
  params: {
    parse: (raw) => ({
      planId: Number(raw.planId),
    }),
    stringify: ({ planId }) => ({
      planId: String(planId),
    }),
  },
  component: EditPlanPage,
})
