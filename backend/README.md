# Veccit POS Engine — Backend API

[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)
[![Volver al README principal](https://img.shields.io/badge/README-principal-blue)](../README.md)

API NestJS (Clean Architecture) del sistema Punto de Venta y gestión de inventario
multi-tenant. Es la fuente de verdad del negocio: auth, tenants, inventario, ventas
(POS con pagos mixtos USD/VES en transacciones ACID), cierre de caja, métricas y subida
de avatares.

## Stack

- NestJS 10 + TypeScript estricto
- PostgreSQL + TypeORM (migraciones, Row-Level Security)
- JWT en cookie HttpOnly + `SameSite=Strict` (+ `Secure` en producción)
- Swagger en `/api/docs`

## Estructura (Clean Architecture)

```
src/
├── domain/           # Entidades, value objects y excepciones de negocio (sin frameworks)
├── application/      # Casos de uso y DTOs de aplicación
├── infrastructure/   # Repositorios TypeORM, migraciones, seguridad, storage
└── presentation/     # Controladores HTTP, guards, interceptores y DTOs
```

## Requisitos

- Node.js 20+
- PostgreSQL (recomendado vía `docker compose up -d db` en la raíz del monorepo)

## Configuración

Copiar `.env.example` a `.env` y ajustar (BD, `JWT_SECRET`, `SUPER_ADMIN_EMAIL`/`SUPER_ADMIN_PASSWORD`).

## Instalación y ejecución

```bash
npm install
npm run migration:run   # aplicar migraciones
npm run start:dev       # desarrollo (watch)
npm run start:prod      # producción (requiere build previo)
```

## Verificación

```bash
npm run lint            # ESLint
npx tsc --noEmit        # typecheck estricto
npm test                # tests unitarios (Jest)
npm run test:e2e        # e2e contra PostgreSQL real (requiere veccit_pos_test creada)
```

Los e2e usan la base `veccit_pos_test` en el contenedor `veccit_pos_db` (puerto 5431).
Crearla con:
`docker exec veccit_pos_db createdb -U postgres veccit_pos_test`

## Despliegue

Ver `backend/Dockerfile` (multi-stage) y el servicio `api` en `docker-compose.yml`.
Variables de producción: ver `.env.production.example`.
