# Data Audit

A Bamboo-style runner for SQL database auditing. Define reusable audit queries, compose them into run plans, and execute them against Oracle database targets (environment + project context).

## What it is

| Concept | Role |
|---------|------|
| **Query** | A versioned SQL audit definition — ordered sections, variables, and rendered SQL |
| **Plan** | An ordered pipeline of queries with per-step variable bindings |
| **Environment** | Database target (dev, test, preprod, prod) |
| **Project** | Oracle user/schema to run as on that environment |
| **Query run** | One execution of a single query against a target |
| **Plan run** | One execution of a plan against a target |

This is not a passive metadata catalog. The product goal is to **store, organize, and automate** SQL audit queries against live databases.

## Stack

- **Backend:** Java 25, Spring Boot 4.1, JPA, H2 (local) / Oracle (deployed metadata)
- **Frontend:** React, TypeScript, Vite, TanStack Router & Query

## Development

```bash
# Backend (port 8080)
cd backend && ./mvnw spring-boot:run

# Frontend (port 5173, proxies /api)
cd frontend && npm install && npm run dev
```

## Plans

Implementation is staged in [`plans/README.md`](plans/README.md).
