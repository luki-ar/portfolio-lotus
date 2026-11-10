// Capa de acceso a datos para "servicios" (Servicios ofertados).
const { pool } = require('../config/db');

async function findAll() {
  const { rows } = await pool.query(`
    SELECT id,
           nombre,
           descripcion,
           categoria,
           precio_desde::float AS precio_desde,
           activo,
           creado_en
    FROM servicios
    ORDER BY id DESC
  `);
  return rows;
}

async function create({ nombre, descripcion, categoria, precio_desde }) {
  const { rows } = await pool.query(
    `INSERT INTO servicios (nombre, descripcion, categoria, precio_desde, activo)
     VALUES ($1, $2, COALESCE($3, 'Desarrollo Web'), COALESCE($4, 0), true)
     RETURNING id, nombre, descripcion, categoria, precio_desde::float AS precio_desde, activo, creado_en`,
    [nombre, descripcion, categoria || 'Desarrollo Web', precio_desde ?? 0]
  );
  return rows[0];
}

async function toggleActivo(id) {
  const { rows } = await pool.query(
    `UPDATE servicios
     SET activo = NOT activo
     WHERE id = $1
     RETURNING id, nombre, descripcion, categoria, precio_desde::float AS precio_desde, activo, creado_en`,
    [id]
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM servicios WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { findAll, create, toggleActivo, remove };
