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

## 🔍 Proceso de Verificación y Cero Deuda Técnica
Al finalizar cada hito:
1. Verificación de compilación TypeScript (`tsc --noEmit`).
2. Linter check (`npm run lint`).
3. Pruebas de integración de la API y verificación del frontend.
