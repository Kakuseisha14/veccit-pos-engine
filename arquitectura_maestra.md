# Arquitectura Maestra: veccit-pos-engine (SaaS Multi-Tenant POS System)

## 📌 Visión General del Proyecto
`veccit-pos-engine` es un sistema Punto de Venta (POS) y Gestión de Inventario Multi-Tenant en modalidad SaaS (Software as a Service), diseñado para pequeños y medianos comercios. 

El sistema garantiza **aislamiento absoluto de datos por cliente (inquilino/tenant)**, **cumplimiento transaccional ACID** para pagos divididos en múltiples divisas (USD / VES) y una **arquitectura limpia por capas (Clean Architecture)** libre de deuda técnica.

---

## 🏗️ Stack Tecnológico y Justificación

### Backend
- **NestJS (Node.js + TypeScript)**: Framework modular basado en inyección de dependencias. Ideal para Clean Architecture y el principio SOLID de Responsabilidad Única.
- **PostgreSQL**: Base de datos relacional con cumplimiento estricto de propiedades ACID (Atomicidad, Consistencia, Aislamiento, Durabilidad). Crítico para transacciones financieras y pagos mixtos/divididos.
- **TypeORM**: ORM relacional con soporte para transacciones y Row-Level Security / Subscripciones Multi-Tenant.
- **JWT + HttpOnly Cookies**: Autenticación segura con almacenamiento de tokens en cookies seguras no accesibles desde JavaScript (protección contra XSS/CSRF).
- **AsyncLocalStorage**: Contexto asíncrono para inyectar de forma transparente el `tenantId` activo en todas las consultas a la base de datos.

### Frontend
- **Next.js (React + TypeScript)**: Framework de React renderizado del lado del servidor/cliente con enrutamiento dinámico y alto rendimiento.
- **TailAdmin (Free Open-Source Template)**: Plantilla moderna basada en Tailwind CSS, libre para comercialización legal.

---

## 🏛️ Arquitectura Limpia por Capas (Clean Architecture)

El backend sigue estrictamente el patrón de diseño Clean Architecture de Robert C. Martin:

```text
backend/src/
├── domain/                      # CAPA 1: DOMINIO (Core del Negocio - 0 dependencias de frameworks)
│   ├── entities/                # Entidades de dominio puras (Product, Sale, CashRegister, Tenant, User)
│   ├── value-objects/           # Money (USD/VES), Identification (RIF/Cédula), SKU
│   ├── exceptions/              # Excepciones de negocio (InsufficientStockException, ShiftClosedException)
│   └── repositories/            # Interfaces abstractas de repositorios (IProductRepository, ISaleRepository)
│
├── application/                 # CAPA 2: APLICACIÓN (Casos de Uso)
│   ├── use-cases/               # Use cases (ProcessSaleUseCase, OpenShiftUseCase, CreateProductUseCase)
│   ├── dtos/                    # DTOs de entrada/salida tipados
│   └── services/                # Interfaces de servicios del sistema (ICurrencyConverter, ITokenService)
│
├── infrastructure/              # CAPA 3: INFRAESTRUCTURA (Detalles de implementación)
│   ├── persistence/            # Entities de TypeORM, Migraciones y Configuración PostgreSQL
│   ├── repositories/            # Implementaciones concretas de repositorios de dominio
│   ├── tenant/                  # TenantContext (AsyncLocalStorage)
│   └── security/                # Estrategias Passport, JWT Hash, Guards
│
└── presentation/                # CAPA 4: PRESENTACIÓN / ADAPTADORES (NestJS Controllers)
    ├── http/
    │   ├── controllers/         # AuthController, POSController, InventoryController, TenantController
    │   ├── guards/              # TenantGuard, JwtAuthGuard, RolesGuard
    │   └── interceptors/        # TenantContextInterceptor
    └── dtos/                    # Request/Response DTOs con class-validator
```

---

## 🔐 Estrategia Multi-Tenant (SaaS) y Seguridad

1. **Estrategia Discriminadora por `tenantId`**:
   - Todas las tablas del negocio incluyen la columna `tenant_id` (UUID) indexada.
   - El `tenantId` proviene **exclusivamente** del JWT verificado en la cookie/cabecera y se inyecta en `AsyncLocalStorage` por el `TenantContextInterceptor`.
2. **Garantía de Aislamiento de Datos**:
   - Los repositorios de la capa de infraestructura concatenan automáticamente la cláusula `WHERE tenant_id = :tenantId` en cada operación CRUD.
   - Se habilita PostgreSQL Row-Level Security (RLS) como segundo nivel de defensa a nivel de motor de BD.
3. **Transporte de Sesión**:
   - Tokens JWT firmados criptográficamente.
   - En producción, el token viaja en Cookie HTTP-Only, `SameSite=Strict`, `Secure`.

---

## 💼 Reglas Financieras y Multimoneda

1. **Moneda Base**: El sistema almacena todos los montos contables (costos, precios, totales) en **USD** (`DECIMAL(12,2)`).
2. **Conversión en Tiempo Real**: Los precios en moneda local (**VES**) se calculan al vuelo multiplicando el monto en USD por la tasa diaria activa del inquilino (`exchange_rates`).
3. **Pagos Divididos/Mixtos**:
   - Un cliente puede pagar una factura combinando múltiples métodos (Ej: $10 en Efectivo USD + El resto en Pago Móvil VES + Tarjeta POS VES).
   - El servidor valida en una **transacción ACID** que la suma total en USD de los pagos cubra el total de la venta antes de descontar inventario y registrar la transacción.

---

## 👥 Roles y Permisos (RBAC Básico)

1. **`SUPER_ADMIN`**: Administrador de la plataforma SaaS (gestiona inquilinos/planes).
2. **`TENANT_ADMIN` (Dueño del Negocio)**:
   - Configura la tasa del día.
   - Gestiona inventario (altas, bajas, costos, ganancias).
   - Administra usuarios y cajeros.
   - Ve métricas y ganancias en el Dashboard.
   - Puede anular facturas.
3. **`CASHIER` (Cajero)**:
   - Acceso exclusivo al POS (Punto de Venta) y apertura/cierre de su propia caja.
   - **No** ve costos, ganancias, ni puede alterar inventario o anular facturas.

---

## 📋 Principios de Trabajo
1. **SOLID Principles**: Responsabilidad única, abierto/cerrado, sustitución de Liskov, segregación de interfaces e inversión de dependencias.
2. **Cero Deuda Técnica**: Todo código debe estar fuertemente tipado en TypeScript y limpio de advertencias o código muerto.
3. **Arquitectura Limpia por Capas**: El dominio nunca debe depender de NestJS ni de TypeORM.
4. **Interfaces Estrictas**: Contratos explícitos entre backend y frontend.
5. **Seguridad Integrada**: Validaciones DTO con `class-validator`, sanitización de datos y aislamiento Multi-Tenant.
