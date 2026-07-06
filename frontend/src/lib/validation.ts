import { fromError } from 'zod-validation-error'
import type { z } from 'zod'

export function formatZodError(error: z.ZodError) {
  return fromError(error, {
    prefix: null,
    includePath: false,
    issueSeparator: ' ',
  }).toString()
}
