import { FolderOpenIcon } from '@phosphor-icons/react'
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

function ProjectsPage() {
  return (
    <PageLayout
      title="Projects"
      description="Group audit definitions and runs by team, product, or data domain."
    >
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderOpenIcon />
          </EmptyMedia>
          <EmptyTitle>No projects yet</EmptyTitle>
          <EmptyDescription>
            Project management is not available yet. You will be able to create
            projects and scope audit work to them here.
          </EmptyDescription>
          <Badge variant="secondary">0 total</Badge>
        </EmptyHeader>
      </Empty>
    </PageLayout>
  )
}

export const Route = createFileRoute('/projects')({
  component: ProjectsPage,
  staticData: {
    nav: {
      id: 'projects',
      label: 'Projects',
      icon: FolderOpenIcon,
      subsectionId: 'test',
      order: 20,
    },
  },
})
