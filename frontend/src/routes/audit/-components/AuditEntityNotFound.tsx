import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

type AuditEntityNotFoundProps = {
  message: string
  backLabel: string
  onBack: () => void
}

export function AuditEntityNotFound({
  message,
  backLabel,
  onBack,
}: AuditEntityNotFoundProps) {
  return (
    <div className="flex flex-col gap-3 p-6">
      <Alert variant="destructive">
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      <Button type="button" size="sm" className="w-fit" onClick={onBack}>
        {backLabel}
      </Button>
    </div>
  )
}
