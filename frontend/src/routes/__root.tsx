import type { QueryClient } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { useMemo } from 'react'

import { ThemeProvider } from 'next-themes'

import { AppSidebar } from '@/components/app-sidebar'
import { Badge } from '@/components/ui/badge'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { buildNavTree } from '@/lib/build-nav-tree'
import { healthQueryOptions } from '@/lib/queries/health-queries'
import { routeTree } from '@/routeTree.gen'

function RootComponent() {
  const navSections = useMemo(() => buildNavTree(routeTree), [])
  const { data, isError, isPending } = useQuery(healthQueryOptions())

  const healthLabel = isPending
    ? 'Checking backend...'
    : isError
      ? 'Backend status unavailable'
      : `Backend status: ${data.status ?? 'UNKNOWN'}`

  const healthVariant = isPending
    ? 'secondary'
    : isError
      ? 'destructive'
      : data?.status?.toUpperCase() === 'UP'
        ? 'default'
        : 'outline'

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="theme"
    >
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar sections={navSections} />
          <SidebarInset>
            <header className="flex h-12 shrink-0 items-center gap-3 border-b px-4">
              <SidebarTrigger />
              <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                <p className="truncate text-sm font-medium">Data Audit</p>
                <Badge variant={healthVariant} className="shrink-0">
                  {healthLabel}
                </Badge>
              </div>
            </header>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <Outlet />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
      <Toaster />
    </ThemeProvider>
  )
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootComponent,
})
