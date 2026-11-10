// Traduce los errores (propios y de PostgreSQL) a respuestas HTTP con JSON.

// Códigos de error de PostgreSQL: https://www.postgresql.org/docs/current/errcodes-appendix.html
const ERRORES_PG = {
  23505: { status: 409, mensaje: 'Ya existe un registro con ese valor' },               // unique_violation
  23503: { status: 409, mensaje: 'El registro está en uso por otro y no puede borrarse' }, // foreign_key_violation
  23001: { status: 409, mensaje: 'El registro está en uso por otro y no puede borrarse' }, // restrict_violation (ON DELETE RESTRICT)
  23514: { status: 400, mensaje: 'Los datos no cumplen las reglas de la base de datos' }, // check_violation
  23502: { status: 400, mensaje: 'Falta un campo obligatorio' },                          // not_null_violation
  '22P02': { status: 400, mensaje: 'Formato de dato inválido' },                          // invalid_text_representation
  22001: { status: 400, mensaje: 'Un valor supera la longitud permitida' },               // string_data_right_truncation
  '42P01': { status: 500, mensaje: 'Faltan tablas en la base de datos. Ejecutá backend/db/schema.sql completo en Supabase.' }, // undefined_table
};

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // JSON mal formado en el body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }

  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  const pg = ERRORES_PG[err.code];
  if (pg) {
    return res.status(pg.status).json({ error: pg.mensaje, detalle: err.detail });
  }

  console.error('[error]', err);
  return res.status(500).json({ error: 'Error interno del servidor' });
}

function notFound(req, res) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFound };
