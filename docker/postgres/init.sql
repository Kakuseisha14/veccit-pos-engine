-- veccit-pos-engine: PostgreSQL base initialization
-- Ejecutado automaticamente por el contenedor de Docker en su primer arranque.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Base de datos de integracion (e2e). Se crea en el primer arranque para que
-- las pruebas reales no compartan la base de datos de desarrollo.
CREATE DATABASE veccit_pos_test;