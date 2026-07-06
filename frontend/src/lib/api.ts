import type { components } from './api-schema'

export {
  createCategory,
  createPlan,
  createQuery,
  deleteCategory,
  deletePlan,
  deleteQuery,
  listCategories,
  listPlans,
  listQueries,
  previewQuery,
  updateCategory,
  updatePlan,
  updateQuery,
} from './api-client'

export {
  categoryRequestSchema,
  planItemRequestSchema,
  planItemVariableBindingRequestSchema,
  planRequestSchema,
  queryRequestSchema,
  querySectionRequestSchema,
  queryVariableRequestSchema,
} from './schemas'

export type { CategoryRequest, PlanItemRequest, PlanRequest, QueryRequest } from './schemas'

type Schemas = components['schemas']

export type QueryVariableType = NonNullable<Schemas['QueryVariableResponse']['type']>

export type QuerySection = Required<
  Pick<Schemas['QuerySectionResponse'], 'id' | 'name' | 'sqlFragment' | 'sortOrder' | 'defaultEnabled'>
>

export type QueryVariable = Required<
  Pick<Schemas['QueryVariableResponse'], 'id' | 'name' | 'type' | 'required' | 'sortOrder'>
> & {
  defaultValue: string | null
}

export type CategorySummary = Required<Pick<Schemas['CategorySummaryResponse'], 'id' | 'name'>> & {
  description: string | null
}

export type Category = CategorySummary & {
  queryCount?: number
}

export type Query = Required<
  Pick<Schemas['QueryResponse'], 'id' | 'name' | 'active' | 'versionId' | 'versionNumber'>
> & {
  description: string | null
  sections: QuerySection[]
  variables: QueryVariable[]
  categories: CategorySummary[]
}

export type QueryPreviewRequest = Schemas['QueryPreviewRequest']

export type QueryPreview = Required<
  Pick<Schemas['QueryPreviewResponse'], 'id' | 'versionId' | 'sql'>
> & {
  unresolvedVariables: string[]
}

export type PlanItemVariableBinding = Required<Pick<Schemas['PlanItemVariableBindingResponse'], 'name'>> & {
  value: string | null
}

export type PlanItem = Required<
  Pick<Schemas['PlanItemResponse'], 'id' | 'queryId' | 'queryName' | 'sortOrder' | 'enabled'>
> & {
  queryVersionId: number | null
  queryVersionNumber: number | null
  variableBindings: PlanItemVariableBinding[]
}

export type Plan = Required<Pick<Schemas['PlanResponse'], 'id' | 'name' | 'active'>> & {
  description: string | null
  items: PlanItem[]
}

export { formatZodError } from './validation'
