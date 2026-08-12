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

## C. Seguridad y Despliegue (Prometido por `docs/arquitectura_maestra.md`)

- [ ] Migración **RLS** de PostgreSQL: `ENABLE ROW LEVEL SECURITY` + `CREATE POLICY` por `tenant_id` en tablas de negocio.
- [ ] `helmet` + rate limiting (`@nestjs/throttler`) + protección CSRF básica.
- [ ] `CORS_ORIGIN` agregado al `.env.example`.
- [ ] `Dockerfile` de la API + servicio API en `docker-compose.yml` (hoy solo levanta la BD).
- [ ] `.env.production` y script/documento de despliegue (`migration:run` en producción).

## D. Calidad y Cobertura de Pruebas (Cero Deuda Técnica)

- [ ] Backend e2e contra **PostgreSQL real**: checkout mixto USD/VES con **rollback ACID** forzado, void con reposición de stock, avatar **404 cross-tenant**.
- [ ] Backend: test unitario que verifique que `TENANT_ADMIN` no puede crear `SUPER_ADMIN`.
- [ ] Tests frontend (vitest/jest): cálculos del carrito y pagos mixtos.
- [ ] Validación client-side en **login/registro** (`required`, email, contraseña ≥ 8).

## E. Limpieza UI/UX y Restos de TailAdmin

- [ ] Eliminar o hacer funcional la **barra de búsqueda del header** (hoy muerta).
- [ ] Páginas 404 en **español** y sin marca TailAdmin (`not-found.tsx`, `error-404/page.tsx`, footer "© TailAdmin").
- [ ] Reemplazar READMEs de backend/frontend (hoy template por defecto).
- [ ] Limpiar deps/assets/iconos demo sin uso (`@fullcalendar/*`, `swiper`, `react-dnd`, `react-dropzone`, imágenes `user-*.jpg`, etc.).
- [ ] **Paginación** en listados (`users`, `products`, `sales`) — evaluar si es necesaria para el MVP.

---

## ✅ Prioridad de ejecución sugerida

1. **B — Sesión/roles** (imprescindible para el modelo "tú registras al cliente").
2. **A — SUPER_ADMIN** (tu panel de gestión de comercios).
3. **D — Pruebas** (cero deuda antes de nuevas features).
4. **C — Seguridad/deploy** (antes de producción).
5. **E — Limpieza** (pulido final).