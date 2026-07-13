# Backend

Spring Boot API for managing audit **queries**, **plans**, and **categories**. Stores versioned SQL definitions and metadata in a relational database (H2 locally, Oracle in deployed environments).

**Stack:** Java 25 · Spring Boot 4.1 · JPA · MapStruct · Lombok · springdoc-openapi

## Prerequisites

- **JDK 25** (matches `java.version` in `pom.xml`)
- No global Maven install required — use `./mvnw`

## Run locally

The `local` profile uses an in-memory H2 database with Oracle compatibility mode. Schema is created automatically on startup (`ddl-auto=create-drop`); data is lost when the process stops.

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

| URL | Purpose |
|-----|---------|
| http://localhost:8080/api/… | REST API |
| http://localhost:8080/swagger-ui.html | Interactive API docs |
| http://localhost:8080/v3/api-docs | OpenAPI JSON spec |
| http://localhost:8080/h2-console | H2 console (JDBC URL: `jdbc:h2:mem:dataaudit_metadata`) |

Start the frontend from `../frontend` (`npm run dev`) to use the UI — it proxies `/api` to port 8080.

## Run tests

```bash
./mvnw test
```

Tests use an embedded H2 database and `ddl-auto=create-drop`. No profile or external database is needed.

Run a single test class:

```bash
./mvnw test -Dtest=QueryServiceTests
```

## Run against Oracle

Activate the `oracle` profile and provide connection details via environment variables:

```bash
export DB_URL=jdbc:oracle:thin:@//host:1521/service
export DB_USERNAME=your_user
export DB_PASSWORD=your_secret

./mvnw spring-boot:run -Dspring-boot.run.profiles=oracle
```

The Oracle profile sets `ddl-auto=none` — Hibernate does not create or migrate schema. Ensure tables exist before starting.

## Build a runnable JAR

```bash
./mvnw package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=local
```

## Try the API

With the server running (`local` profile):

```bash
# List queries
curl -s http://localhost:8080/api/queries | jq

# Create a category
curl -s -X POST http://localhost:8080/api/categories \
  -H 'Content-Type: application/json' \
  -d '{"name":"Compliance","description":"Regulatory checks"}'

# Preview rendered SQL for a query (substitutes {{variables}})
curl -s -X POST http://localhost:8080/api/queries/1/preview \
  -H 'Content-Type: application/json' \
  -d '{"variables":{"startDate":"2024-01-01"}}'
```

Full request/response shapes are documented in Swagger UI or at `/v3/api-docs`. Swagger UI defaults to the **schema** view (field types and validation constraints) via `springdoc.swagger-ui.defaultModelRendering=model` in `application.properties`.

### API surface

| Resource | Base path |
|----------|-----------|
| Queries (CRUD, versions, preview) | `/api/queries` |
| Plans (CRUD) | `/api/plans` |
| Categories (CRUD) | `/api/categories` |

## Regenerate the frontend API client

After changing controllers or DTOs, regenerate TypeScript types for the frontend (requires the backend running on port 8080):

```bash
cd ../frontend && npm run openapi:generate
```

The script fetches the live spec from `http://localhost:8080/v3/api-docs`. Override with `OPENAPI_URL` if needed.

## Project layout

```
src/main/java/com/test/backend/
├── controller/          REST endpoints (queries, plans, categories)
├── service/             Business logic and transactions
├── repository/          Spring Data JPA interfaces
├── entity/              JPA entities (Lombok getters/setters)
├── dto/                 Request/response records (validation annotations)
├── mapper/              MapStruct entity ↔ DTO mappers
└── query/               SQL rendering and {{variable}} substitution
```

## Common tasks

### Add a REST endpoint

1. Add or extend a DTO in `dto/` with Jakarta Validation annotations (`@NotBlank`, `@Size`, etc.).
2. Implement logic in the matching `service/` class.
3. Expose it from the `controller/` class.
4. Run `./mvnw test` and check Swagger UI reflects the new operation.
5. Regenerate the frontend OpenAPI client (see above).

### Add entity ↔ DTO mapping

Add a method to an existing `@Mapper(componentModel = "spring")` interface in `mapper/`, or create a new one. MapStruct generates implementations at compile time — run a build to surface mapping errors:

```bash
./mvnw compile
```

Use `@Mapping` for non-obvious field names. Lombok and MapStruct run together via the `lombok-mapstruct-binding` annotation processor.

### Add a JPA entity

1. Create the class under `entity/` with `@Entity`, `@Getter`, `@Setter`, and `@NoArgsConstructor(access = PROTECTED)`.
2. Add a `repository/` interface extending `JpaRepository`.
3. With the `local` profile, Hibernate creates the table on next startup. For Oracle, apply the DDL manually.

### Work with query versions

Each `PUT /api/queries/{id}` creates a **new immutable version** (incremented `versionNumber`). The query's `currentVersionId` points at the latest version. Use `GET /api/queries/{id}/versions` to list history and `POST /api/queries/{id}/preview` to render SQL with variable substitution.

### Inspect local data

With the `local` profile, open http://localhost:8080/h2-console and connect with:

- **JDBC URL:** `jdbc:h2:mem:dataaudit_metadata`
- **User:** `sa`
- **Password:** *(empty)*

## Configuration reference

| File | Profile | Purpose |
|------|---------|---------|
| `application.properties` | all | App name, `open-in-view=false` |
| `application-local.properties` | `local` | H2 in-memory, H2 console, `create-drop` |
| `application-oracle.properties` | `oracle` | Oracle JDBC via `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` |

Activate a profile with `-Dspring-boot.run.profiles=local` (Maven) or `--spring.profiles.active=local` (JAR).


cd frontend && npm run openapi:generate