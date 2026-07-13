import { z } from 'zod'
import { fromError } from 'zod-validation-error'

export function formatZodError(error: z.ZodError) {
  return fromError(error, {
    prefix: null,
    includePath: false,
    issueSeparator: ' ',
  }).toString()
}

export const querySectionRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Section name is required.')
    .max(200, 'Section name must be 200 characters or fewer.'),
  sqlFragment: z
    .string()
    .trim()
    .min(1, 'Every query section needs a SQL fragment.'),
  sortOrder: z.number().finite(),
  defaultEnabled: z.boolean(),
})

export const queryVariableRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Variable name is required.')
    .max(100, 'Variable name must be 100 characters or fewer.')
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]*$/,
      'Variable names must start with a letter and use letters, numbers, or underscores.',
    ),
  type: z.enum(['STRING', 'NUMBER', 'DATE']),
  defaultValue: z
    .string()
    .max(1000, 'Default value must be 1000 characters or fewer.'),
  required: z.boolean(),
  sortOrder: z.number().finite(),
})

export const categoryRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Category name is required.')
    .max(200, 'Category name must be 200 characters or fewer.'),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or fewer.'),
})

export const queryRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Query name is required.')
    .max(200, 'Query name must be 200 characters or fewer.'),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or fewer.'),
  active: z.boolean(),
  sections: z
    .array(querySectionRequestSchema)
    .min(1, 'At least one query section is required.'),
  variables: z.array(queryVariableRequestSchema),
  categoryIds: z.array(z.number()),
})

export const planItemVariableBindingRequestSchema = z.object({
  name: z.string().trim().min(1).max(100),
  value: z.string().max(1000),
})

export const planItemRequestSchema = z.object({
  queryId: z.number(),
  queryVersionId: z.number().nullable().optional(),
  sortOrder: z.number().finite(),
  enabled: z.boolean(),
  variableBindings: z.array(planItemVariableBindingRequestSchema),
})

export const planRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Plan name is required.')
    .max(200, 'Plan name must be 200 characters or fewer.'),
  description: z.string().max(1000),
  active: z.boolean(),
  items: z.array(planItemRequestSchema),
})

export type QuerySectionRequest = z.infer<typeof querySectionRequestSchema>
export type QueryVariableRequest = z.infer<typeof queryVariableRequestSchema>
export type CategoryRequest = z.infer<typeof categoryRequestSchema>
export type QueryRequest = z.infer<typeof queryRequestSchema>
export type PlanItemRequest = z.infer<typeof planItemRequestSchema>
export type PlanRequest = z.infer<typeof planRequestSchema>
