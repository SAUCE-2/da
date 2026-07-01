import { createFileRoute, Outlet } from '@tanstack/react-router'

function AuditLayout() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Outlet />
    </div>
  )
}

export const Route = createFileRoute('/audit')({
  component: AuditLayout,
})
