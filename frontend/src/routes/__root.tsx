import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { useMemo } from 'react'

import { ThemeProvider } from 'next-themes'

import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { buildNavTree } from '@/lib/build-nav-tree'
import { routeTree } from '@/routeTree.gen'

function RootComponent() {
  const navSections = useMemo(() => buildNavTree(routeTree), [])

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
          <SidebarInset className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <Outlet />
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
