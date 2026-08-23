# Veccit POS & ERP

## Descripción
Veccit POS & ERP es una solución integral de Punto de Venta y Gestión de Recursos Empresariales diseñada bajo un modelo SaaS bimonetario (USD/VES). Desarrollado con **Clean Architecture**, garantiza el aislamiento absoluto de datos entre comercios, integridad transaccional ACID para pagos mixtos y una experiencia de usuario moderna y fluida.

---

## Prerrequisitos
Para ejecutar este proyecto localmente, asegúrese de tener instalado:
- **Node.js** (v20 o superior)
- **Docker** y **Docker Compose**
- **Git**

---

## Instalación
El proyecto está estructurado como un monorepo. Siga estos pasos para instalar las dependencias en ambos entornos:

### Backend
```bash
cd backend
npm install
# IMPORTANTE: Es vital ejecutar el siguiente comando para compilar bcrypt nativamente
npm approve-scripts
```

### Frontend
```bash
cd frontend
npm install
```

---

## Configuración (.env)
Antes de iniciar los motores, debe configurar las variables de entorno del servidor.

1. Copie el archivo de ejemplo:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Edite `backend/.env` y configure obligatoriamente las credenciales del **Super Admin** inicial (`SUPER_ADMIN_EMAIL` y `SUPER_ADMIN_PASSWORD`). Estas credenciales le permitirán acceder al panel de control para crear su primer comercio.

---

## Prevención de Errores (Docker en Linux)
Para evitar que Docker cree directorios con permisos de `root` (lo cual bloquearía la subida de archivos en Linux), es **obligatorio** crear manualmente el directorio de carga antes de iniciar los contenedores:

```bash
mkdir -p backend/uploads
```

---

## Despliegue Rápido (Backend)
Utilice este comando unificado para levantar la infraestructura, ejecutar las migraciones de la base de datos e iniciar el servidor en modo desarrollo:

```bash
docker compose up -d db && \
sleep 5 && \
cd backend && \
npm run migration:run && \
npm run start:dev
```

---

## Verificación
Una vez que el servidor backend esté corriendo, verifique los logs de la terminal para confirmar el éxito del arranque. Debe buscar la siguiente línea generada por el servicio de inicialización automática:

`[SuperAdminBootstrapService] Super admin creado para [tu-email] (sin tenant).`

Si ve este mensaje, el sistema está listo para recibir conexiones y puede proceder a iniciar el frontend con `npm run dev` dentro de la carpeta `frontend/`.
