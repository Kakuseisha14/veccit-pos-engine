# Plan de Acción Detallado: veccit-pos-engine

Este documento detalla la hoja de ruta paso a paso para el desarrollo del software POS Multi-Tenant SaaS. Seguimos una estrategia incremental **Módulo a Módulo (Backend ➡️ Frontend)** para permitir verificación continua e interactiva.

---

## 🗂️ Estrategia del Monorepo

El proyecto está estructurado como un Monorepo con dos aplicaciones principales:

```text
veccit-pos-engine/
├── arquitectura_maestra.md        # Especificaciones de arquitectura
├── AGENTS.md                      # Instrucciones para agentes CLI / AI
├── docs/
│   └── plan_de_accion.md          # Este documento
├── backend/                       # NestJS API (Clean Architecture + PostgreSQL)
└── frontend/                      # Next.js App (TailAdmin UI + Tailwind CSS)
```

---

## 🚀 Fases de Desarrollo e Hitos

### 📍 Fase 0: Setup e Infraestructura Base Monorepo
- [x] Creación de `arquitectura_maestra.md` y `docs/plan_de_accion.md`.
- [x] Definición de reglas de trabajo en `AGENTS.md`.
- [x] Inicialización del backend con NestJS, TypeScript, TypeORM y PostgreSQL.
- [x] Inicialización del frontend con Next.js y plantilla TailAdmin (Open Source).
- [x] Configuración del contenedor Docker / Scripts de PostgreSQL.

---

### 📍 Fase 1: Autenticación, Usuarios y Multi-Tenant (SaaS)
> **Objetivo**: Garantizar el registro de comercios (tenants), creación de usuarios y aislamiento de datos por `tenantId`.

- **Backend (NestJS)**:
  - Entidades de Dominio: `Tenant`, `User`.
  - Módulo `TenantContext` con `AsyncLocalStorage`.
  - Autenticación JWT con transporte en Cookie `HttpOnly`.
  - Guards: `JwtAuthGuard`, `RolesGuard` (`SUPER_ADMIN`, `TENANT_ADMIN`, `CASHIER`), `TenantGuard`.
  - Use Cases: `RegisterTenantUseCase`, `LoginUseCase`, `CreateUserUseCase`.
- **Frontend (Next.js + TailAdmin)**:
  - Pantalla de Login y Registro de Inquilino.
  - Almacenamiento seguro de sesión y redirección según Rol.
  - Layout con contexto activo de Tenant.

---

### 📍 Fase 2: Módulo Multimoneda y Tasa de Cambio
> **Objetivo**: Permitir ingresar la tasa del día (USD ➡️ VES) por inquilino y disponibilizar el cálculo de precios duales.

- **Backend (NestJS)**:
  - Entidad `ExchangeRate` (`tenantId`, `rateVES`, `date`).
  - Use Cases: `SetDailyRateUseCase`, `GetActiveRateUseCase`.
  - Servicio de conversión monetaria `CurrencyConverterService`.
- **Frontend (Next.js + TailAdmin)**:
  - Banner/Widget superior con la tasa activa del día.
  - Modal automático para ingresar/actualizar la tasa al iniciar la jornada.

---

### 📍 Fase 3: Módulo de Inventario (Simplificado)
> **Objetivo**: Catálogo de productos en USD, ajustes manuales de stock y alertas de stock mínimo.

- **Backend (NestJS)**:
  - Entidades: `Product`, `Category`, `StockAdjustment`.
  - Use Cases: `CreateProductUseCase`, `UpdateProductUseCase`, `AdjustStockUseCase`, `GetLowStockAlertsUseCase`.
- **Frontend (Next.js + TailAdmin)**:
  - Tabla de Productos con precio USD / equivalente VES.
  - Indicadores visuales de stock mínimo (Verde/Rojo).
  - Modal de ajuste rápido de stock (Entradas/Salidas con motivo).

---

### 📍 Fase 4: Módulo de Ventas y POS (Punto de Venta)
> **Objetivo**: Interfaz de facturación rápida, gestión rápida de clientes y pagos mixtos con transacciones ACID.

- **Backend (NestJS)**:
  - [x] Entidades: `Customer`, `Sale`, `SaleItem`, `SalePayment`.
  - [x] Use Case: `ProcessSaleUseCase` con transacción ACID (descuento de stock + validación de pagos en USD/VES).
  - [x] Use Case: `QuickRegisterCustomerUseCase`.
- **Frontend (Next.js + TailAdmin)**:
  - [x] Pantalla del POS: Buscador rápido por SKU/código de barras, carrito interactivo con totales duales.
  - [x] Modal de Pagos Mixtos: Cálculo automático del saldo restante en Bolívares.
  - [x] Formulario desplegable para registro expreso de cliente (RIF/Cédula).
  - [x] Historial de ventas y recibo imprimible.

---

### 📍 Fase 5: Módulo de Cierre de Caja (Tesorería Básica)
> **Objetivo**: Control de turnos de cajero, arqueo de caja inicial/final, e historial de recibos con anulación.

- **Backend (NestJS)**:
  - [x] Entidad `CashRegister` (Shift).
  - [x] Use Cases: `OpenCashRegisterUseCase`, `CloseCashRegisterUseCase`, `GetShiftSummaryUseCase`, `VoidSaleUseCase` (exclusivo Admin).
- **Frontend (Next.js + TailAdmin)**:
  - [x] Pantalla de Arqueo y Cuadre de Caja.
  - [x] Tabla de Historial de Ventas del día con botones de reimpresión de recibo y anulación (Admin).

---

### 📍 Fase 6: Dashboard y Métricas de Negocio
> **Objetivo**: Panel visual de alto impacto para el dueño con resumen de ventas, ganancias y gráficos.

- **Backend (NestJS)**:
  - [x] Use Case: `GetDashboardMetricsUseCase` (Ventas totales del día, ganancia bruta USD, producto más vendido, serie de ventas de 7 días).
  - [x] Endpoint `GET /metrics/dashboard` (exclusivo `TENANT_ADMIN`).
- **Frontend (Next.js + TailAdmin)**:
  - [x] Cards de métricas en TailAdmin Dashboard.
  - [x] Gráfico interactivo de ventas de los últimos 7 días.
  - [x] Limpieza de módulos de prueba del menú (calendario, perfil, forms, tables, UI elements, charts demo, ecommerce).

---

### 📍 Fase 7: Usuarios y Avatares (Gestión Completa de Personal)
> **Objetivo**: Completar la gestión de usuarios del tenant: edición de nombre/rol, activación/desactivación con auto-protección y avatares seguros por tenant.

- **Backend (NestJS)**:
  - [x] Campo `avatarUrl` en entidad de dominio `User`, entidad TypeORM y migración `1728000000000-add-users-avatar-url`.
  - [x] Métodos inmutables en `User`: `withName`, `withRole`, `withAvatar`, `activate`, `deactivate`.
  - [x] `IUserRepository.findByTenantAndId` (lookup siempre acotado por tenant).
  - [x] Use Cases: `UpdateUserUseCase` (nombre/rol, valida que no se asigne `SUPER_ADMIN`), `SetUserActiveUseCase` (protege desactivar la propia sesión), `UploadAvatarUseCase` (validación PNG/JPG/WEBP ≤ 7MB) y `GetAvatarUseCase` (servido por tenant).
  - [x] Infraestructura `DiskAvatarStorageService` (carpeta `uploads/avatars/<tenant>/`) con resolución de rutas a prueba de path traversal.
  - [x] Endpoints: `PATCH /users/:id`, `PATCH /users/:id/active`, `PATCH /users/:id/avatar` (multipart), `GET /uploads/avatars/:tenantId/:fileName` (el `avatarUrl` se sirve aislado por tenant, extrae el `userId` del nombre de archivo). `/auth/login` y `/auth/me` devuelven `avatarUrl`.
- **Frontend (Next.js + TailAdmin)**:
  - [x] Página **Usuarios** (`/users`): tabla con avatar, rol y estado; modales de crear/editar; toggle activar/desactivar (botón bloqueado para el propio usuario).
  - [x] Subida de avatar desde el modal de edición con vista previa.
- [x] `UserAvatar` (fetch autenticado del blob + fallback de iniciales) en el dropdown del header, tabla de usuarios y modal de edición.
- [x] Ítem **Usuarios** en el menú lateral visible solo para `TENANT_ADMIN`.
- [x] **Campana de notificaciones reales**: el dropdown del header muestra alertas de stock mínimo (`GET /products/low-stock`) en lugar de los demos de TailAdmin; el badge naranja aparece solo si hay productos bajo el mínimo.

---

### 🌐 Fase 8: Modelo de Roles SaaS y Plataforma (SUPER_ADMIN)
> **Objetivo**: Consolidar el modelo de roles multitenant como SaaS. Solo el dueño (`SUPER_ADMIN`) registra comercios y gestiona sus planes; el registro público se elimina.

- **Backend (NestJS)**:
  - [x] `POST /auth/register-tenant` protegido con `JwtAuthGuard` + `RolesGuard` y `@Roles('SUPER_ADMIN')`; respeta el campo `plan` del DTO (`FREE`/`PRO`, defecto `FREE`).
  - [x] Bootstrap automático del primer `SUPER_ADMIN` (sin tenant) desde `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` (`SuperAdminBootstrapService` via `OnApplicationBootstrap`); `IUserRepository.listByRole`.
  - [x] Entidad `Tenant` con métodos inmutables `withPlan` / `withStatus`; `ITenantRepository.list()` (orden por `createdAt` DESC).
  - [x] Módulo `TenantsManagement`: `GET /tenants` y `PATCH /tenants/:id` (plan / isActive), ambos solo `SUPER_ADMIN`, con `ListTenantsUseCase` / `UpdateTenantUseCase` / `TenantNotFoundException`.
- **Frontend (Next.js + TailAdmin)**:
  - [x] `HOME_BY_ROLE.SUPER_ADMIN = /platform`; ítem **Comercios** en el menú lateral exclusivo del `SUPER_ADMIN` (demo de negocio oculto para la plataforma).
  - [x] Página **Comercios** (`/platform`): tabla con comercio, email, plan (selector `FREE`/`PRO`), estado y activar/desactivar; modal **"Nuevo comercio"** (nombre, razón social, admin, email, teléfono, contraseña y plan).
  - [x] Registro público (`/signup` + `SignUpForm` + enlace en `SignInForm`) **eliminado**; `registerTenant` ya no auto-inicia sesión (la creación la ejecuta el `SUPER_ADMIN` desde el panel).
- **Tests**: `RegisterTenantUseCase` (respeto de plan), `ListTenantsUseCase`, `UpdateTenantUseCase` (plan, estado, no encontrado). **Backend**: typecheck ✅, lint ✅, 139 tests ✅. **Frontend**: lint ✅, tsc ✅, build ✅.

---

### 🔑 Fase 9: Sesión, Cuenta y Acceso por Rol
> **Objetivo**: Cierre de sesión real, cambio de contraseña, edición de los datos del comercio y enrutamiento/guardas por rol (el `CASHIER` no accede al Dashboard).

- **Backend (NestJS)**:
  - [x] `POST /auth/logout` limpia la cookie HttpOnly `access_token`.
  - [x] `PATCH /auth/password` — cambio de contraseña del usuario autenticado (verifica la actual; invalida si no coincide; no exige re-login). Excepción `InvalidCredentialsException` con mensaje personalizable.
  - [x] `PATCH /tenants/me` — edición de nombre/razón social/teléfono del propio comercio (`UpdateTenantProfileUseCase` con `Tenant.withProfile`; registrado antes de `/tenants/:id` para no colisionar).
  - [x] `User.withPasswordHash` (método inmutable).
- **Frontend (Next.js + TailAdmin)**:
  - [x] **Interceptor global 401** en `apiFetch`/`apiFormFetch` → handler registrado por `AuthContext` que limpia la sesión y redirige a `/signin`.
  - [x] `logout` real llama a `POST /auth/logout` antes de limpiar el estado.
  - [x] **RoleGuard** (`allowedRoles`) aplicado por página: Dashboard solo `TENANT_ADMIN`; Comercios solo `SUPER_ADMIN`; POS/Inventario/Ventas/Caja `TENANT_ADMIN`+`CASHIER`; Usuarios solo `TENANT_ADMIN`. `HOME_BY_ROLE.CASHIER = /pos`.
  - [x] Menú lateral con roles por ítem (CASHIER: POS/Ventas/Caja; SUPER_ADMIN: Comercios).
  - [x] Modal **"Cambiar contrasena"** y **"Mi comercio"** (solo `TENANT_ADMIN`) en el dropdown del usuario.
- **Tests**: `ChangePasswordUseCase` (éxito, contraseña incorrecta, usuario inexistente), `UpdateTenantProfileUseCase` (éxito, sin cambios no guarda, no encontrado), logout en `AuthController`. **Backend**: typecheck ✅, lint ✅, 146 tests ✅. **Frontend**: lint ✅, tsc ✅, build ✅.

---

## 🔍 Proceso de Verificación y Cero Deuda Técnica
Al finalizar cada hito:
1. Verificación de compilación TypeScript (`tsc --noEmit`).
2. Linter check (`npm run lint`).
3. Pruebas de integración de la API y verificación del frontend.
