// Capa de acceso a datos para "proyectos".
// Todas las consultas usan parámetros ($1, $2, ...) => protección contra SQL Injection.
const { pool, withTransaction } = require('../config/db');
const tecnologiaModel = require('./tecnologia.model');

// Devuelve cada proyecto con sus tecnologías agregadas como un array JSON.
const SELECT_PROYECTOS = `
  SELECT p.id,
         p.titulo,
         p.descripcion,
         p.estado,
         p.creado_en,
         COALESCE(
           json_agg(json_build_object('id', t.id, 'nombre', t.nombre) ORDER BY t.nombre)
             FILTER (WHERE t.id IS NOT NULL),
           '[]'::json
         ) AS tecnologias
  FROM proyectos p
  LEFT JOIN proyecto_tecnologia pt ON pt.proyecto_id = p.id
  LEFT JOIN tecnologias t          ON t.id = pt.tecnologia_id
`;

async function findAll() {
  const { rows } = await pool.query(`${SELECT_PROYECTOS} GROUP BY p.id ORDER BY p.id`);
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(`${SELECT_PROYECTOS} WHERE p.id = $1 GROUP BY p.id`, [id]);
  return rows[0] || null;
}

/**
 * Crea un proyecto y sus asociaciones con tecnologías en UNA transacción:
 * o se guarda todo, o no se guarda nada.
 */
async function create({ titulo, descripcion, estado, tecnologias }) {
  const id = await withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO proyectos (titulo, descripcion, estado)
       VALUES ($1, $2, COALESCE($3, 'Nuevo Avance'))
       RETURNING id`,
      [titulo, descripcion || null, estado || null]
    );
    const proyectoId = rows[0].id;

    const tecnologiaIds = await tecnologiaModel.upsertMany(client, tecnologias);
    if (tecnologiaIds.length > 0) {
      await client.query(
        `INSERT INTO proyecto_tecnologia (proyecto_id, tecnologia_id)
         SELECT $1, unnest($2::int[])
         ON CONFLICT DO NOTHING`,
        [proyectoId, tecnologiaIds]
      );
    }
    return proyectoId;
  });

  return findById(id);
}

/** Devuelve true si borró algo. Las filas de proyecto_tecnologia se borran por ON DELETE CASCADE. */
async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM proyectos WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { findAll, findById, create, remove };
