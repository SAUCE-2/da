import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

type AuditRouteQueryErrorProps = {
  error: Error
  fallbackMessage: string
}

export function AuditRouteQueryError({
  error,
  fallbackMessage,
}: AuditRouteQueryErrorProps) {
  const router = useRouter()
  const queryErrorResetBoundary = useQueryErrorResetBoundary()

  useEffect(() => {
    queryErrorResetBoundary.reset()
  }, [queryErrorResetBoundary])

  return (
    <div className="flex flex-col gap-3 p-6">
      <Alert variant="destructive">
        <AlertDescription>
          {error.message || fallbackMessage}
        </AlertDescription>
      </Alert>
      <Button type="button" size="sm" onClick={() => void router.invalidate()}>
        Retry
      </Button>
    </div>
  )
}
