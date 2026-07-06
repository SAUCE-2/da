# Data Audit MVP Plans

## Purpose

These files define a staged plan for a customised SQL audit query store and executor with a Java Spring Boot backend and a TanStack Router frontend. The app stores reusable SQL audit queries, organises them, and will run them against configured Oracle databases.

## Requested Stack

- Backend: Java `25`, Spring Boot `4.1.0`, Maven, jar packaging.
- Backend coordinates: group `com.test`, artifact `backend`, package `com.test.backend`.
- Backend patterns: JPA for metadata, Spring MVC REST controllers, service layer for business logic.
- Config: `application.properties` plus profile-specific properties.
- Metadata database: H2 for local development, Oracle for deployed metadata storage.
- Target audit databases: Oracle, selected at run time once connection setup exists.
- Frontend: React, TypeScript, Vite, TanStack Router.

## Plan Sequence

1. [Plan 00: Documentation Discovery](00-documentation-discovery.md)
2. [Plan 01: Project Setup And Config](01-project-setup-and-config.md)
3. [Plan 01.5: Route Metadata Navigation](01.5-route-metadata-navigation.md)
4. [Plan 02: Audit Queries And Categories](02-audit-queries-and-categories.md)
5. [Plan 02.5: Product Framing And Misconceptions](02.5-product-framing-and-misconceptions.md)
6. [Plan 02.6: Query Versioning And Variables](02.6-query-versioning-and-variables.md)
7. [Plan 03: Environments And Projects](03-environments-and-projects.md)
8. [Plan 04: Plans And Execution](04-suites-and-execution.md)
9. [Plan 05: Overrides And Scheduled Runs](05-overrides-and-scheduled-runs.md)
10. [Plan 06: Verification And Hardening](06-verification-and-hardening.md)

## Frontend Conventions

- [Frontend UI Conventions](frontend-ui-conventions.md)

## Context Reference

- [Runtime And Variable Context](runtime-and-variable-context.md)

## Domain Summary

- **Query:** a reusable, versioned SQL audit definition made from toggleable ordered sections and variables.
- **Category:** a way to organize queries; one query can belong to many categories.
- **Plan:** an ordered pipeline of queries that can be run together.
- **Plan run:** one execution of a plan.
- **Query run:** one execution of a single query.
