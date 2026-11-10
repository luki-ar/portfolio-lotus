// Capa de acceso a datos para "usuarios" (Usuarios registrados y Autenticación).
const crypto = require('crypto');
const { pool, withTransaction } = require('../config/db');

function hashPassword(password) {
  const salt = 'lotus_tp_salt_2026';
  return crypto.scryptSync(String(password), salt, 32).toString('hex');
}

async function findAll({ rol } = {}) {
  const { rows } = await pool.query(
    `SELECT u.id,
            u.nombre,
            u.email,
            u.rol,
            u.activo,
            u.ultimo_acceso,
            u.creado_en,
            COUNT(v.id)::int AS total_accesos
     FROM usuarios u
     LEFT JOIN visitas_log v ON v.usuario_id = u.id AND v.tipo = 'autenticado'
     WHERE ($1::text IS NULL OR u.rol = $1)
     GROUP BY u.id
     ORDER BY u.id ASC`,
    [rol || null]
  );
  return rows;
}

async function create({ nombre, email, rol, password }) {
  const passwordHash = password ? hashPassword(password) : null;
  const { rows } = await pool.query(
    `INSERT INTO usuarios (nombre, email, rol, activo, password_hash)
     VALUES ($1, $2, COALESCE($3, 'Cliente'), true, $4)
     RETURNING id, nombre, email, rol, activo, ultimo_acceso, creado_en, 0 AS total_accesos`,
    [nombre, email, rol || 'Cliente', passwordHash]
  );
  return rows[0];
}

async function registerAndLogVisit({ nombre, email, password }) {
  const passwordHash = hashPassword(password);
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO usuarios (nombre, email, rol, activo, password_hash, ultimo_acceso)
       VALUES ($1, $2, 'Cliente', true, $3, now())
       RETURNING id, nombre, email, rol, activo, ultimo_acceso, creado_en`,
      [nombre, email, passwordHash]
    );
    const usuario = rows[0];
    await client.query(
      `INSERT INTO visitas_log (tipo, seccion, usuario_id)
       VALUES ('autenticado', 'repositorios', $1)`,
      [usuario.id]
    );
    return usuario;
  });
}

async function authenticate({ email, password }) {
  const { rows } = await pool.query(
    `SELECT id, nombre, email, rol, activo, password_hash, ultimo_acceso
     FROM usuarios
     WHERE lower(email) = lower($1)`,
    [email]
  );
  const usuario = rows[0];
  if (!usuario) return { error: 'No existe una cuenta registrada con ese correo electrónico' };
  if (!usuario.activo) return { error: 'La cuenta se encuentra suspendida por un administrador' };

  // Si el usuario tiene contraseña configurada, la verificamos; si es un usuario precargado sin hash,
  // guardamos su primera contraseña ingresada para facilitar la demostración.
  const hashIngresado = hashPassword(password);
  if (usuario.password_hash && usuario.password_hash !== hashIngresado) {
    return { error: 'Contraseña incorrecta' };
  }

  return withTransaction(async (client) => {
    await client.query(
      `UPDATE usuarios
       SET ultimo_acceso = now(),
           password_hash = COALESCE(password_hash, $2)
       WHERE id = $1`,
      [usuario.id, hashIngresado]
    );
    await client.query(
      `INSERT INTO visitas_log (tipo, seccion, usuario_id)
       VALUES ('autenticado', 'repositorios', $1)`,
      [usuario.id]
    );
    return {
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        activo: usuario.activo
      }
    };
  });
}

async function toggleActivo(id) {
  const { rows } = await pool.query(
    `UPDATE usuarios
     SET activo = NOT activo
     WHERE id = $1
     RETURNING id, nombre, email, rol, activo, ultimo_acceso, creado_en`,
    [id]
  );
  return rows[0] || null;
}

async function cambiarRol(id, rol) {
  const { rows } = await pool.query(
    `UPDATE usuarios
     SET rol = $2
     WHERE id = $1
     RETURNING id, nombre, email, rol, activo, ultimo_acceso, creado_en`,
    [id, rol]
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = {
  findAll,
  create,
  registerAndLogVisit,
  authenticate,
  toggleActivo,
  cambiarRol,
  remove
};
