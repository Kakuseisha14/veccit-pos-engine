# Cambios Faltantes — Camino al MVP Final

Documento de trabajo para resolver los pendientes detectados en la auditoría
(frontend + backend + docs). Cada ítem resuelto se marca con `[x]` y se documenta
la ejecución en `docs/manual_de_usuario.md` + Swagger (`/api/docs`).

> Regla innegociable: Backend primero (validado con `tsc --noEmit`, `lint`,
> `npm test`), después su Frontend (validado con `npm run lint` + `npm run build`).
> Al terminar cada fase, actualizar la documentación.

---

## 🎯 Modelo de Roles (Regla del Dueño)

| Rol | Quién lo tiene | Qué puede hacer |
| --- | --- | --- |
| `SUPER_ADMIN` | **Solo el dueño de la plataforma (tú)** | Registrar comercios (tenants) y su `TENANT_ADMIN` inicial, gestionar planes, activar/desactivar comercios, ver el panel del SaaS |
| `TENANT_ADMIN` | El cliente (dueño del comercio) | Gestionar inventario, tasa, ventas, caja y usuarios (**puede crear cajeros y otros `TENANT_ADMIN`**) |
| `CASHIER` | Empleado del comercio | Solo POS y cierre de caja |

**Reglas de negocio innegociables:**
- `TENANT_ADMIN` **NUNCA** puede crear un `SUPER_ADMIN` (el DTO ya lo rechaza — mantener y cubrir con tests).
- El rol `SUPER_ADMIN` solo es visible/asignable por el **dueño de la plataforma**.
- **Flujo de onboarding:** tú registras al cliente (se crea tenant + `TENANT_ADMIN`). El cliente inicia sesión, cambia su contraseña y administra a su personal.

---

## A. Modelo de Roles y Onboarding (SaaS) ✅

- [x] Backend: `POST /auth/register-tenant` restringido a `SUPER_ADMIN` (guards JWT + Roles + `@Roles('SUPER_ADMIN')`).
- [x] Decisión: **eliminar el auto-registro público** (`/signup` + `SignUpForm` + enlace `SignInForm`) — solo `SUPER_ADMIN` crea tenants.
- [x] Backend: respetar el campo `plan` del DTO en `register-tenant.use-case.ts` (default `FREE`).
- [x] Backend: bootstrap del primer `SUPER_ADMIN` vía `SUPER_ADMIN_EMAIL`/`SUPER_ADMIN_PASSWORD` (`SuperAdminBootstrapService`).
- [x] Backend: módulo `TenantsManagement`: `GET /tenants` (listar), `PATCH /tenants/:id` (plan, activo/desactivo) — solo `SUPER_ADMIN`. Entidad `Tenant` con `withPlan`/`withStatus`; `ITenantRepository.list()`.
- [x] Frontend: página `/platform` exclusiva de `SUPER_ADMIN` con tabla de comercios (crear, activar/desactivar, cambiar plan) y modal "Nuevo comercio".
- [x] Frontend: sidebar — ítem **Comercios** solo para `SUPER_ADMIN` (menú de negocio oculto para plataforma).
- [x] Frontend: `ROLE_LABELS` incluye `SUPER_ADMIN` (ya existía en `lib/users`).
- [x] Frontend: `HOME_BY_ROLE` → `SUPER_ADMIN: /platform`.
- [x] Backend verificación: typecheck ✅, lint ✅, **139 tests** ✅ (nuevos: plan respetado, `ListTenants`, `UpdateTenant`).
- [x] Frontend verificación: lint ✅, tsc ✅, **build** ✅ (ruta `/platform`).

## B. Sesión, Cuenta y Acceso del Cliente ✅

- [x] Backend: `POST /auth/logout` que limpia la cookie `access_token`.
- [x] Backend: `PATCH /auth/password` — cambio de contraseña del usuario autenticado (el `TENANT_ADMIN` registrado por ti lo usa al entrar).
- [x] Backend: `PATCH /tenants/me` — edición de datos del comercio/tenant (el `TENANT_ADMIN`).
- [x] Frontend: interceptor global de **401** en `apiFetch`/`apiFormFetch` → limpia sesión y redirige a `/signin`.
- [x] Frontend: gate por rol real (**RoleGuard**): `CASHIER` ya no ve el Dashboard (su home es `/pos`); usuarios solo `TENANT_ADMIN`; plataforma solo `SUPER_ADMIN`.
- [x] Frontend: modal **"Cambiar contrasena"** y **"Mi comercio"** (solo `TENANT_ADMIN`) + cierre de sesión real.
- [x] Backend verificación: typecheck ✅, lint ✅, **146 tests** ✅.
- [x] Frontend verificación: lint ✅, tsc ✅, **build** ✅.

## C. Seguridad y Despliegue (Prometido por `docs/arquitectura_maestra.md`) ✅

- [x] Migración **RLS** de PostgreSQL (`EnableRowLevelSecurity1729000000000`): `ENABLE ROW LEVEL SECURITY` + política `{tabla}_tenant_isolation` por `tenantId` en las **8 tablas de negocio** (`users`, `exchange_rates`, `categories`, `products`, `stock_adjustments`, `customers`, `sales`, `cash_registers`). Aplicada en `veccit_pos` y `veccit_pos_test`.
  - Semántica: si la sesión define `app.current_tenant_id`, solo se ven/escriben filas de ese tenant; si no está definida (login, migraciones, bootstrap), el acceso es libre. Es la **segunda línea de defensa** (el aislamiento primario es el `WHERE tenantId = :tenantId` de los repositorios).
- [x] `helmet` + rate limiting (`@nestjs/throttler`, 100 req/min por IP vía `ThrottlerGuard` global) — e2e smoke test con 429 al exceder el límite.
- [x] **Protección CSRF** (`CsrfOriginMiddleware` global): verificación de `Origin`/`Referer` en mutaciones. En dev acepta `localhost/127.0.0.1`; en producción solo acepta `CORS_ORIGIN`. e2e con 403 ante `Origin` foráneo.
- [x] **Sesión segura**: cookie `access_token` HttpOnly + `SameSite=Strict` + `Secure` controlado por `SESSION_SECURE` (default `true` en producción); `trust proxy` habilitado en producción.
- [x] `CORS_ORIGIN` agregado a `.env.example` y usado en `main.ts` (`app.enableCors`).
- [x] `Dockerfile` multi-stage de la API (`backend/Dockerfile`) + servicio `api` en `docker-compose.yml` con healthcheck de `db` y volumen de `uploads`.
- [x] `.env.production.example` versionado + `.env.production` (ignorado por git) y documentación de despliegue.
- [x] Backend verificación: typecheck ✅, lint ✅, **156 tests unitarios** ✅ + **8 e2e reales** ✅ (5 de calidad ACID + 3 de seguridad).

## D. Calidad y Cobertura de Pruebas (Cero Deuda Técnica) ✅

- [x] Backend e2e contra **PostgreSQL real** (`veccit_pos_test` en el contenedor): checkout mixto USD/VES con **rollback ACID forzado** (item con stock insuficiente revierte el descuento del item previo y no persiste la venta), void con reposición de stock, avatar **404 cross-tenant**. Suite `backend/test/quality.e2e-spec.ts`.
- [x] **Bug corregido en Fase D**: `manager.query` de TypeORM v1.1 devuelve `[rows, rowCount]`, por lo que `decreaseStock`/`increaseStock` nunca detectaban stock insuficiente ni producto inexistente (validaban `result.length !== 0`, siempre `2`). El rollback ACID del e2e lo destapó. Fix en `typeorm-transactional-product.repository.ts` + spec unitario nuevo (5 tests).
- [x] Backend: test unitario que verifica que `TENANT_ADMIN` no puede crear `SUPER_ADMIN` (ya existía en `create-user.use-case.spec.ts` y `update-user.use-case.spec.ts`).
- [x] Tests frontend (**vitest**): `lib/payment.ts` con funciones puras de cálculo del carrito y pagos mixtos (totales en céntimos, conversión VES → USD con tasa, tolerancia de ±2 centavos); `PaymentModal` y `PosView` refactorizados para usar el módulo (elimina lógica duplicada). **12 tests** en `payment.test.ts`.
- [x] Validación client-side en **login**: requerido, email válido y contraseña ≥ 8 en `SignInForm`.
- [x] Backend verificación: typecheck ✅, lint ✅, **151 tests unitarios** ✅ + **5 e2e reales** ✅.
- [x] Frontend verificación: lint ✅, tsc ✅, **vitest 12/12** ✅, **build** ✅ (12 rutas).

## E. Limpieza UI/UX y Restos de TailAdmin

- [x] Eliminada la **barra de búsqueda del header** (muerta): formulario, `inputRef`/`useEffect` de ⌘K y div vacío en `AppHeader.tsx`.
- [x] Páginas 404 en **español** y sin marca TailAdmin (`not-found.tsx`, `error-404/page.tsx`). El footer ya decía "Veccit ERP".
- [x] READMEs de `backend/` y `frontend/` reemplazados (template por defecto → documentación específica del proyecto).
- [x] Deps demo sin uso desinstaladas (28 paquetes): `@fullcalendar/*`, `swiper`, `react-dnd`, `react-dnd-html5-backend`, `react-dropzone`, `flatpickr`, `@react-jvectormap/*`, `@types/react-transition-group`. Eliminado el import CSS de `flatpickr` en `layout.tsx` y los bloques CSS demo (flatpickr/fullcalendar/swiper/jvectormap) de `globals.css` (se conservan los estilos `apexcharts`, usados por `SalesChart`). `@svgr/webpack` se conserva (requerido por `next.config` + imports SVG de `src/icons`).
- [x] **Assets demo eliminados** de `public/images/` (brands, cards, carousels, chats, países, errores, grids, icons, products, tasks, videos y 37 avatares `user-*.jpg`): solo quedan los 7 realmente usados (logos Veccit, 404, grid-01).
- [x] **Paginación evaluada**: NO implementada en el MVP. Los listados (`users`, `products`, `sales`) cargan registros completos del tenant; para comercios pequeños/medianos (<~500 registros) el volumen es manejable. **Decisión documentada**: revisar cuando un tenant supere ~500 registros.
- [x] Backend verificación: intacto (no se tocó en esta fase). Frontend verificación: lint ✔, tsc ✔, **vitest 12/12** ✔, **build** ✔ (10 rutas).

---

## ✅ Prioridad de ejecución sugerida

1. **B — Sesión/roles** (imprescindible para el modelo "tú registras al cliente").
2. **A — SUPER_ADMIN** (tu panel de gestión de comercios).
3. **D — Pruebas** (cero deuda antes de nuevas features).
4. **C — Seguridad/deploy** (antes de producción).
5. **E — Limpieza** (pulido final).