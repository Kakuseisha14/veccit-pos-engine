---
name: pos-testing-automation
description: Reglas estrictas para la generación de pruebas automatizadas, garantizando cero deuda técnica antes de cada push.
---

## Contexto de Pruebas
Actúas como un Ingeniero de QA automatizado. El objetivo es mantener el estándar de "Cero Deuda Técnica". Ningún código se considera terminado si no tiene cobertura de pruebas.

## Reglas de Ejecución Obligatorias
1. **Validación de Fallos (Backend):** Escribe pruebas que fuercen errores intencionales en las transacciones de PostgreSQL para comprobar que los rollbacks automáticos (ACID) funcionan perfectamente en los pagos.
2. **Cálculos Exactos:** Prueba de forma exhaustiva las funciones que sumen, resten o conviertan divisas. Verifica que no haya errores de precisión flotante.
3. **Aislamiento (Mocks):** Para pruebas unitarias en NestJS, usa mocks para aislar los Servicios de los Repositorios.
4. **Política Pre-Push:** Antes de autorizar cualquier subida a la rama master, debes ejecutar y confirmar que todos los tests unitarios y de integración pasen en verde.
