// Capa de acceso a datos para "demos".
const { pool } = require('../config/db');

const SELECT_DEMOS = `
  SELECT d.id,
         d.titulo,
         d.descripcion,
         d.url_demo,
         d.proyecto_id,
         p.titulo AS proyecto_titulo,
         d.creado_en
  FROM demos d
  LEFT JOIN proyectos p ON p.id = d.proyecto_id
`;

async function findAll() {
  const { rows } = await pool.query(`${SELECT_DEMOS} ORDER BY d.id DESC`);
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(`${SELECT_DEMOS} WHERE d.id = $1`, [id]);
  return rows[0] || null;
}

async function create({ titulo, descripcion, url_demo, proyecto_id }) {
  const { rows } = await pool.query(
    `INSERT INTO demos (titulo, descripcion, url_demo, proyecto_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [titulo, descripcion || null, url_demo, proyecto_id || null]
  );
  return findById(rows[0].id);
}

async function update(id, { titulo, descripcion, url_demo, proyecto_id }) {
  const { rows } = await pool.query(
    `UPDATE demos
     SET titulo = $2,
         descripcion = $3,
         url_demo = $4,
         proyecto_id = $5
     WHERE id = $1
     RETURNING id`,
    [id, titulo, descripcion || null, url_demo, proyecto_id || null]
  );
  return rows[0] ? findById(rows[0].id) : null;
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM demos WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { findAll, findById, create, update, remove };
