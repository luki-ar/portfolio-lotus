// Migraciones idempotentes que se ejecutan al iniciar el servidor.
// Permiten agregar columnas nuevas en Supabase sin tener que correr SQL a mano.
const { pool } = require('./db');

const MIGRACIONES = [
  {
    nombre: '001_contactos_respuesta',
    sql: 'ALTER TABLE contactos ADD COLUMN IF NOT EXISTS respuesta TEXT',
  },
];

async function ejecutarMigraciones() {
  for (const migracion of MIGRACIONES) {
    try {
      await pool.query(migracion.sql);
      console.log(`[migraciones] OK: ${migracion.nombre}`);
    } catch (err) {
      console.error(`[migraciones] Falló ${migracion.nombre}:`, err.message);
    }
  }
}

module.exports = { ejecutarMigraciones };
