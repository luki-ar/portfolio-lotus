// Configuración de la aplicación Express (separada de server.js para poder testearla).
const express = require('express');
const cors = require('cors');

const { pool } = require('./config/db');
const proyectosRoutes = require('./routes/proyectos.routes');
const tecnologiasRoutes = require('./routes/tecnologias.routes');
const demosRoutes = require('./routes/demos.routes');
const serviciosRoutes = require('./routes/servicios.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const metricasRoutes = require('./routes/metricas.routes');
const contactosRoutes = require('./routes/contactos.routes');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json({ limit: '100kb' }));

// Healthcheck: confirma que la API y la base de datos responden.
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ api: 'ok', db: 'ok' });
  } catch (err) {
    res.status(503).json({ api: 'ok', db: 'error', detalle: err.message });
  }
});

app.use('/api/proyectos', proyectosRoutes);
app.use('/api/tecnologias', tecnologiasRoutes);
app.use('/api/demos', demosRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/metricas', metricasRoutes);
app.use('/api/contactos', contactosRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
