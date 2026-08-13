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

## e2e en GitHub Actions (postgres service + teardown)
Las suites `backend/test/*.e2e-spec.ts` requieren PostgreSQL REAL. El job `backend` de `.github/workflows/ci.yml` levanta un servicio `postgres:16-alpine` que debe coincidir EXACTAMENTE con lo que las suites esperan:

- El servicio expone el puerto **`5433`** del runner (`5433:5432`) y expone `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DB`. El job env apunta a `DB_HOST=localhost`, `DB_PORT=5433`, `DB_DATABASE=veccit_pos_test`, `NODE_ENV=test` + credenciales e2e (`JWT_SECRET`, `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`, `UPLOADS_DIR`).
- **NO montar archivos del repo en el servicio de CI (regla crítica):** los service containers de GitHub Actions se arrancan ANTES del paso `actions/checkout`, por lo que `${{ github.workspace }}/docker/postgres/init.sql` NO existe cuando se crea el contenedor → falla el bind-mount y el job muere con `Failed to initialize container postgres:16-alpine. One or more containers failed to start`. La base `veccit_pos_test` se crea en un paso propio del job: `docker exec "${{ job.services.postgres.id }}" createdb -U postgres veccit_pos_test` (el `init.sql` con `CREATE DATABASE veccit_pos_test` solo aplica en Docker local / docker-compose, nunca en CI).
- **Env FORZADO en las suites (regla crítica):** las suites usan `process.env.X = valor` en `beforeAll` para fijar SIEMPRE `DB_PORT=5433`, `DB_DATABASE=veccit_pos_test` y las credenciales e2e (`SUPER_ADMIN_EMAIL=super@test.com`, `SUPER_ADMIN_PASSWORD=superadmin123`). NO usar `??=` ni `||=`: al importar `AppModule`, `ConfigModule.forRoot()` ya cargó el `.env` del repo en `process.env` ANTES de ejecutarse el `beforeAll`, así que `??=` respeta esos valores y el bootstrap crea el super admin con el email del `.env` (login 401 en los tests). Por eso la estrategia es la inversa: el **CI se alinea a los valores que las suites fuerzan** (`5433:5432`, base `veccit_pos_test`, job env idéntico), nunca al revés.
- **Teardown obligatorio (cero colgados de Jest):** toda suite e2e que levante `AppModule` debe cerrar la app con `await app?.close()` en `afterAll`/`afterEach`. Si se usa `beforeEach` para crear una app fresca por test, cada test debe cerrarse en `afterEach`. Esto evita el error `Jest did not exit one second after the test run has completed` por conexiones async sin resolver.
- **Ejecución en serie obligatoria:** el script `test:e2e` usa `jest --runInBand`. Todas las suites e2e comparten la MISMA base (`veccit_pos_test`), y el bootstrap del super admin inserta el mismo email; en workers paralelos dos apps colisionan (`duplicate key UQ_users_email`). NUNCA quitar `--runInBand` de `test:e2e` ni correr las suites con `--maxWorkers > 1` contra la misma DB.
- El `init.sql` del contenedor se aplica solo en el primer arranque del volumen (base local `veccit_pos` y `veccit_pos_test` en Docker local); en CI la base de test la crea el paso `createdb` del job (nunca montar el archivo en el servicio).
