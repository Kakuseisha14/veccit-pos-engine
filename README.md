<div align="center">

<img src="frontend/public/images/logo/VeccitLogo2Sinfondo1.png" alt="Veccit Logo" width="220" />

# 🚀 Veccit POS & ERP Engine
### El Motor SaaS Definitivo para el Comercio Moderno

**Veccit POS & ERP** es un ecosistema Punto de Venta y Gestión de Recursos de grado empresarial. Diseñado con una arquitectura robusta, segura y escalable, permite a las empresas operar en un entorno bimonetario (USD/VES) con precisión quirúrgica y aislamiento total de datos.

---

[Características](#✨-características) • [Stack Tecnológico](#🏗️-stack-tecnológico) • [Capturas](#📸-galería-del-sistema) • [Guía de Instalación](#🚀-guía-de-instalación-rápida) • [Manual de Uso](#📖-manual-de-usuario-esencial)

---

<img src="docs/screenshots/banner.png" alt="Banner del Sistema" width="100%" />

</div>

---

## ✨ Características de Alto Impacto

*   **⚡ Arquitectura Clean (Cero Acoplamiento):** Implementación estricta de Clean Architecture. El núcleo del negocio es puro, independiente de frameworks, facilitando el mantenimiento y la escalabilidad infinita.
*   **🌐 SaaS Multi-Tenant Nativo:** Aislamiento absoluto de datos mediante una estrategia híbrida de `tenantId` y **Row-Level Security (RLS)** a nivel de base de datos PostgreSQL.
*   **💸 Motor Bimonetario Inteligente:** Contabilidad nativa en **USD** con conversión dinámica a **VES**. Soporta pagos mixtos (Múltiples divisas y métodos en una sola transacción) con integridad **ACID**.
*   **🔐 Seguridad de Grado Bancario:** Sesiones seguras mediante cookies `HttpOnly` / `SameSite=Strict`, protección contra CSRF, XSS, y Rate Limiting inteligente.
*   **📦 Gestión de Inventario 360°:** Control de stock, alertas de mínimos, categorías y trazabilidad total de ajustes.
*   **📊 Dashboard de Analítica:** Visualización en tiempo real de ventas, ganancias y KPIs críticos para la toma de decisiones.

---

## 🏗️ Stack Tecnológico

El sistema utiliza las tecnologías más vanguardistas para garantizar rendimiento y estabilidad:

*   **Backend:** [NestJS](https://nestjs.com/) (Node.js + TypeScript), [TypeORM](https://typeorm.io/), [PostgreSQL 16](https://www.postgresql.org/).
*   **Frontend:** [Next.js](https://nextjs.org/) (React + Tailwind CSS), [TailAdmin](https://tailadmin.com/).
*   **DevOps:** [Docker](https://www.docker.com/) & Docker Compose para orquestación de servicios.
*   **Calidad:** [Jest](https://jestjs.io/) & [Vitest](https://vitest.dev/) para cobertura total de pruebas unitarias y E2E.

---

## 📸 Galería del Sistema

Presentamos la interfaz limpia y profesional diseñada para maximizar la productividad:

| **Punto de Venta (POS)** | **Inventario y Stock** |
| :--- | :--- |
| <img src="docs/screenshots/pos.png" width="100%" /> | <img src="docs/screenshots/inventory.png" width="100%" /> |

| **Dashboard Analítico** | **Gestión de Personal** |
| :--- | :--- |
| <img src="docs/screenshots/dashboard.png" width="100%" /> | <img src="docs/screenshots/users.png" width="100%" /> |

| **Control de Acceso** | **Vista Detallada de Métricas** |
| :--- | :--- |
| <img src="docs/screenshots/login.png" width="100%" /> | <img src="docs/screenshots/dashboard2.png" width="100%" /> |

---

## 🚀 Guía de Instalación Rápida

Sigue estos pasos para desplegar tu entorno de desarrollo en minutos:

### 1. Clonar y Preparar
```bash
git clone https://github.com/tu-usuario/veccit-pos-engine.git
cd veccit-pos-engine
```

### 2. Configuración de Entorno
Copia el archivo de ejemplo y configura tus credenciales de **Super Admin**:
```bash
cp backend/.env.example backend/.env
# Edita backend/.env con tus credenciales
```

### 3. Instalación de Dependencias
```bash
# Backend
cd backend && npm install && npm approve-scripts && cd ..
# Frontend
cd frontend && npm install && cd ..
```

### 4. Lanzamiento con Docker
**Importante (Linux):** Crea el directorio de uploads para evitar conflictos de permisos:
```bash
mkdir -p backend/uploads
```

Ejecuta el comando maestro de despliegue:
```bash
docker compose up -d db && sleep 5 && cd backend && npm run migration:run && npm run start:dev
```

---

## 📖 Manual de Usuario Esencial

1.  **Primer Inicio:** Accede a `http://localhost:3000/signin` con el email y password de Super Admin configurados en tu `.env`.
2.  **Creación de Comercio:** Dirígete a la sección de **Comercios** y registra tu primer Tenant. Este paso creará un administrador específico para ese negocio.
3.  **Configuración de Tasa:** Como Administrador del comercio, lo primero es configurar la **Tasa del Día** (USD -> VES).
4.  **Inventario:** Carga tus productos. Recuerda que los precios se definen en USD y el sistema hará la conversión automática.
5.  **Venta:** Accede al POS, selecciona productos y procesa el pago. El sistema permite cobros exactos o mixtos.

---

<div align="center">
Desarrollado con ❤️ por el equipo de Veccit.
</div>
