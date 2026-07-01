import { DatabaseIcon } from '@phosphor-icons/react'
import { createFileRoute } from '@tanstack/react-router'

import { PageLayout } from '@/components/layout/page-layout'
import { Badge } from '@/components/ui/badge'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

function EnvironmentsPage() {
  return (
    <PageLayout
      title="Environments"
      description="Define the databases and runtime contexts where audit queries execute."
    >
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <DatabaseIcon />
          </EmptyMedia>
          <EmptyTitle>No environments configured</EmptyTitle>
          <EmptyDescription>
            Environment management is not available yet. You will be able to
            register connection targets and credentials here.
          </EmptyDescription>
          <Badge variant="secondary">0 total</Badge>
        </EmptyHeader>
      </Empty>
    </PageLayout>
  )
}

export const Route = createFileRoute('/environments')({
  component: EnvironmentsPage,
  staticData: {
    nav: {
      id: 'environments',
      label: 'Environments',
      icon: DatabaseIcon,
      subsectionId: 'core',
      order: 10,
    },
  },
})
