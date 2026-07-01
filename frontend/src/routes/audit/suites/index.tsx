import { StackIcon } from '@phosphor-icons/react'
import { createFileRoute } from '@tanstack/react-router'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

function AuditSuitesPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
        <Card className="ring-0">
          <CardHeader>
            <CardTitle className="text-xl">Suites</CardTitle>
            <CardDescription>
              Bundle audit queries into runnable suites for scheduled checks.
            </CardDescription>
          </CardHeader>
        </Card>

        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <StackIcon />
            </EmptyMedia>
            <EmptyTitle>No audit suites yet</EmptyTitle>
            <EmptyDescription>
              Suite management is not available yet.
            </EmptyDescription>
            <Badge variant="secondary">0 total</Badge>
          </EmptyHeader>
        </Empty>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/audit/suites/')({
  component: AuditSuitesPage,
  staticData: {
    nav: {
      id: 'audit.suites',
      label: 'Audit Suites',
      icon: StackIcon,
      subsectionId: 'audit',
      order: 50,
    },
  },
})
