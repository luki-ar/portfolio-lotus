// Punto de entrada: carga variables de entorno y levanta el servidor HTTP.
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = require('./app');
const { ejecutarMigraciones } = require('./config/migraciones');

const PORT = Number(process.env.PORT) || 4000;

let server;

async function iniciar() {
  // Aplica migraciones idempotentes (ADD COLUMN IF NOT EXISTS) antes de aceptar tráfico.
  await ejecutarMigraciones();

  server = app.listen(PORT, () => {
    console.log(`API escuchando en http://localhost:${PORT}/api`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `[server] El puerto ${PORT} ya está en uso por otra terminal abierta. ` +
        `Cerrá la otra instancia de "npm run dev" o usá la que ya está corriendo.`
      );
      process.exit(0);
    }
    console.error('[server] Error al iniciar el servidor:', err);
    process.exit(1);
  });
}

iniciar();

process.on('uncaughtException', (err) => {
  console.error('[server] Excepción no capturada (el servidor sigue activo):', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('[server] Promesa rechazada no capturada (el servidor sigue activo):', reason);
});
