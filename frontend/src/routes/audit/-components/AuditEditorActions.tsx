import type { ReactNode } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { OPTIMISTIC_ID } from '@/lib/queries/audit-mutations'

type AuditEditorActionsProps = {
  entityId: number | null
  saveLabel: string
  isSaving: boolean
  onDelete: () => void
  deleteTitle: string
  deleteDescription: ReactNode
}

export function AuditEditorActions({
  entityId,
  saveLabel,
  isSaving,
  onDelete,
  deleteTitle,
  deleteDescription,
}: AuditEditorActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {entityId !== null && entityId !== OPTIMISTIC_ID ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive">
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{deleteTitle}</AlertDialogTitle>
              <AlertDialogDescription>{deleteDescription}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={onDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
      <Button type="submit" disabled={isSaving}>
        {isSaving ? (
          <>
            <Spinner data-icon="inline-start" />
            Saving...
          </>
        ) : (
          saveLabel
        )}
      </Button>
    </div>
  )
}
