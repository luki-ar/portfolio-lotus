# Guía de Despliegue en la Nube (DevOps — Vercel + Render + Supabase)

Esta guía documenta el flujo de despliegue a producción del sistema **LOTUS**, estructurado bajo el protocolo de 5 fases (*Prepare → Backup → Deploy → Verify → Rollback*) de ingeniería DevOps, manteniendo la arquitectura en 3 capas conectada a **PostgreSQL (Supabase)**.

---

## 1. Arquitectura de Puertos y Entornos

| Capa | Entorno Local (`localhost`) | Entorno Cloud (Producción) | Archivo de Configuración |
| :--- | :--- | :--- | :--- |
| **1. Presentación (Frontend React SPA)** | `http://localhost:3000` | **Vercel** (`https://<tu-proyecto>.vercel.app`) | [`vercel.json`](vercel.json) + [`.env.example`](.env.example) |
| **2. Lógica de Negocio (Backend Express)** | `http://localhost:4000/api` (`process.env.PORT \|\| 4000`) | **Render** (`https://lotus-backend-api.onrender.com/api`) | [`render.yaml`](render.yaml) + [`backend/.env.example`](backend/.env.example) |
| **3. Datos (PostgreSQL 3FN)** | Puerto `5432` (Session Pooler IPv4) | **Supabase Cloud** (`aws-0-...pooler.supabase.com:5432`) | [`backend/db/schema.sql`](backend/db/schema.sql) |

---

## 2. Fase 1: Preparación y Subida a GitHub

Ejecutá estos comandos en la raíz del proyecto (`tp10`) para verificar la compilación limpia y subir el código a GitHub:

```bash
# 1. Verificar compilación de producción del Frontend
npm run build

# 2. Verificar sintaxis del punto de entrada del Backend
node -c backend/src/server.js

# 3. Inicializar y subir a GitHub (si aún no está vinculado)
git init
git add .
git commit -m "feat: release final LOTUS full-stack con RBAC, Recharts y Anime.js"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
git push -u origin main
```

*(Nota: Los archivos `.gitignore` en la raíz y en `backend/` protegen automáticamente los archivos `.env` y `node_modules` para que tus credenciales nunca se suban al repositorio).*

---

## 3. Fase 2: Despliegue del Backend (Node.js/Express) en Render

El proyecto incluye el blueprint [`render.yaml`](render.yaml) y los scripts de producción en [`backend/package.json`](backend/package.json) (`"start": "node src/server.js"`).

### Configuración en el Dashboard de Render ([render.com](https://render.com)):
1. Seleccioná **New + → Web Service** y conectá tu repositorio de GitHub.
2. Completá los parámetros del servicio:
   - **Name:** `lotus-backend-api`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. En **Environment Variables**, cargá las variables de producción (basadas en [`backend/.env.example`](backend/.env.example)):

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://postgres.<tu-ref>:<tu-password>@aws-0-us-east-1.pooler.supabase.com:5432/postgres
DATABASE_SSL=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-correo@gmail.com
SMTP_PASS=tu-password-de-aplicacion
```

4. Hacé clic en **Create Web Service**. Render asignará dinámicamente el puerto interno mediante `process.env.PORT` y publicará tu API en una URL HTTPS como:
   `https://lotus-backend-api.onrender.com`

---

## 4. Fase 3: Despliegue del Frontend (React 19 SPA) en Vercel

El proyecto incluye [`vercel.json`](vercel.json) con la regla de *SPA Rewrite* (`"source": "/(.*)", "destination": "/index.html"`) para que todas las rutas de React Router (`/perfil`, `/repositorios`, `/contacto`, `/gestion`, `/dashboard`) funcionen al recargar la página sin devolver `404`.

### Configuración en el Dashboard de Vercel ([vercel.com](https://vercel.com)):
1. Seleccioná **Add New... → Project** e importá tu repositorio de GitHub.
2. Configurá los parámetros de compilación:
   - **Framework Preset:** `Create React App`
   - **Root Directory:** `./` *(raíz del proyecto)*
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
3. En **Environment Variables**, agregá la variable que apunta a tu Backend en Render (incluyendo `/api` al final):

```env
REACT_APP_API_URL=https://lotus-backend-api.onrender.com/api
```

4. Hacé clic en **Deploy**.

---

## 5. Fase 4 y 5: Verificación Post-Despliegue y Plan de Rollback

1. **Healthcheck de API y Base de Datos (`/api/health`)**:
   - Abrí `https://lotus-backend-api.onrender.com/api/health`.
   - Respuesta esperada (`HTTP 200`): `{"api":"ok","db":"ok"}`.
2. **Verificación de Flujos Críticos en Producción**:
   - **Rutas Públicas**: Navegá a `/`, `/perfil` y `/contacto` en tu dominio `.vercel.app`.
   - **RBAC**: Iniciá sesión con el botón de simulación de **Rol Cliente** (verificá que `/repositorios` se desbloquee y que los links de Admin permanezcan ocultos) y luego con **Rol Administrador** (verificá el acceso a `/gestion` y `/dashboard`).
3. **Estrategia de Rollback Inmediato**:
   - **En Vercel**: Desde la pestaña *Deployments*, hacé clic en el menú `...` del despliegue estable anterior y seleccioná **Instant Rollback**.
   - **En Render**: Desde la pestaña *Events / Deploys*, seleccioná **Rollback to this deploy** sobre el commit previo verificado.
