# Frontend UI Conventions

Cross-cutting reference for frontend layout and editor patterns in the Data Audit app. This is not a numbered execution plan — use it when building or refactoring UI that goes beyond simple CRUD forms.

## State ownership

| Concern | Source of truth |
|---------|-----------------|
| Create vs edit selection | URL (`/…/new` or `/…/$id`) |
| Server lists and mutations | TanStack Query (`src/lib/queries/`) |
| Form field values | TanStack Form (feature `use-*-workspace.ts` hooks) |

Do not add a React context for selection. Route files pass `entityId: number | null` into editors.

## When To Use Which Pattern

| Complexity | Pattern | Example |
|------------|---------|---------|
| Simple CRUD (few fields) | Stacked `EditorSection` blocks | Category editor, simple plan metadata |
| Multi-concern editor (3+ distinct mental models) | Top-level line tabs below header | Query editor: Details / Query / Variables |
| Sub-concern within one tab | Nested sections or cards, not more tabs | Section cards inside Query tab |

## Tabbed Editor Rules

Use top-level tabs when a single entity has multiple independent concerns that users think about separately, but still belong to one save action.

- **Single form across all tabs** — primary actions (Save, Delete) stay in the persistent `EditorHeader`.
- **Tab labels = user mental models** — use nouns (Details, Query, Variables), not step numbers.
- **Preview / runtime tooling beside content** — SQL preview and preview-value overrides live on the Query tab, not Details.
- **`embedded` child editors** — when a tab owns the context, child editors (`QuerySectionsEditor`, `QueryVariablesEditor`) skip their own `EditorSection` wrapper and render inline headers/actions.
- **Local tab state** — tab selection is component state, not URL search params. Reset to the details tab when the selected entity changes.
- **Default tab** — start on the metadata/details tab for create flows.

### Reference implementation

- [`QueryEditor.tsx`](../frontend/src/routes/queries/-components/QueryEditor.tsx) — header + form shell
- [`QueryEditorTabs.tsx`](../frontend/src/routes/queries/-components/QueryEditorTabs.tsx) — three-tab layout
- [`query-editor-tab.ts`](../frontend/src/routes/queries/-components/query-editor-tab.ts) — shared tab type constants

## Shared Layout Primitives

- **`MasterDetailLayout`** — list pane + detail pane for queries, categories, and plans. Visual layout only; selection comes from the URL.
- **`EntityListPanel` / `EntityListItem`** — entity list navigation; active state comes from the current route.
- **`EditorHeader`** — title, description, and action row (save, delete, run).
- **`EditorSection`** — bordered section with title/description for stacked simple editors.
- **`TabPanelSection`** (inline in tabbed editors) — lighter sub-section grouping inside a tab panel without full border stack.

“Workspace” in older docs means this master-detail **UI** pattern, not a state-management architecture.

## Tabs Component

- Use shadcn `Tabs` with `TabsList variant="line"` for primary editor navigation.
- Bump tab trigger touch targets (`min-h-10 px-3`) on primary nav controls.
- Do not use tabs as linear wizards — no Next/Back step flow; Save works from any tab.

## Anti-Patterns

- Selection React context or URL + local override hybrids.
- Nested `SidebarProvider` for the entity list (app nav already has one in `__root.tsx`).
- Tabs for linear wizards where each step must be completed in order.
- Tabs that hide required create fields on a non-default tab without clear affordance.
- Mixing unrelated save scopes per tab (each tab should contribute to one entity save).
- Nesting tabs inside tabs unless the inner split is a true sub-concern (prefer cards/sections).
- Putting preview tooling on a different tab from the content it previews.

## Related Plans

- [Plan 01.5: Route Metadata Navigation](01.5-route-metadata-navigation.md) — nav shell and route metadata
- [Plan 02.6: Query Versioning And Variables](02.6-query-versioning-and-variables.md) — query editor feature scope
- [Runtime And Variable Context](runtime-and-variable-context.md) — variable confirmation and plan overrides (future)
- [Frontend README](../frontend/README.md) — onboarding entry point for new developers
