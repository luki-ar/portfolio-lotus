// Capa de acceso a datos para "tecnologias".
const { pool } = require('../config/db');

async function findAll() {
  const { rows } = await pool.query(`
    SELECT t.id,
           t.nombre,
           COUNT(pt.proyecto_id)::int AS cantidad_proyectos
    FROM tecnologias t
    LEFT JOIN proyecto_tecnologia pt ON pt.tecnologia_id = t.id
    GROUP BY t.id
    ORDER BY t.nombre
  `);
  return rows;
}

async function create(nombre) {
  const { rows } = await pool.query(
    'INSERT INTO tecnologias (nombre) VALUES ($1) RETURNING id, nombre',
    [nombre]
  );
  return rows[0];
}

/**
 * Devuelve true si borró algo.
 * Si la tecnología está en uso, PostgreSQL rechaza el DELETE (FK con ON DELETE RESTRICT,
 * código de error 23001) y el middleware de errores responde 409 Conflict.
 */
async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM tecnologias WHERE id = $1', [id]);
  return rowCount > 0;
}

/**
 * Inserta las tecnologías que no existan (sin distinguir mayúsculas) y devuelve
 * los ids de todas. Recibe el `client` de la transacción en curso.
 */
async function upsertMany(client, nombres) {
  if (!nombres || nombres.length === 0) return [];

  // El WHERE NOT EXISTS evita "gastar" ids de la secuencia en nombres que ya existen;
  // el ON CONFLICT cubre el caso de dos requests simultáneos con la misma tecnología.
  await client.query(
    `INSERT INTO tecnologias (nombre)
     SELECT n FROM unnest($1::text[]) AS n
     WHERE NOT EXISTS (SELECT 1 FROM tecnologias t WHERE lower(t.nombre) = lower(n))
     ON CONFLICT ((lower(nombre))) DO NOTHING`,
    [nombres]
  );

  const { rows } = await client.query(
    'SELECT id FROM tecnologias WHERE lower(nombre) = ANY($1::text[])',
    [nombres.map((n) => n.toLowerCase())]
  );
  return rows.map((r) => r.id);
}

module.exports = { findAll, create, remove, upsertMany };
