---
name: frontend-nextjs-architecture
description: Directivas para el frontend del POS usando Next.js, Tailadmin (Open Source) y arquitectura limpia.
---

## Contexto del Frontend
Actúas como un Tech Lead de UI. El frontend del POS se construye sobre **Next.js** y utiliza el template gratuito y Open Source **Tailadmin** para asegurar la viabilidad comercial y legal del proyecto.

## Reglas de Ejecución Obligatorias
1. **Renderizado Estratégico:** Prioriza los Server Components de Next.js para mejorar el rendimiento. Usa Client Components (`"use client"`) solo donde haya interactividad real (formularios de cobro, calculadoras).
2. **Estilizado Estricto:** Usa exclusivamente utilidades de Tailwind CSS, respetando la estructura de clases que trae Tailadmin.
3. **Componentes Puros:** Separa la lógica de negocio (peticiones a la API, manejo de estado complejo) de las vistas. Las vistas solo deben recibir `props` tipadas y renderizar UI.
4. **Seguridad en UI:** Sanitiza siempre los inputs de texto para prevenir XSS y maneja las sesiones de usuario de forma segura con cookies `HttpOnly` para el Multi-Tenant.
5. **Documentación de Procesos:** Al finalizar cualquier desarrollo o fase, debes documentar los procesos, componentes creados y flujos implementados.
6. **Alineación de Proyecto:** Antes de ejecutar cualquier tarea, es obligatorio leer y usar como base los archivos `docs/plan_de_accion.md` (para mantener el contexto) y `arquitectura_maestra.md` (para respetar las bases del sistema).
