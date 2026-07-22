# UI parity checklist

Use this after the beginner-first refactor. UI appearance and behavior must match the pre-refactor app.

## Queries (`/queries`)

- [ ] List loads and sorts by name
- [ ] New query opens create editor
- [ ] Edit existing query loads fields, version badge, categories
- [ ] Tabs: Details / Query / Variables switch correctly
- [ ] Add / remove / reorder sections (drag handle)
- [ ] Add / remove variables
- [ ] Save create navigates to `/queries/$queryId`
- [ ] Save edit keeps URL and resets dirty state
- [ ] Delete navigates to `/queries/new` and removes from list
- [ ] Validation errors appear in the shell alert
- [ ] SQL preview loads for saved queries; unavailable for unsaved
- [ ] Preview variable overrides are local only
- [ ] Not-found state for missing query id

## Plans (`/plans`)

- [ ] List loads with query-count badges
- [ ] Create / edit / save / delete flows work
- [ ] Tabs: Details / Queries / Variables
- [ ] Add / remove / reorder plan steps
- [ ] Selecting a query seeds variable bindings
- [ ] Variables tab edits bindings
- [ ] Validation requires a query on every step
- [ ] Not-found state for missing plan id

## Categories (`/categories`)

- [ ] List loads, sorted by name, with query counts
- [ ] Create / edit / save / delete flows work
- [ ] Usage section shows assigned query count when editing
- [ ] Not-found state for missing category id

## Layout / chrome

- [ ] Sidebar nav: Queries, Plans, Categories
- [ ] Master-detail layout at desktop width
- [ ] Mobile / sheet list behavior unchanged
- [ ] Theme toggle still works
- [ ] Toasts on save / delete success and failure
