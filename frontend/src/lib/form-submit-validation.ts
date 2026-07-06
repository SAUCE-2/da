import type { z } from 'zod'

import { formatZodError } from './validation'

export function submitValidationError(error: z.ZodError): string {
  return formatZodError(error)
}

export function readSubmitError(errorMap: unknown): string | null {
  const err = (errorMap as { onSubmit?: unknown })?.onSubmit
  return typeof err === 'string' && err.length > 0 ? err : null
}
