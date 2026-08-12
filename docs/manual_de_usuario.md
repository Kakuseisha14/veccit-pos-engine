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
npm run migration:run     # aplica migraciones (tenants, users, tasas, inventario, ventas, caja)
npm run start:dev         # en desarrollo ejecuta las migraciones pendientes automáticamente al arrancar
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
- **Control de tasa en el Header:** La tasa activa del día (USD → VES) se muestra como una **píldora integrada** en el Header de TailAdmin, justo al lado del icono de notificaciones (campanita), sin ocupar espacio del contenido.
- **Actualizar la tasa:** El `TENANT_ADMIN` hace clic en la píldora para abrir el modal **"Actualizar tasa"** e ingresar cuántos Bolívares equivale 1 Dólar (ej: `60.50`).
- El `CASHIER` solo puede **ver** la tasa activa; no puede modificarla.
- Si no hay tasa para el día, el sistema usa la tasa más reciente como activa.

### Notificaciones y Alertas (Diseño TailAdmin)
- **Alertas Integradas:** Formularios de acceso, registro y edición utilizan el componente nativo `<Alert>` de TailAdmin (`success`, `error`, `warning`, `info`).
- **Sistema Global de Toasts:** Notificaciones flotantes tipo toast en la esquina superior derecha para feedback inmediato en acciones del usuario.
- Los errores de carga de inventario y de autenticación (credenciales inválidas) se muestran como **toasts** flotantes, sin cajas rojas estáticas en las vistas.

### Módulo de Inventario (Fase 3)
- **Acceso:** En el menú lateral → **Inventario** (`/products`). El `TENANT_ADMIN` tiene control total; el `CASHIER` solo visualiza la lista de productos (sin costos).
- **Segmented control (píldora):** En la parte superior izquierda de la pantalla hay un control segmentado estilo TailAdmin (**Productos** / **Categorías**). El botón activo se resalta con fondo blanco y sombra (`bg-white shadow-card`). Al hacer clic cambia la tabla que se renderiza debajo.
- **Botón contextual:** El botón principal (azul, arriba a la derecha de la tarjeta) es **contextual**: si estás viendo **Productos** muestra **"Agregar producto"**; si estás viendo **Categorías** muestra **"Nueva categoria"**. La cabecera de la tarjeta muestra el **título de la sección** en negrita a la izquierda (`flex justify-between items-center`).
- **Tablas estándar (UI/UX non-negotiable):** Las tablas ocupan el **100% del ancho** (`w-full`), la columna **"Acciones"** es siempre la última y sus botones van en un contenedor `flex items-center gap-2` de flujo natural, con tamaño uniforme y orden **Editar primero**, luego **Inactivar/Activar** (o **Ajustar stock**).
- **Catálogo de productos (USD):** Botón **"Agregar producto"** (en el header de la tarjeta de Productos) para registrar SKU (se normaliza a mayúsculas), nombre, descripción, precio y costo en USD, stock inicial, stock mínimo y categoría. Solo se ofrecen las **categorías activas**.
- **Categorías (CRUD completo):** En la pestaña **Categorías** se listan todas las categorías del comercio en una tabla con estado (Activa/Inactiva) y fecha de creación. Acciones por fila:
  - **Editar:** abre un modal para renombrar la categoría (valida nombre único).
  - **Inactivar/Activar:** cambia el estado de la categoría vía `PATCH /api/categories/:id`.
  - **Nueva categoria:** botón en el header de la tabla para crear (vía `POST /api/categories`).
- **Precios duales:** La tabla muestra el **precio en USD** y su equivalente en **VES** usando la tasa activa del día.
- **Indicadores de stock:** Badge dinámico con la **cantidad** (ej. **"20 unds"**): **verde** si `stock > 10`, **amarillo (warning)** si `0 < stock <= 10`, **rojo (error)** si `stock === 0`. Un banner de advertencia lista los productos bajo el stock mínimo.
- **Ajuste rápido de stock:** Botón **"Ajustar stock"** por producto → modal con Entrada (+)/Salida (-), cantidad y motivo. Las salidas no pueden dejar stock negativo (se rechazan con `InsufficientStockException`).
- **Edición:** Botón **"Editar"** para modificar datos del producto (el stock no se edita aquí, usa el ajuste rápido).
- **Manejo de errores:** Si falla la carga del inventario (productos/categorías), se muestra un **toast de error** flotante en vez de una caja roja estática; los errores de los formularios (crear/editar/ajustar stock/categorías) aparecen dentro del modal correspondiente.

### Módulo de Ventas y POS (Fase 4)
- **Acceso:** En el menú lateral → **POS** (`/pos`) para cobrar y **Ventas** (`/sales`) para el historial. Tanto `TENANT_ADMIN` como `CASHIER` pueden operar el POS y ver las ventas.
- **Buscador rápido:** En el POS se busca un producto escribiendo su **SKU** o **nombre** (búsqueda en vivo). Se muestra el precio en USD y el equivalente en VES con la tasa activa del día; se agrega al carrito con la cantidad deseada.
- **Carrito interactivo:** Lista los productos con cantidades editables y totales **duales** (USD y VES). El total en VES usa la tasa activa del día.
- **Cobrar (Modal de Pagos Mixtos):** El botón **Cobrar** abre el modal de pagos. Se pueden combinar pagos en **USD** y **VES** (Efectivo USD, Efectivo VES, Pago Móvil, Tarjeta VES, Zelle USD, Otro). El saldo restante se recalcula en tiempo real y el cobro se habilita al cubrir el total (tolerancia de ±2 centavos).
- **Cliente rápido:** Desde el carrito se abre el modal **"Registrar cliente"** (RIF/Cédula, nombre y teléfono) para asociar la venta sin salir del POS.
- **Proceso de venta (ACID):** Al confirmar el cobro, el sistema valida que los productos estén activos, descuenta stock y registra la venta con sus pagos en una **única transacción** de base de datos. Se genera un **número de venta** correlativo y la venta queda como `COMPLETED`.
- **Historial de ventas:** En **Ventas** (`/sales`) se listan las ventas del comercio con fecha, número, cliente, total en USD/VES y método de pago. Cada venta muestra su **recibo** con el detalle de items, cantidades y pagos.

### Módulo de Arqueo y Cierre de Caja (Fase 5)
- **Acceso:** En el menú lateral → **Caja** (`/register`). Tanto `TENANT_ADMIN` como `CASHIER` pueden abrir/cerrar su propio turno.
- **Apertura de caja:** Con el botón **"Abrir caja"** se inicia un turno indicando el monto inicial en efectivo (USD). Un cajero solo puede tener **un turno abierto a la vez**; si intenta abrir otro se rechaza con error 409.
- **Vinculación de ventas:** Mientras hay un turno abierto, las ventas realizadas en el POS se **vinculan automáticamente** a ese turno (columna `shiftId`).
- **Resumen del turno:** Cada turno muestra su **Resumen**: cantidad de ventas, total vendido (USD), efectivo esperado (suma de pagos en efectivo USD/VES de ventas no anuladas), desglose de pagos por método y la lista de ventas del turno.
- **Cierre con arqueo:** Con el botón **"Cerrar caja"** el cajero registra el **efectivo contado** al cierre y opcionalmente observaciones. El sistema calcula la **diferencia** contra el efectivo esperado (positiva/sobrante o negativa/faltante). Un turno cerrado no se puede volver a cerrar.
- **Historial de turnos:** Tabla con todos los turnos del comercio: fecha de apertura/cierre, montos y estado (Abierta/Cerrada), con botón **Resumen** por fila.
- **Anulación de ventas (solo ADMIN):** En **Ventas** (`/sales`), el `TENANT_ADMIN` ve el botón **"Anular"** en las ventas completadas. Al anular se registra el motivo, la venta pasa a estado `Anulada` y el **stock de los productos se repone automáticamente** en una transacción ACID. Las ventas anuladas se excluyen del efectivo esperado del turno.

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
| 3 | Inventario | ✅ Completada |
| 4 | Ventas y POS | ✅ Completada |
| 5 | Cierre de Caja | ✅ Completada |
| 6 | Dashboard y Métricas | ⬜ Pendiente |

## 📢 Nota para el Equipo
Este manual debe actualizarse **después de cada ejecución exitosa** junto con la documentación Swagger de la API (ver regla innegociable en `arquitectura_maestra.md`).