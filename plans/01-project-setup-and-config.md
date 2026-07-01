# Plan 01: Project Setup And Config

## Goal

Create the smallest runnable backend and frontend shell for the data audit application. This plan does not create audit domain tables, fake audit queries, or customer data.

## What To Implement

- Create a greenfield monorepo layout:
  - `backend/` for the Spring Boot application.
  - `frontend/` for the Vite React TanStack Router application.
- Generate the backend from Spring Initializr:
  - Maven project
  - Spring Boot `4.1.0`
  - Group `com.test`
  - Artifact `backend`
  - Package `com.test.backend`
  - Java `25`
  - Packaging `jar`
  - Properties configuration
- Add backend dependencies:
  - Spring MVC / Web
  - Spring Data JPA
  - Validation
  - H2
  - Oracle JDBC runtime dependency
  - Test starter
- Add local metadata database config using H2.
- Add Oracle metadata profile config using environment variables only.
- Add a simple `/api/health` endpoint.
- Add CORS or a Vite dev proxy so the frontend can call `/api`.
- Create the frontend with Vite, React, TypeScript, and TanStack Router.
- Add placeholder routes only:
  - `/`
  - `/environments`
  - `/projects`
  - `/audit-queries`
  - `/audit-categories`
  - `/audit-suites`

## Initial Backend Shape

```text
backend/
  pom.xml
  src/main/java/com/test/backend/BackendApplication.java
  src/main/java/com/test/backend/web/HealthController.java
  src/main/resources/application.properties
  src/main/resources/application-local.properties
  src/main/resources/application-oracle.properties
```

## Initial Frontend Shape

```text
frontend/
  package.json
  vite.config.ts
  src/main.tsx
  src/routes/__root.tsx
  src/routes/index.tsx
  src/routes/environments.tsx
  src/routes/projects.tsx
  src/routes/audit-queries.tsx
  src/routes/audit-categories.tsx
  src/routes/audit-suites.tsx
```

## Configuration Rules

- `local` profile uses H2 for the metadata database.
- `oracle` profile uses Oracle for the metadata database.
- Runtime audit target environments are not configured as Spring profiles.
- Oracle credentials are supplied through environment variables such as `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`.
- The MVP can start with no seed data.

## Frontend Rules

- Use TanStack Router for application pages.
- Keep all pages as placeholders in this phase.
- Add a simple navigation shell so the user can see the planned areas of the application.
- Do not add API clients beyond a health check call.

## Verification Checklist

- `./mvnw test` passes in `backend/`.
- `./mvnw spring-boot:run -Dspring-boot.run.profiles=local` starts with H2.
- `GET /api/health` returns a successful response.
- `npm install` succeeds in `frontend/`.
- `npm run build` succeeds in `frontend/`.
- The frontend can navigate to each placeholder route.

## Anti-Pattern Guards

- Do not create audit query, category, suite, environment, project, or run entities yet.
- Do not create fake customer data.
- Do not configure real production database credentials in committed files.
- Do not implement query execution in this phase.
- Do not add authentication, RBAC, scheduling, or deployment automation yet.

