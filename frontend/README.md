# Veccit POS Engine — Frontend (Next.js + TailAdmin)

Interfaz web del sistema Punto de Venta y gestión de inventario multi-tenant.
Construida con **Next.js (App Router)** y el template Open Source **TailAdmin**
sobre **Tailwind CSS**. Consume la API del backend (monorepo).

## Stack

- Next.js 16 + React + TypeScript estricto
- Tailwind CSS + TailAdmin (UI)
- Autenticación por cookie HttpOnly (`credentials: include`)
- Vitest para tests de lógica pura

## Requisitos

- Node.js 20+
- Backend levantado (ver `backend/README.md`) en `http://localhost:3001/api`

## Configuración

Copiar `.env.example` a `.env.local` y ajustar `NEXT_PUBLIC_API_URL`
(por defecto `http://localhost:3001/api`).

## Instalación y ejecución

```bash
npm install
npm run dev       # desarrollo (puerto 3000)
npm run build     # build de producción
npm run start     # servidor de producción
```

## Verificación

```bash
npm run lint      # ESLint
npx tsc --noEmit  # typecheck estricto
npm test          # tests unitarios (vitest)
npm run build     # build de producción
```

## Módulos principales

- `/pos` — Punto de Venta (carrito, pagos mixtos USD/VES, void)
- `/products` — Inventario
- `/sales` — Ventas
- `/users` — Gestión de usuarios del tenant
- `/platform` — Panel SaaS (solo SUPER_ADMIN)
- `/signin`, `/register` — Sesión y onboarding de tenants
