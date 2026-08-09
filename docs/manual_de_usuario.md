# Manual de Usuario: veccit-pos-engine

## 📌 Acerca del Sistema
`veccit-pos-engine` es un sistema Punto de Venta (POS) y Gestión de Inventario **Multi-Tenant en modalidad SaaS** para pequeños y medianos comercios de Venezuela. Cada comercio (tenant) tiene sus datos 100% aislados y puede operar en **USD** y **VES** con conversión en tiempo real.

---

## ⚙️ Requisitos e Instalación

### Requisitos previos
- Node.js 18+ y npm.
- Docker (para PostgreSQL 16) o PostgreSQL local en puerto 5433.

### 1. Base de datos PostgreSQL
```bash
docker compose up -d db
```
- Base de datos: `veccit_pos`
- Usuario/Pass: `postgres` / `postgres` (configurable en `.env`)
- Puerto expuesto: `5433`

### 2. Backend (NestJS API)
```bash
cd backend
npm install
cp .env.example .env      # ya configura PORT=3001
npm run migration:run     # aplica migraciones (tablas tenants & users)
npm run start:dev
```
- API base: `http://localhost:3001/api`
- **Swagger (documentación de la API):** `http://localhost:3001/api/docs`

### 3. Frontend (Next.js + TailAdmin)
```bash
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:3001/api
npm run dev
```
- Aplicación web: `http://localhost:3000`

---

## 🔐 Cómo Usarlo (Funcionalidades de la Fase 1)

> **Fase 1 completada**: Autenticación, Usuarios y Multi-Tenant.

### Registro de un nuevo comercio
1. Ve a **http://localhost:3000/signup**.
2. Completa: Nombre del Comercio, Nombre del Administrador, Correo y Contraseña (mínimo 8 caracteres).
3. Presiona **Registrar Comercio**. Se crean el tenant y su usuario `TENANT_ADMIN`, y la sesión inicia automáticamente.

### Inicio de sesión
1. Ve a **http://localhost:3000/signin**.
2. Ingresa tu correo y contraseña.
3. Según tu rol serás redirigido automáticamente:
   - `TENANT_ADMIN` → panel de administración.
   - `CASHIER` → POS (próximas fases).

### Gestión de usuarios del comercio (solo ADMIN)
- Desde el panel protegido, el `TENANT_ADMIN` puede crear cajeros (`CASHIER`) y listar los usuarios del comercio.

### Tasa del día y precios en Bolívares (Fase 2)
- **Banner superior:** En todas las páginas del panel se muestra la tasa activa del día (USD → VES).
- **Actualizar la tasa:** El `TENANT_ADMIN` puede abrir el modal **"Actualizar tasa"** desde el banner e ingresar cuántos Bolívares equivale 1 Dólar (ej: `60.50`).
- El `CASHIER` solo puede **ver** la tasa activa; no puede modificarla.
- Si no hay tasa para el día, el sistema usa la tasa más reciente como activa.

### Notificaciones y Alertas (Diseño TailAdmin)
- **Alertas Integradas:** Formularios de acceso, registro y edición utilizan el componente nativo `<Alert>` de TailAdmin (`success`, `error`, `warning`, `info`).
- **Sistema Global de Toasts:** Notificaciones flotantes tipo toast en la esquina superior derecha para feedback inmediato en acciones del usuario.

### Roles y permisos
| Rol | Permisos |
| --- | --- |
| `TENANT_ADMIN` | Dashboard, inventario CRUD, tasas de cambio, gestión de usuarios, anulación de facturas |
| `CASHIER` | Solo POS y cierre de caja |

---

## 🧪 Verificación y Calidad (para desarrollo)
- **Backend**: `cd backend` → `npm run lint`, `npx tsc --noEmit`, `npm test`
- **Frontend**: `cd frontend` → `npm run lint`, `npm run build`

## 🔄 Estado por Fase
| Fase | Módulo | Estado |
| --- | --- | --- |
| 0 | Setup e infraestructura | ✅ Completada |
| 1 | Autenticación, Usuarios y Multi-Tenant | ✅ Completada |
| 2 | Multimoneda y Tasa de Cambio | ✅ Completada |
| 3 | Inventario | ⏳ Próxima |
| 4 | Ventas y POS | ⬜ Pendiente |
| 5 | Cierre de Caja | ⬜ Pendiente |
| 6 | Dashboard y Métricas | ⬜ Pendiente |

## 📢 Nota para el Equipo
Este manual debe actualizarse **después de cada ejecución exitosa** junto con la documentación Swagger de la API (ver regla innegociable en `arquitectura_maestra.md`).