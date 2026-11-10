# LOTUS. — Plataforma Web Full-Stack & Portfolio Profesional

**Asignatura:** Lenguajes IV — Trabajo Final Integrador (Nivel Promoción Directa 2026)  
**Equipo de Desarrollo:** Lucas Colque, Mauricio Navarro, Gabriel Vargas, Pilar Alvarado  

---

## 1. Enlaces de Despliegue en la Nube (Producción)

- **Frontend en Vivo (Vercel):** https://portfolio-lotus.vercel.app/
- **API REST Backend (Render):** https://lotus-backend-api.onrender.com/api/health
- **Repositorio Oficial (GitHub):** https://github.com/luki-ar/portfolio-lotus

---

## 2. Tecnologías, Lenguajes y Librerías Empleadas

### Capa de Presentación (Frontend)
- **Lenguajes:** JavaScript (ES6+), HTML5 Semántico, CSS3 (Variables nativas, Grid, Flexbox, Multi-Layer Glassmorphism).
- **Framework Principal:** **React 19** (`react`, `react-dom`) + **React Router DOM v7** (`react-router-dom`) con protección de rutas por rol (**RBAC**).
- **Estilizado y Diseño UI/UX:** **Tailwind CSS** + sistema de diseño propio **Obsidian Botanical Glassmorphism** (`src/App.css`) + bloque interactivo **`GlassmorphismPortfolioBlock`** (`SKILL1.md`).
- **Ecosistema de Animaciones y Movimiento Cinético:**
  - **GSAP (`gsap` + `ScrollTrigger`):** Revelado progresivo de secciones al hacer scroll y parallax continuo del emblema de Flor de Loto.
  - **Lenis (`lenis`):** Motor de *Smooth Scroll* inercial sincronizado al ticker de `requestAnimationFrame` de GSAP.
  - **Anime.js (`animejs`):** Orquestación de líneas de tiempo de entrada (`anime.timeline`) con física de resorte `spring(1, 80, 10, 0)` y cascadas `anime.stagger()`.
  - **React Bits (`src/components/ReactBitsEffects.jsx`):** Componentes interactivos `SpotlightCard` (refracción radial que sigue el cursor), `BlurText` (revelado óptico palabra por palabra), `ShinyText` (barrido especular metálico) y `AuroraGlassBackground`.
- **Validación Estricta de Formularios:** **Zod** (`src/utils/validaciones.js`) validando los **8 esquemas** del sistema (Login, Registro, Contacto, Proyectos, Demos, Servicios, Usuarios Admin y Respuesta de Contacto por Email) más validador de archivos adjuntos (tipo MIME, extensión y límite de 5 MB).
- **Visualización de Datos y Métricas:** **Recharts** (`BarChart` de evolución diaria, `PieChart` de distribución de catálogo 3FN y `BarChart` de visitas por sección).

### Capa de Lógica de Negocio (Backend API REST)
- **Entorno y Framework:** **Node.js** + **Express 4** estructurado bajo el patrón *Routes → Controllers → Models → Middlewares*.
- **Servicio de Correo Electrónico:** **Nodemailer** (`backend/src/utils/mailer.js`) para notificaciones automáticas de nuevas consultas y **envío de respuestas directas por email desde el Panel Admin** (`POST /api/contactos/:id/responder`), con fallback seguro `streamTransport` cuando no se configuran credenciales SMTP externas.
- **Seguridad:** Hash de contraseñas con `crypto.scryptSync`, CORS configurable y validación de parámetros HTTP.

### Capa de Datos (Persistencia Relacional)
- **Motor RDBMS:** **PostgreSQL** alojado en **Supabase Cloud** conectado mediante el driver oficial `pg` (`Pool` con SSL y soporte de transacciones **ACID** `BEGIN / COMMIT / ROLLBACK`).
- **Modelado en 3FN:** 8 tablas normalizadas (`proyectos`, `tecnologias`, `proyecto_tecnologia`, `demos`, `servicios`, `usuarios`, `visitas_log`, `contactos`) con integridad referencial declarativa (`ON DELETE CASCADE`, `ON DELETE RESTRICT`, `ON DELETE SET NULL`) y migraciones idempotentes al arranque (`backend/src/config/migraciones.js`).

---

## 3. Instalación y Ejecución en Entorno Local

### 3.1. Clonar el repositorio
```bash
git clone https://github.com/luki-ar/portfolio-lotus.git
cd portfolio-lotus
```

### 3.2. Ejecutar el Frontend
```bash
npm install
npm start
```
- Abre `http://localhost:3000`. Si no se define un archivo `.env`, podés crear uno con `REACT_APP_API_URL=https://lotus-backend-api.onrender.com/api` para conectarte directamente al backend en la nube, o apuntar a `http://localhost:4000/api` si levantás el backend localmente.

### 3.3. Ejecutar el Backend (Opcional para desarrollo de API)
```bash
cd backend
npm install
npm run dev
```
- Requiere configurar `backend/.env` tomando como plantilla [`backend/.env.example`](backend/.env.example).

### 3.4. Pruebas Automatizadas y Build de Producción
```bash
npm test -- --watchAll=false
npm run build
```

---

## 4. Documentación Técnica Complementaria

- [`MANUAL_ESTILO.md`](MANUAL_ESTILO.md): Anteproyecto de diseño UI/UX, paleta de colores `#HEX`, tipografía, prototipado de vistas, animaciones (GSAP + Lenis + Anime.js + React Bits) y responsividad móvil/desktop.
- [`ARQUITECTURA.md`](ARQUITECTURA.md): Diagrama de arquitectura en 3 capas, diagrama Entidad-Relación (3FN), tabla completa de endpoints CRUD (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) e integración con GitHub REST API.
- [`DESPLIEGUE.md`](DESPLIEGUE.md): Guía paso a paso del despliegue continuo en Vercel, Render y Supabase.
