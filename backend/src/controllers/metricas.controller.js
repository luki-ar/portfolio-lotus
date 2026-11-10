// Capa de lógica de negocio para métricas, contadores de visitas y gráficos parametrizados.
const metricaModel = require('../models/metrica.model');
const { HttpError, parseId, asyncHandler } = require('../utils/http');

const TIPOS_VALIDOS = ['general', 'autenticado'];

// GET /api/metricas?dias=7&seccion=...
const obtenerResumen = asyncHandler(async (req, res) => {
  const diasRaw = req.query.dias ? Number(req.query.dias) : 7;
  if (!Number.isInteger(diasRaw) || diasRaw < 1 || diasRaw > 90) {
    throw new HttpError(400, 'El parámetro "dias" debe ser un entero entre 1 y 90');
  }
  const seccion =
    typeof req.query.seccion === 'string' && req.query.seccion.trim() && req.query.seccion !== 'todas'
      ? req.query.seccion.trim()
      : null;

  const resumen = await metricaModel.obtenerResumen({ dias: diasRaw, seccion });
  res.json(resumen);
});

// POST /api/metricas/visita
const registrarVisita = asyncHandler(async (req, res) => {
  const { tipo = 'general', seccion = 'inicio', usuario_id = null } = req.body || {};

  if (!TIPOS_VALIDOS.includes(tipo)) {
    throw new HttpError(400, `Tipo de visita inválido. Valores permitidos: ${TIPOS_VALIDOS.join(', ')}`);
  }

  const parsedUsuarioId =
    usuario_id !== undefined && usuario_id !== null && usuario_id !== ''
      ? parseId(usuario_id)
      : null;

  const registro = await metricaModel.registrarVisita({
    tipo,
    seccion: typeof seccion === 'string' && seccion.trim() ? seccion.trim() : 'inicio',
    usuario_id: parsedUsuarioId,
  });

  res.status(201).json(registro);
});

module.exports = { obtenerResumen, registrarVisita };
