import { HouseIcon } from '@phosphor-icons/react'
import { Link, createFileRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { PageLayout } from '@/components/layout/page-layout'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

function HomePage() {
  return (
    <PageLayout
      title="Home"
      description="Manage environments, projects, and audit definitions from one place."
    >
      <div className="flex flex-col gap-8">
        <HomeLinkGroup title="Core">
          <HomeLink
            to="/environments"
            title="Environments"
            description="Target databases and runtime contexts for audit runs."
            meta="Setup"
          />
          <HomeLink
            to="/projects"
            title="Projects"
            description="Group audit work by team, product, or data domain."
            meta="Setup"
          />
        </HomeLinkGroup>

        <HomeLinkGroup title="Audit">
          <HomeLink
            to="/audit/queries"
            title="Audit Queries"
            description="Reusable SQL definitions built from ordered sections."
            meta="Active"
            metaVariant="secondary"
          />
          <HomeLink
            to="/audit/categories"
            title="Audit Categories"
            description="Organize queries into categories for filtering and reporting."
            meta="Active"
            metaVariant="secondary"
          />
          <HomeLink
            to="/audit/suites"
            title="Audit Suites"
            description="Bundle queries into runnable suites for scheduled checks."
            meta="Planned"
            metaVariant="outline"
          />
        </HomeLinkGroup>
      </div>
    </PageLayout>
  )
}

function HomeLinkGroup({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      <div className="overflow-hidden rounded-none border bg-card">{children}</div>
    </div>
  )
}

function HomeLink({
  to,
  title,
  description,
  meta,
  metaVariant = 'outline',
}: {
  to: string
  title: string
  description: string
  meta: string
  metaVariant?: 'secondary' | 'outline'
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex flex-col gap-1 border-b px-4 py-3 transition-colors last:border-b-0',
        'hover:bg-accent/50',
      )}
    >
      <span className="flex w-full items-start justify-between gap-3">
        <span className="font-medium leading-snug">{title}</span>
        <Badge variant={metaVariant} className="shrink-0">
          {meta}
        </Badge>
      </span>
      <span className="line-clamp-2 text-sm text-muted-foreground">
        {description}
      </span>
    </Link>
  )
}

export const Route = createFileRoute('/')({
  component: HomePage,
  staticData: {
    nav: {
      id: 'home',
      label: 'Home',
      icon: HouseIcon,
      order: 0,
    },
  },
})
