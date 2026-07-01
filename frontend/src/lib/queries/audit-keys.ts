export const auditQueryKeys = {
  all: ['audit-queries'] as const,
  lists: () => [...auditQueryKeys.all, 'list'] as const,
  list: () => [...auditQueryKeys.lists()] as const,
  preview: (id: number | null) =>
    [...auditQueryKeys.all, 'preview', id ?? 'new'] as const,
}

export const auditCategoryKeys = {
  all: ['audit-categories'] as const,
  lists: () => [...auditCategoryKeys.all, 'list'] as const,
  list: () => [...auditCategoryKeys.lists()] as const,
}
