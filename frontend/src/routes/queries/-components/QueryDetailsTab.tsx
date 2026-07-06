import { useStore } from '@tanstack/react-form'

import { Checkbox } from '@/components/ui/checkbox'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import type { Category } from '@/lib/api'

import { EditorSection } from '@/components/workspace/EditorSection'
import { EntityMetadataFields } from '@/components/workspace/EntityMetadataFields'
import type { QueryWorkspaceForm } from './use-query-workspace'

type QueryDetailsTabProps = {
  form: QueryWorkspaceForm
  categories: Category[]
  toggleCategory: (categoryId: number) => void
}

export function QueryDetailsTab({
  form,
  categories,
  toggleCategory,
}: QueryDetailsTabProps) {
  const categoryIds = useStore(form.store, (state) => state.values.categoryIds)

  return (
    <>
      <EditorSection title="Basic information">
        <EntityMetadataFields
          form={form}
          activeFieldId="query-active"
          activeLabel="Active by default"
          namePlaceholder="Query name"
          descriptionPlaceholder="What this query checks and when it should be used"
        />
      </EditorSection>

      <EditorSection title="Categories">
        {categories.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No categories available</EmptyTitle>
              <EmptyDescription>
                Create audit categories before assigning them to queries.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <FieldSet>
            <FieldLegend variant="label" className="sr-only">
              Audit categories
            </FieldLegend>
            <FieldGroup className="gap-3">
              {categories.map((category) => {
                const categoryId = `query-category-${category.id}`

                return (
                  <Field key={category.id} orientation="horizontal">
                    <Checkbox
                      id={categoryId}
                      checked={categoryIds.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <FieldContent>
                      <FieldLabel htmlFor={categoryId}>{category.name}</FieldLabel>
                      {category.description ? (
                        <FieldDescription>{category.description}</FieldDescription>
                      ) : null}
                    </FieldContent>
                  </Field>
                )
              })}
            </FieldGroup>
          </FieldSet>
        )}
      </EditorSection>
    </>
  )
}
