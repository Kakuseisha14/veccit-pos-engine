---
name: backend-pos-architecture
description: Directivas de arquitectura limpia, cero deuda técnica y principios SOLID para el backend del POS en NestJS y PostgreSQL.
---

## Contexto y Justificación (Fase 0)
- **PostgreSQL:** Se exige integridad transaccional (ACID). Los pagos divididos y conversiones en tiempo real deben hacer rollback automático si fallan.
- **TypeScript:** Tipado estricto obligatorio para cálculos financieros, evitando errores de conversión (como concatenaciones accidentales).
- **NestJS:** Arquitectura modular aislando dominios (UsersModule, SalesModule, CurrencyModule) con inyección de dependencias.

## Forma de Trabajar (Spec-Driven Development)
1. **Principios SOLID:** Responsabilidad única por cada módulo y servicio.
2. **Cero Deuda Técnica:** Código refactorizado, validado y documentado desde el día 1.
3. **Arquitectura Limpia por Capas:** Separación estricta entre Controladores, Casos de Uso/Servicios y Repositorios.
4. **Interfaces:** Todo el flujo de entrada y salida de datos (DTOs) debe estar tipado.
5. **Seguridad:** Autenticación estricta, protección de rutas y sanitización contra inyecciones SQL.
6. **Documentación de Procesos:** Al finalizar cualquier desarrollo o fase, debes documentar los endpoints creados, casos de uso y lógica de negocio implementada.
7. **Alineación de Proyecto:** Antes de ejecutar cualquier tarea, es obligatorio leer y usar como base los archivos `docs/plan_de_accion.md` (para mantener el contexto) y `arquitectura_maestra.md` (para respetar las bases del sistema).
