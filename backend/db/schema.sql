-- =====================================================================
--  Portfolio LOTUS - Esquema de base de datos (PostgreSQL / Supabase)
--  Lenguajes IV - TP10
--
--  Modelo:
--    proyectos (1) ---< proyecto_tecnologia >--- (1) tecnologias
--
--  Un proyecto usa muchas tecnologías y una tecnología puede usarse en
--  muchos proyectos  =>  relación N:M resuelta con una tabla intermedia.
-- =====================================================================

-- Descomentar para re-ejecutar el script desde cero (BORRA LOS DATOS):
-- DROP TABLE IF EXISTS proyecto_tecnologia, proyectos, tecnologias CASCADE;

-- ---------------------------------------------------------------------
-- Tabla: tecnologias (catálogo)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tecnologias (
    id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre     VARCHAR(50)  NOT NULL,
    creado_en  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT chk_tecnologias_nombre_no_vacio CHECK (char_length(btrim(nombre)) > 0)
);

-- Unicidad sin distinguir mayúsculas: "React" y "react" son la misma tecnología.
CREATE UNIQUE INDEX IF NOT EXISTS uq_tecnologias_nombre_ci
    ON tecnologias (lower(nombre));

-- ---------------------------------------------------------------------
-- Tabla: proyectos
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proyectos (
    id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo       VARCHAR(120) NOT NULL,
    descripcion  TEXT,
    estado       VARCHAR(20)  NOT NULL DEFAULT 'Nuevo Avance',
    creado_en    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT chk_proyectos_titulo_no_vacio CHECK (char_length(btrim(titulo)) > 0),
    CONSTRAINT chk_proyectos_estado CHECK (estado IN ('Nuevo Avance', 'En proceso', 'Deployado'))
);

-- ---------------------------------------------------------------------
-- Tabla intermedia: proyecto_tecnologia (relación N:M)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proyecto_tecnologia (
    proyecto_id    INTEGER NOT NULL,
    tecnologia_id  INTEGER NOT NULL,

    -- PK compuesta: impide asociar dos veces la misma tecnología a un proyecto.
    CONSTRAINT pk_proyecto_tecnologia PRIMARY KEY (proyecto_id, tecnologia_id),

    -- Si se borra un proyecto, se borran sus asociaciones (no quedan filas huérfanas).
    CONSTRAINT fk_pt_proyecto FOREIGN KEY (proyecto_id)
        REFERENCES proyectos (id) ON DELETE CASCADE,

    -- No se puede borrar una tecnología mientras algún proyecto la use.
    CONSTRAINT fk_pt_tecnologia FOREIGN KEY (tecnologia_id)
        REFERENCES tecnologias (id) ON DELETE RESTRICT
);

-- La PK ya indexa (proyecto_id, ...). Este índice acelera las búsquedas
-- por tecnología y la verificación de la FK al borrar una tecnología.
CREATE INDEX IF NOT EXISTS idx_pt_tecnologia ON proyecto_tecnologia (tecnologia_id);

-- ---------------------------------------------------------------------
-- Seguridad (Supabase)
-- Activar RLS sin políticas bloquea el acceso directo desde la API pública
-- de Supabase (anon key). El backend se conecta como dueño de las tablas
-- (rol postgres), por lo que no se ve afectado: el único camino a los datos
-- es la capa de lógica (Express).
-- ---------------------------------------------------------------------
ALTER TABLE tecnologias         ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyecto_tecnologia ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- Datos de ejemplo (los mismos que tenía el mock del frontend)
-- ---------------------------------------------------------------------
INSERT INTO tecnologias (nombre)
SELECT v.nombre
FROM (VALUES ('React'), ('Node'), ('Postgres'), ('Python'), ('Django')) AS v(nombre)
WHERE NOT EXISTS (SELECT 1 FROM tecnologias t WHERE lower(t.nombre) = lower(v.nombre));

INSERT INTO proyectos (titulo, estado)
SELECT v.titulo, v.estado
FROM (VALUES
    ('E-Commerce Premium',      'Deployado'),
    ('Plataforma Inmobiliaria', 'En proceso')
) AS v(titulo, estado)
WHERE NOT EXISTS (SELECT 1 FROM proyectos p WHERE p.titulo = v.titulo);

INSERT INTO proyecto_tecnologia (proyecto_id, tecnologia_id)
SELECT p.id, t.id
FROM (VALUES
    ('E-Commerce Premium',      'React'),
    ('E-Commerce Premium',      'Node'),
    ('E-Commerce Premium',      'Postgres'),
    ('Plataforma Inmobiliaria', 'Python'),
    ('Plataforma Inmobiliaria', 'Django')
) AS v(titulo, tecnologia)
JOIN proyectos   p ON p.titulo = v.titulo
JOIN tecnologias t ON lower(t.nombre) = lower(v.tecnologia)
ON CONFLICT DO NOTHING;

-- =====================================================================
--  EXTENSIÓN ROL ADMINISTRADOR: Demos, Servicios, Usuarios y Visitas
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tabla: demos (vinculada opcionalmente a un proyecto con FK)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS demos (
    id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo       VARCHAR(120) NOT NULL,
    descripcion  TEXT,
    url_demo     VARCHAR(255) NOT NULL,
    proyecto_id  INTEGER,
    creado_en    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT chk_demos_titulo_no_vacio CHECK (char_length(btrim(titulo)) > 0),
    CONSTRAINT chk_demos_url_no_vacia    CHECK (char_length(btrim(url_demo)) > 0),
    -- Si se elimina el proyecto asociado, la demo se conserva con proyecto_id = NULL
    CONSTRAINT fk_demos_proyecto FOREIGN KEY (proyecto_id)
        REFERENCES proyectos (id) ON DELETE SET NULL
);

-- ---------------------------------------------------------------------
-- 2. Tabla: servicios (Servicios ofertados por el equipo)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS servicios (
    id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre        VARCHAR(120)   NOT NULL,
    descripcion   TEXT           NOT NULL,
    categoria     VARCHAR(60)    NOT NULL DEFAULT 'Desarrollo Web',
    precio_desde  NUMERIC(10, 2) NOT NULL DEFAULT 0,
    activo        BOOLEAN        NOT NULL DEFAULT true,
    creado_en     TIMESTAMPTZ    NOT NULL DEFAULT now(),
    CONSTRAINT chk_servicios_nombre_no_vacio CHECK (char_length(btrim(nombre)) > 0),
    CONSTRAINT chk_servicios_precio_positivo CHECK (precio_desde >= 0)
);

-- ---------------------------------------------------------------------
-- 3. Tabla: usuarios (Usuarios registrados en la plataforma)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    email          VARCHAR(150) NOT NULL,
    rol            VARCHAR(30)  NOT NULL DEFAULT 'Cliente',
    activo         BOOLEAN      NOT NULL DEFAULT true,
    ultimo_acceso  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    creado_en      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT chk_usuarios_nombre_no_vacio CHECK (char_length(btrim(nombre)) > 0),
    CONSTRAINT chk_usuarios_email_no_vacio  CHECK (char_length(btrim(email)) > 0),
    CONSTRAINT chk_usuarios_rol CHECK (rol IN ('Administrador', 'Cliente', 'Colaborador', 'admin', 'cliente'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_usuarios_email_ci
    ON usuarios (lower(email));

-- ---------------------------------------------------------------------
-- 4. Tabla: visitas_log (Métricas y contadores de tráfico)
--    Registra tanto visitas generales ('general') como accesos de
--    usuarios registrados/autenticados ('autenticado').
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visitas_log (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tipo        VARCHAR(20) NOT NULL DEFAULT 'general',
    seccion     VARCHAR(60) NOT NULL DEFAULT 'inicio',
    usuario_id  INTEGER,
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_visitas_tipo CHECK (tipo IN ('general', 'autenticado')),
    CONSTRAINT fk_visitas_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_visitas_tipo_fecha ON visitas_log (tipo, creado_en);
CREATE INDEX IF NOT EXISTS idx_visitas_seccion    ON visitas_log (seccion);

-- RLS para las nuevas tablas
ALTER TABLE demos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios   ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios    ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitas_log ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- Datos iniciales (idempotentes) para Demos, Servicios, Usuarios y Visitas
-- ---------------------------------------------------------------------
INSERT INTO demos (titulo, descripcion, url_demo, proyecto_id)
SELECT v.titulo, v.descripcion, v.url_demo, p.id
FROM (VALUES
    ('Demo Interactiva E-Commerce',  ' Flujo completo de carrito, pasarela y panel de stock en vivo.', 'https://github.com/luki-ar', 'E-Commerce Premium'),
    ('Recorrido Virtual Inmobiliario', 'Mapa interactivo con filtros dinámicos por zona y presupuesto.', 'https://github.com/luki-ar', 'Plataforma Inmobiliaria')
) AS v(titulo, descripcion, url_demo, proyecto_titulo)
LEFT JOIN proyectos p ON p.titulo = v.proyecto_titulo
WHERE NOT EXISTS (SELECT 1 FROM demos d WHERE d.titulo = v.titulo);

INSERT INTO servicios (nombre, descripcion, categoria, precio_desde, activo)
SELECT v.nombre, v.descripcion, v.categoria, v.precio_desde, v.activo
FROM (VALUES
    ('Diseño UI/UX & Prototipado en Figma',   'Sistemas de diseño, wireframes y prototipos interactivos de alta fidelidad.', 'Diseño UI/UX',        180.00, true),
    ('Desarrollo Web Full-Stack (SPA + API)', 'Aplicaciones en React conectadas a APIs REST en Node.js y Express.',          'Desarrollo Web',      450.00, true),
    ('Arquitectura de Datos en PostgreSQL',   'Modelado relacional, normalización, seguridad RLS y migración a Supabase.',   'Base de Datos / Cloud', 300.00, true)
) AS v(nombre, descripcion, categoria, precio_desde, activo)
WHERE NOT EXISTS (SELECT 1 FROM servicios s WHERE s.nombre = v.nombre);

INSERT INTO usuarios (nombre, email, rol, activo, ultimo_acceso)
SELECT v.nombre, v.email, v.rol, v.activo, now() - (v.horas_atras || ' hours')::interval
FROM (VALUES
    ('Lucas Colque',     'lucas.colque@lotus.dev',     'Administrador', true,  1),
    ('Mauricio Navarro', 'mauricio.navarro@lotus.dev', 'Administrador', true,  3),
    ('Gabriel Vargas',   'gabriel.vargas@lotus.dev',   'Administrador', true,  6),
    ('Pilar Alvarado',   'pilar.alvarado@lotus.dev',   'Administrador', true, 12),
    ('Sofía Méndez',     'sofia.mendez@empresa.com',   'Cliente',       true, 24),
    ('Martín Gómez',     'martin.gomez@startup.io',    'Cliente',       false, 72)
) AS v(nombre, email, rol, activo, horas_atras)
WHERE NOT EXISTS (SELECT 1 FROM usuarios u WHERE lower(u.email) = lower(v.email));

-- Garantiza que los integrantes del equipo tengan rol Administrador y soporte de contraseña
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
UPDATE usuarios
SET rol = 'Administrador'
WHERE lower(email) IN (
    'lucas.colque@lotus.dev',
    'mauricio.navarro@lotus.dev',
    'gabriel.vargas@lotus.dev',
    'pilar.alvarado@lotus.dev'
);

-- ---------------------------------------------------------------------
-- 5. Tabla: contactos (Formulario de Contacto y Panel de Gestión)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contactos (
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL,
    tipo_consulta   VARCHAR(40)  NOT NULL DEFAULT 'Consulta General',
    asunto          VARCHAR(150) NOT NULL,
    mensaje         TEXT         NOT NULL,
    adjunto_nombre  VARCHAR(180),
    respondido      BOOLEAN      NOT NULL DEFAULT false,
    respondido_en   TIMESTAMPTZ,
    creado_en       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT chk_contactos_nombre_no_vacio  CHECK (char_length(btrim(nombre)) > 0),
    CONSTRAINT chk_contactos_email_no_vacio   CHECK (char_length(btrim(email)) > 0),
    CONSTRAINT chk_contactos_asunto_no_vacio  CHECK (char_length(btrim(asunto)) > 0),
    CONSTRAINT chk_contactos_mensaje_no_vacio CHECK (char_length(btrim(mensaje)) > 0),
    CONSTRAINT chk_contactos_tipo CHECK (
        tipo_consulta IN ('Consulta General', 'Cotización', 'Asesoría Técnica')
    )
);

ALTER TABLE contactos ENABLE ROW LEVEL SECURITY;

-- Migración idempotente: texto de la respuesta enviada por el Administrador vía Nodemailer
ALTER TABLE contactos ADD COLUMN IF NOT EXISTS respuesta TEXT;

INSERT INTO contactos (nombre, email, tipo_consulta, asunto, mensaje, respondido)
SELECT v.nombre, v.email, v.tipo_consulta, v.asunto, v.mensaje, v.respondido
FROM (VALUES
    ('Valeria Quiroga', 'valeria@estudioq.com.ar', 'Cotización',       'Desarrollo de plataforma E-Commerce B2B', 'Hola equipo LOTUS, necesitamos cotizar una SPA en React con catálogo conectado a PostgreSQL y panel de administración.', false),
    ('Diego Fernández', 'dfernandez@fintech.io',   'Asesoría Técnica', 'Migración de base de datos a Supabase',   'Quisiera coordinar una reunión de asesoramiento sobre normalización, claves foráneas y políticas RLS en Supabase.', true)
) AS v(nombre, email, tipo_consulta, asunto, mensaje, respondido)
WHERE NOT EXISTS (SELECT 1 FROM contactos c WHERE c.email = v.email AND c.asunto = v.asunto);

-- Seed de visitas de los últimos 7 días (solo si la tabla está vacía)
INSERT INTO visitas_log (tipo, seccion, usuario_id, creado_en)
SELECT v.tipo,
       v.seccion,
       CASE WHEN v.tipo = 'autenticado' THEN (SELECT id FROM usuarios ORDER BY id LIMIT 1) ELSE NULL END,
       now() - (v.dias_atras || ' days')::interval
FROM (VALUES
    ('general', 'inicio', 6), ('general', 'inicio', 6), ('general', 'repositorios', 6), ('autenticado', 'gestion', 6),
    ('general', 'inicio', 5), ('general', 'demos', 5), ('general', 'servicios', 5), ('autenticado', 'gestion', 5), ('autenticado', 'inicio', 5),
    ('general', 'inicio', 4), ('general', 'inicio', 4), ('general', 'repositorios', 4), ('general', 'servicios', 4), ('autenticado', 'gestion', 4),
    ('general', 'inicio', 3), ('general', 'demos', 3), ('general', 'demos', 3), ('autenticado', 'gestion', 3), ('autenticado', 'repositorios', 3),
    ('general', 'inicio', 2), ('general', 'inicio', 2), ('general', 'servicios', 2), ('general', 'repositorios', 2), ('autenticado', 'gestion', 2), ('autenticado', 'demos', 2),
    ('general', 'inicio', 1), ('general', 'inicio', 1), ('general', 'demos', 1), ('general', 'servicios', 1), ('autenticado', 'gestion', 1), ('autenticado', 'gestion', 1),
    ('general', 'inicio', 0), ('general', 'repositorios', 0), ('general', 'demos', 0), ('autenticado', 'gestion', 0), ('autenticado', 'inicio', 0)
) AS v(tipo, seccion, dias_atras)
WHERE NOT EXISTS (SELECT 1 FROM visitas_log);
