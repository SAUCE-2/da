export const auditQueryKeys = {
  all: ['audit-queries'] as const,
  lists: () => [...auditQueryKeys.all, 'list'] as const,
  list: () => [...auditQueryKeys.lists()] as const,
  versions: (id: number | null) =>
    [...auditQueryKeys.all, 'versions', id ?? 'new'] as const,
  preview: (id: number | null, request: Record<string, unknown> = {}) =>
    [...auditQueryKeys.all, 'preview', id ?? 'new', request] as const,
}

export const auditCategoryKeys = {
  all: ['audit-categories'] as const,
  lists: () => [...auditCategoryKeys.all, 'list'] as const,
  list: () => [...auditCategoryKeys.lists()] as const,
}

export const auditPlanKeys = {
  all: ['audit-plans'] as const,
  lists: () => [...auditPlanKeys.all, 'list'] as const,
  list: () => [...auditPlanKeys.lists()] as const,
}
