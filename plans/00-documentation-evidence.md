# Plan 00 Documentation Evidence

Generated on 2026-06-16 for Plan 00. This artifact records confirmed documentation evidence only; it does not create backend or frontend code.

## Backend Baseline

- Spring Boot 4.1 documentation confirms Spring Boot 4.1.0 requires Java 17 or later and is compatible through Java 26, so Java 25 is within the supported range. Maven 3.6.3 or later is explicitly supported.
- Spring Initializr metadata confirms these requested project options are valid: `type=maven-project`, `javaVersion=25`, `packaging=jar`, and dependency IDs `web`, `data-jpa`, `validation`, `h2`, and `oracle`.
- Spring Initializr and Maven Central confirm the final Spring Boot parent coordinate as `4.1.0`.
- A direct Spring Initializr POM request for group `com.test`, artifact `backend`, package `com.test.backend`, Java `25`, Maven, jar packaging, and dependencies `web,data-jpa,validation,h2,oracle` returned a Maven POM with:
  - parent: `org.springframework.boot:spring-boot-starter-parent:4.1.0`
  - property: `<java.version>25</java.version>`
  - application dependencies: `org.springframework.boot:spring-boot-h2console`, `org.springframework.boot:spring-boot-starter-data-jpa`, `org.springframework.boot:spring-boot-starter-validation`, `org.springframework.boot:spring-boot-starter-webmvc`
  - runtime dependencies: `com.h2database:h2`, `com.oracle.database.jdbc:ojdbc11`
  - test dependencies: `org.springframework.boot:spring-boot-starter-data-jpa-test`, `org.springframework.boot:spring-boot-starter-validation-test`, `org.springframework.boot:spring-boot-starter-webmvc-test`
  - plugin: `org.springframework.boot:spring-boot-maven-plugin`
- Caveat: Spring Boot 4.1/Initializr generated `spring-boot-starter-webmvc`, not the older/common `spring-boot-starter-web` name. It also generated granular test starters, not a single `spring-boot-starter-test`, for this dependency set.
- Caveat: the generated POM omitted an explicit `<packaging>jar</packaging>`, which is valid Maven because `jar` is Maven's default packaging. Initializr metadata still confirms `jar` is a supported packaging value.

## Backend API And Persistence Notes

- Spring Boot's servlet web documentation says Spring MVC supports `@Controller` and `@RestController` beans for HTTP requests, with methods mapped through `@RequestMapping` and related annotations. Use JSON REST controllers under `/api`; do not add server-rendered MVC views for this MVP.
- Spring Boot auto-configures Spring MVC and says `@EnableWebMvc` takes over from Boot's MVC auto-configuration, so do not add `@EnableWebMvc` unless intentionally replacing Boot MVC defaults.
- Spring Boot SQL/JPA documentation confirms `spring-boot-starter-data-jpa` is the quick-start dependency for JPA with Hibernate and that Spring Data repositories usually extend `Repository` or `CrudRepository`.
- Use Spring Data JPA only for metadata entities. Do not model arbitrary audited customer tables as JPA entities and do not execute audit SQL through the metadata JPA `EntityManager`.
- Spring Boot validation documentation confirms `spring-boot-starter-validation` typically provides Hibernate Validator and enables `jakarta.validation` method constraints when a Bean Validation implementation is on the classpath. Classes with constrained methods need `@Validated`.

## Configuration And Profiles

- Spring Boot externalized configuration docs confirm `application.properties` files are config data and that profile-specific files use the `application-{profile}.properties` naming convention.
- Profile-specific files override non-profile-specific files, and when multiple profiles are active the last profile wins.
- `spring.profiles.active` can activate profiles, but Spring Boot profiles configure the application itself. In this app, `local` and `oracle` profiles should choose the metadata database configuration only.
- Do not treat the user-facing environment selector as a Spring profile. It chooses the target audit database connection for an audit run, not the application profile.
- Oracle metadata credentials should be supplied through environment-backed placeholders such as `${DB_URL}`, `${DB_USERNAME}`, and `${DB_PASSWORD}`. Do not commit real credentials.

## Database Safety Constraints

- Metadata database: stores application-owned metadata such as environments, projects, audit query definitions, categories, suites, and run history. It can use H2 locally and Oracle when deployed.
- Target audit database: the selected environment/project database where stored SQL audit queries run. This is separate from the metadata database.
- Target audit execution must use JDBC connections selected for the target environment, not the metadata JPA context.
- MVP audit SQL should be constrained to single-statement, read-only queries. Do not allow multi-statement SQL, DML, DDL, stored procedure calls, or committed credentials in properties.
- H2 Oracle compatibility mode is available via a URL such as `jdbc:h2:~/test;MODE=Oracle;DEFAULT_NULL_ORDERING=HIGH` or `SET MODE Oracle`, but H2 compatibility mode is not proof of full Oracle behavior. Use it only for local metadata development compatibility, not as validation of target Oracle audit SQL.
- Oracle JDBC docs confirm Thin driver URL formats such as `jdbc:oracle:thin:@mydbhost:1521/mydbservice`, `jdbc:oracle:thin:@tcp://my-host:1522/my-service`, TNS descriptor URLs, and TNS aliases. The Initializr-generated runtime driver artifact is `com.oracle.database.jdbc:ojdbc11`.

## Frontend Setup Notes

- TanStack Router's React quick start says React projects should use React 18 or later with `createRoot`; TypeScript 5.3 or higher is recommended.
- For Vite file-based routing, install `@tanstack/react-router` as an application dependency and `@tanstack/router-plugin` as a dev dependency. `@tanstack/react-router-devtools` is optional but documented in manual setup.
- The Vite plugin import is `tanstackRouter` from `@tanstack/router-plugin/vite`, and the docs require the TanStack Router plugin to appear before `@vitejs/plugin-react` in the Vite `plugins` array.
- TanStack Router's Vite plugin defaults include `routesDirectory: "./src/routes"` and `generatedRouteTree: "./src/routeTree.gen.ts"`.
- File-based routes export `Route`; ordinary routes use `createFileRoute('/path')`, while the root route uses `createRootRoute()` from `@tanstack/react-router`.
- The route tree file `src/routeTree.gen.ts` is generated and managed by TanStack Router tooling; do not hand-edit it.

## Source URLs

- Spring Initializr metadata: https://start.spring.io/metadata/client
- Spring Initializr POM endpoint used for confirmation: https://start.spring.io/pom.xml?type=maven-project&language=java&bootVersion=4.1.0&groupId=com.test&artifactId=backend&name=backend&description=Data%20audit%20backend&packageName=com.test.backend&packaging=jar&javaVersion=25&dependencies=web,data-jpa,validation,h2,oracle
- Spring Boot 4.1 system requirements: https://docs.spring.io/spring-boot/4.1/system-requirements.html
- Spring Boot 4.1 build systems: https://docs.spring.io/spring-boot/4.1/reference/using/build-systems.html
- Spring Boot 4.1 servlet web applications: https://docs.spring.io/spring-boot/4.0/4.1/reference/web/servlet.html
- Spring Boot 4.1 SQL databases and JPA: https://docs.spring.io/spring-boot/4.1/reference/data/sql.html
- Spring Boot 4.1 externalized configuration: https://docs.spring.io/spring-boot/4.1/reference/features/external-config.html
- Spring Boot 4.1 profiles: https://docs.spring.io/spring-boot/4.1/reference/features/profiles.html
- Spring Boot 4.1 validation: https://docs.spring.io/spring-boot/4.1/reference/io/validation.html
- H2 features and Oracle compatibility mode: https://www.h2database.com/html/features.html
- Oracle JDBC Java API reference and URL formats: https://docs.oracle.com/en/database/oracle/oracle-database/26/jajdb/index.html
- TanStack Router Vite installation: https://tanstack.com/router/latest/docs/installation/with-vite
- TanStack Router React quick start: https://tanstack.com/router/latest/docs/framework/react/quick-start
- TanStack Router routing concepts: https://tanstack.com/router/latest/docs/framework/react/routing/routing-concepts

## Unconfirmed Or Caveated

- Maven Central publishes the Spring Boot 4.1.0 parent as `4.1.0`; using the earlier `4.1.0.RELEASE` Initializr-style value in `pom.xml` fails dependency resolution.
- This artifact confirms setup dependencies and documented APIs only. It does not confirm actual application startup, generated source layout, Maven test execution, or frontend build output because Plan 00 explicitly does not create backend or frontend code.
