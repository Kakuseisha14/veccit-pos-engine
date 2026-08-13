# Developer & Agent Guidelines: veccit-pos-engine

## 🚨 Regla Innegociable (Leer la planilla y documentar cada ejecución)
- **ANTES de cualquier ejecución** (comando, módulo, cambio): LEER OBLIGATORIAMENTE `arquitectura_maestra.md` y `docs/plan_de_accion.md` para tener contexto de qué se está haciendo y en qué fase estamos.
- **DESPUÉS de cada ejecución exitosa**: ACTUALIZAR OBLIGATORIAMENTE `docs/manual_de_usuario.md` y mantener la documentación de la API vía **Swagger** (`/api/docs`, decoradores `@nestjs/swagger`).

## Core Mandates & Reference Documents
- **ALWAYS READ AND FOLLOW**: `arquitectura_maestra.md` and `docs/plan_de_accion.md`. All architectural decisions, multi-tenant rules, clean architecture layers, and module roadmap are governed by these two documents.
- **Incremental Module Execution**: Complete each module in Backend (NestJS API) first, then proceed immediately to its Frontend counterpart (Next.js TailAdmin UI) before moving to the next module.

## Repository Layout
- **`backend/`**: NestJS 10+ with Clean Architecture (`domain/`, `application/`, `infrastructure/`, `presentation/`).
- **`frontend/`**: Next.js (App Router / Pages) + TailAdmin Open-Source Template + Tailwind CSS.
- **`docs/`**: Project roadmap and specifications (`plan_de_accion.md`).

## Clean Architecture Rules
- **Domain Layer (`backend/src/domain`)**: MUST NOT depend on NestJS, TypeORM, or any external framework. Contains pure TypeScript entities, value objects, domain exceptions, and repository interfaces.
- **Application Layer (`backend/src/application`)**: Contains Use Cases and Application DTOs.
- **Infrastructure Layer (`backend/src/infrastructure`)**: Implements repository interfaces, TypeORM database entities, PostgreSQL connection, and `TenantContext`.
- **Presentation Layer (`backend/src/presentation`)**: Controllers, Guards, Interceptors, and HTTP DTOs.

## Multi-Tenancy & Security Requirements
- **Tenant Context Isolation**: NEVER perform database queries on tenant-scoped entities without `tenantId`. `tenantId` is extracted from the verified JWT payload and propagated via `AsyncLocalStorage` in `TenantContextInterceptor`.
- **Session Transport**: In production, JWT MUST be transported in HttpOnly, Secure, SameSite=Strict Cookies.
- **RBAC**: Enforce roles strictly:
  - `TENANT_ADMIN`: Access to dashboard, inventory CRUD, rate settings, user management, and invoice voiding.
  - `CASHIER`: Access strictly limited to POS checkout and cash register shift closure.

## Financial & Currency Rules
- **Base Currency**: Internal accounting currency is always **USD** (`DECIMAL(12,2)`).
- **Dynamic Conversion**: Local currency (**VES**) is converted on-the-fly using the active daily exchange rate (`exchange_rates`).
- **Split Payments**: POS sales must be executed inside PostgreSQL ACID transactions (`QueryRunner` / DB Transaction) to ensure stock deduction and multi-currency payments match the sale total.

## Commands & Verification Workflow
- **Backend Verification**:
  - Run typecheck: `npm run typecheck` or `npx tsc --noEmit` inside `backend/`
  - Run linter: `npm run lint` inside `backend/`
- **Frontend Verification**:
  - Run build/typecheck: `npm run build` or `npx tsc --noEmit` inside `frontend/`
- **Sequence for completing any module**:
  `Domain & Use Cases -> Infrastructure Repos & Controller -> Backend Verification -> Frontend View & Integration -> End-to-End Verification`.
