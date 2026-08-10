---
name: fullstack-pos-architecture
description: Directivas maestras de arquitectura limpia, principios SOLID y testing para el desarrollo Full Stack del POS (Next.js + NestJS + PostgreSQL).
---

## 1. Reglas Globales y Flujo de Trabajo
- **Alineación Obligatoria:** Antes de ejecutar cualquier tarea, es obligatorio leer y usar como base los archivos `docs/plan_de_accion.md` (para mantener el contexto) y `arquitectura_maestra.md` (para respetar las bases del sistema).
- **Orden de Desarrollo Estricto:** El backend dicta las reglas. Siempre se debe terminar, probar y validar el backend (Controladores, Servicios, Repositorios) al 100% antes de escribir o modificar la UI del frontend que lo consume.
- **Documentación Continua:** Al finalizar cualquier fase, se deben documentar los endpoints creados, componentes de UI, casos de uso y flujos implementados.

## 2. Directivas de Backend (NestJS + PostgreSQL)
- **Integridad y Transacciones (ACID):** Los pagos divididos y conversiones de moneda en tiempo real deben hacer rollback automático si ocurre cualquier fallo.
- **Arquitectura Limpia por Capas:** Separación estricta entre Controladores (HTTP), Casos de Uso/Servicios (Lógica de negocio) y Repositorios (Persistencia). Usa inyección de dependencias modular.
- **Tipado Estricto:** TypeScript estricto obligatorio para cálculos financieros, evitando errores de conversión (como concatenaciones accidentales). Todo flujo de entrada/salida (DTOs) debe estar tipado.
- **Seguridad:** Autenticación estricta, protección de rutas y sanitización contra inyecciones SQL. Manejo de sesiones seguras mediante cookies `HttpOnly` para aislar el Multi-Tenant.

## 3. Directivas de Frontend (Next.js + Tailadmin)
- **Renderizado Estratégico:** Prioriza los Server Components de Next.js para rendimiento. Usa Client Components (`"use client"`) estrictamente donde haya interactividad real (formularios de cobro, calculadoras).
- **Componentes Puros:** Separa la lógica de negocio (peticiones a la API, manejo de estado complejo) de las vistas. Las vistas solo deben recibir `props` tipadas y renderizar UI.
- **Estilizado Estricto:** Usa exclusivamente utilidades de Tailwind CSS, respetando la estructura de clases nativa del template Tailadmin.
- **Seguridad en UI:** Sanitiza siempre los inputs de texto en los formularios para prevenir vulnerabilidades XSS.

## 4. Testing y Calidad (Cero Deuda Técnica)
- **Pruebas de Backend:** Los Casos de Uso y la lógica de negocio financiera deben tener pruebas unitarias utilizando Mocks (Jest). Implementar smoke tests e2e básicos para endpoints críticos antes de darlos por completados.
- **Pruebas de Frontend:** Validar el comportamiento esperado de componentes interactivos (ej. cálculos en el carrito, apertura de modales).
- **Calidad de Código:** El código final de cualquier tarea debe entregarse refactorizado, pasando todas las reglas del linter y sin advertencias de compilación de TypeScript (`tsc --noEmit`).
