// Capa de acceso a datos para "contactos" (Formulario de Contacto y Gestión Admin).
const { pool } = require('../config/db');

const COLUMNAS = `id, nombre, email, tipo_consulta, asunto, mensaje, adjunto_nombre,
                  respondido, respondido_en, respuesta, creado_en`;

async function findAll() {
  const { rows } = await pool.query(`
    SELECT ${COLUMNAS}
    FROM contactos
    ORDER BY respondido ASC, id DESC
  `);
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(`SELECT ${COLUMNAS} FROM contactos WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function create({ nombre, email, tipo_consulta, asunto, mensaje, adjunto_nombre }) {
  const { rows } = await pool.query(
    `INSERT INTO contactos (nombre, email, tipo_consulta, asunto, mensaje, adjunto_nombre)
     VALUES ($1, $2, COALESCE($3, 'Consulta General'), $4, $5, $6)
     RETURNING ${COLUMNAS}`,
    [
      nombre,
      email,
      tipo_consulta || 'Consulta General',
      asunto,
      mensaje,
      adjunto_nombre || null
    ]
  );
  return rows[0];
}

async function toggleRespondido(id) {
  const { rows } = await pool.query(
    `UPDATE contactos
     SET respondido = NOT respondido,
         respondido_en = CASE WHEN NOT respondido THEN now() ELSE NULL END
     WHERE id = $1
     RETURNING ${COLUMNAS}`,
    [id]
  );
  return rows[0] || null;
}

/** Guarda la respuesta enviada por el Administrador y marca la consulta como respondida. */
async function registrarRespuesta(id, respuesta) {
  const { rows } = await pool.query(
    `UPDATE contactos
     SET respuesta = $2,
         respondido = true,
         respondido_en = now()
     WHERE id = $1
     RETURNING ${COLUMNAS}`,
    [id, respuesta]
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM contactos WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { findAll, findById, create, toggleRespondido, registrarRespuesta, remove };
