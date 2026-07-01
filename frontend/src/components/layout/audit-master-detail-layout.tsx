import type { ReactNode } from 'react'

import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'

type AuditMasterDetailLayoutProps = {
  list: ReactNode
  detail: ReactNode
}

export function AuditMasterDetailLayout({
  list,
  detail,
}: AuditMasterDetailLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <Sidebar
          collapsible="none"
          className="md:w-[min(300px,30%)] md:min-w-[260px] border-r"
        >
          {list}
        </Sidebar>
        <SidebarInset className="min-h-0 overflow-hidden">{detail}</SidebarInset>
      </div>
    </SidebarProvider>
  )
}
