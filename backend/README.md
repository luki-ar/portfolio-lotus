# Backend – API REST del portfolio LOTUS

Node.js + Express + PostgreSQL (Supabase) con el driver `pg`.

## Puesta en marcha

1. **Base de datos**: en Supabase abrí *SQL Editor*, pegá el contenido de [`db/schema.sql`](db/schema.sql) y ejecutalo.
2. **Variables de entorno**: copiá `.env.example` como `.env` y completá `DATABASE_URL`
   (Supabase → *Connect* → *Session pooler* → URI).
3. **Instalar y levantar**:

   ```bash
   cd backend
   npm install
   npm run dev        # o: npm start
   ```

4. Verificá en el navegador: <http://localhost:4000/api/health> → `{"api":"ok","db":"ok"}`
5. En otra terminal, desde la raíz del proyecto: `npm start` (frontend en el puerto 3000).

## Endpoints

| Método | Ruta                    | Descripción                                             | Respuestas      |
| ------ | ----------------------- | ------------------------------------------------------- | --------------- |
| GET    | `/api/health`           | Estado de la API y de la conexión a la base             | 200, 503        |
| GET    | `/api/proyectos`        | Lista proyectos con sus tecnologías                     | 200             |
| GET    | `/api/proyectos/:id`    | Un proyecto                                             | 200, 400, 404   |
| POST   | `/api/proyectos`        | Crea un proyecto (+ tecnologías nuevas si no existen)   | 201, 400        |
| DELETE | `/api/proyectos/:id`    | Borra un proyecto (sus relaciones se borran en cascada) | 204, 400, 404   |
| GET    | `/api/tecnologias`        | Lista tecnologías y en cuántos proyectos se usan            | 200             |
| POST   | `/api/tecnologias`        | Crea una tecnología                                         | 201, 400, 409   |
| DELETE | `/api/tecnologias/:id`    | Borra una tecnología **solo si ningún proyecto la usa**     | 204, 404, 409   |
| GET    | `/api/demos`              | Lista las demos interactivas con su proyecto vinculado      | 200             |
| POST   | `/api/demos`              | Crea una demo (`titulo`, `url_demo`, `proyecto_id`)         | 201, 400        |
| DELETE | `/api/demos/:id`          | Borra una demo                                              | 204, 404        |
| GET    | `/api/servicios`          | Lista los servicios ofertados                               | 200             |
| POST   | `/api/servicios`          | Crea un servicio ofertado (`nombre`, `categoria`, `precio_desde`) | 201, 400  |
| PATCH  | `/api/servicios/:id/estado` | Activa o pausa un servicio ofertado                       | 200, 404        |
| DELETE | `/api/servicios/:id`      | Borra un servicio ofertado                                  | 204, 404        |
| GET    | `/api/usuarios?rol=...`   | Lista usuarios registrados (filtro parametrizado por rol)   | 200, 400        |
| POST   | `/api/usuarios`           | Registra una cuenta de usuario (`nombre`, `email`, `rol`)   | 201, 400, 409   |
| PATCH  | `/api/usuarios/:id/estado`| Activa o suspende un usuario                                | 200, 404        |
| DELETE | `/api/usuarios/:id`       | Elimina un usuario                                          | 204, 404        |
| GET    | `/api/metricas?dias=7&seccion=todas` | Contadores de visitas + datos parametrizados para gráficos | 200, 400 |
| POST   | `/api/metricas/visita`    | Registra una visita (`tipo`: `'general'` o `'autenticado'`) | 201, 400        |

Ejemplo de body para `POST /api/proyectos`:

```json
{
  "titulo": "Portfolio LOTUS",
  "tecnologias": ["React", "Express", "PostgreSQL"],
  "estado": "En proceso"
}
```

`tecnologias` también acepta un string separado por comas (`"React, Express"`).
`estado` es opcional: `Nuevo Avance` (por defecto), `En proceso` o `Deployado`.

## Estructura

```text
backend/
├── db/schema.sql              # DDL + datos de ejemplo
└── src/
    ├── server.js              # Punto de entrada (lee .env y escucha el puerto)
    ├── app.js                 # Configuración de Express (middlewares y rutas)
    ├── config/db.js           # Pool de conexiones + helper de transacciones
    ├── routes/                # Mapeo URL → controlador
    ├── controllers/           # Validación y respuestas HTTP (lógica de negocio)
    ├── models/                # Consultas SQL parametrizadas (acceso a datos)
    ├── middlewares/           # Manejo centralizado de errores
    └── utils/http.js          # HttpError, parseId, asyncHandler
```
