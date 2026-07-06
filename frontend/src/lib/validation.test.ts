import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { formatZodError } from './validation'

describe('formatZodError', () => {
  it('joins messages without paths or validation prefix', () => {
    const schema = z.object({
      name: z.string().trim().min(1, 'Query name is required.'),
      sections: z.array(
        z.object({
          name: z.string().trim().min(1, 'Section name is required.'),
          sqlFragment: z
            .string()
            .trim()
            .min(1, 'Every query section needs a SQL fragment.'),
        }),
      ),
    })

    const result = schema.safeParse({
      name: '',
      sections: [{ name: '', sqlFragment: '' }],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(formatZodError(result.error)).toBe(
        'Query name is required. Section name is required. Every query section needs a SQL fragment.',
      )
    }
  })
})
