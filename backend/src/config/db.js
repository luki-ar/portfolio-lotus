// Capa de datos: pool de conexiones a PostgreSQL (driver "pg").
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.warn('[db] Falta la variable DATABASE_URL. Copiá .env.example como .env y completala.');
}

// Un Pool reutiliza conexiones abiertas en lugar de abrir una por request.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase (y la mayoría de las bases en la nube) exige SSL.
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 10,
  keepAlive: true,
  // Cerramos conexiones inactivas antes de que el pooler de Supabase las corte.
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('[db] Error inesperado en una conexión inactiva:', err.message);
});

// Evita que un corte de red en un cliente activo derribe el proceso de Node (ECONNRESET).
pool.on('connect', (client) => {
  client.on('error', (err) => {
    console.error('[db] Error de red en conexión activa:', err.message);
  });
});

/**
 * Ejecuta `fn(client)` dentro de una transacción.
 * Si algo falla se hace ROLLBACK, de modo que nunca quedan datos a medio guardar.
 */
async function withTransaction(fn) {
  const client = await pool.connect();
  let descartarCliente = false;
  try {
    await client.query('BEGIN');
    const resultado = await fn(client);
    await client.query('COMMIT');
    return resultado;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      // Si el socket se cortó, le indicamos al pool que descarte esta conexión rota.
      descartarCliente = true;
    }
    throw err;
  } finally {
    client.release(descartarCliente);
  }
}

module.exports = { pool, withTransaction };
