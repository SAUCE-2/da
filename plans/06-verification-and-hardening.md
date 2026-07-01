# Plan 06: Verification And Hardening

## Goal

Verify the MVP works end to end and tighten the parts that are risky before expanding features. This phase is for proving behavior, not adding new product scope.

## What To Verify

- Backend starts locally with H2 metadata configuration.
- Backend can be configured for Oracle metadata without code changes.
- Frontend builds and routes correctly.
- Audit query metadata can be created, categorized, edited, and previewed.
- Environment and project selection is explicit and validated.
- Suites run queries sequentially against the selected target database.
- Run history records enough detail to explain what happened.
- SQL execution is constrained to read-only audit behavior.

## Backend Test Checklist

- Unit tests:
  - query section rendering order
  - section enable/disable logic
  - project override resolution if Plan 05 is implemented
  - SQL safety validator
- Repository tests:
  - query and category persistence
  - many-to-many query/category mapping
  - environment/project relationship
  - suite and run persistence
- Controller tests:
  - CRUD validation errors
  - missing environment/project context
  - suite run trigger responses
- Integration tests:
  - H2 metadata startup
  - suite execution against a controlled local test table

## Frontend Test Checklist

- Build succeeds.
- Router routes render:
  - `/`
  - `/environments`
  - `/projects`
  - `/audit-queries`
  - `/audit-categories`
  - `/audit-suites`
- Forms handle create and edit flows.
- Selected environment and project are visible before running suites.
- Suite run history displays status, timing, and errors.

## Manual Verification Script

1. Start backend with the local H2 profile.
2. Start frontend development server.
3. Create one environment record without real credentials.
4. Create one project under that environment.
5. Create one abstract audit query with multiple sections.
6. Add the query to one category.
7. Create one suite and add the query.
8. Confirm the app blocks execution when no valid target connection exists.
9. Configure a safe local target connection for development.
10. Run the suite and inspect `SuiteRun` and `QueryRun` history.

## Security And Safety Checklist

- No real credentials are committed.
- Target audit database users are read-only.
- Query timeout is configured.
- Multi-statement SQL is rejected.
- DML and DDL keywords are rejected.
- Rendered SQL is stored with each query run.
- Failed queries produce failed run records.
- Logs do not print database passwords.

## Compatibility Checklist

- Java version is `25`.
- Spring Boot version is pinned to `4.1.0`.
- Maven wrapper is committed.
- Backend uses `jakarta.persistence` imports.
- H2 is local-only unless explicitly configured otherwise.
- Oracle driver is a runtime dependency.
- TanStack Router generated route tree is up to date.

## Anti-Pattern Grep Checks

- Search for committed secrets:
  - `password=`
  - `DB_PASSWORD=`
  - Oracle connection strings with credentials
- Search for legacy imports:
  - `javax.persistence`
- Search for unsafe execution shortcuts:
  - direct JDBC execution outside the audit execution service
  - suite execution code that ignores `environmentId`
  - suite execution code that ignores `projectId`

## Done Criteria

- All tests pass.
- Backend and frontend both build.
- Manual local flow is documented and repeatable.
- The app has no fake customer data.
- The next feature request can start from real user feedback rather than speculative complexity.

