// Capa de acceso a datos para métricas, contadores de visitas y gráficos parametrizados.
const { pool, withTransaction } = require('../config/db');

/**
 * Registra una visita ('general' o 'autenticado').
 * Si es un acceso autenticado con usuario_id, actualiza su fecha de ultimo_acceso.
 */
async function registrarVisita({ tipo = 'general', seccion = 'inicio', usuario_id = null }) {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO visitas_log (tipo, seccion, usuario_id)
       VALUES ($1, $2, $3)
       RETURNING id, tipo, seccion, usuario_id, creado_en`,
      [tipo, seccion, usuario_id || null]
    );
    if (usuario_id) {
      await client.query(
        'UPDATE usuarios SET ultimo_acceso = now() WHERE id = $1',
        [usuario_id]
      );
    }
    return rows[0];
  });
}

/**
 * Consulta parametrizada de métricas y series para los gráficos interactivos.
 * Recibe $1 = dias (ventana temporal) y $2 = seccion (opcional, NULL para todas).
 */
async function obtenerResumen({ dias = 7, seccion = null } = {}) {
  // Ejecución en paralelo sobre el Pool de PostgreSQL (postgres-best-practices)
  const [contadoresQuery, contenidoQuery, porDiaQuery, porSeccionQuery] = await Promise.all([
    // 1) Contadores de visitas (histórico global + filtrado por parámetros)
    pool.query(
      `SELECT
         COUNT(*)::int AS total_visitas,
         COUNT(*) FILTER (WHERE tipo = 'general')::int AS visitas_generales,
         COUNT(*) FILTER (WHERE tipo = 'autenticado')::int AS accesos_autenticados,
         COUNT(*) FILTER (
           WHERE creado_en >= now() - ($1::int || ' days')::interval
             AND ($2::text IS NULL OR seccion = $2)
         )::int AS visitas_periodo
       FROM visitas_log`,
      [dias, seccion]
    ),

    // 2) Totales de entidades para KPIs y gráfico circular (Proyectos, Demos, Servicios, Usuarios)
    pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM proyectos)   AS proyectos,
        (SELECT COUNT(*)::int FROM demos)       AS demos,
        (SELECT COUNT(*)::int FROM servicios)   AS servicios,
        (SELECT COUNT(*)::int FROM tecnologias) AS tecnologias,
        (SELECT COUNT(*)::int FROM usuarios)    AS usuarios
    `),

    // 3) Serie temporal parametrizada día por día para el BarChart de tráfico
    pool.query(
      `SELECT
         to_char(serie.dia, 'DD/MM') AS fecha,
         COUNT(v.id) FILTER (WHERE v.tipo = 'general')::int     AS generales,
         COUNT(v.id) FILTER (WHERE v.tipo = 'autenticado')::int AS autenticados,
         COUNT(v.id)::int                                       AS total
       FROM generate_series(
         date_trunc('day', now()) - (($1::int - 1) || ' days')::interval,
         date_trunc('day', now()),
         '1 day'::interval
       ) AS serie(dia)
       LEFT JOIN visitas_log v
         ON date_trunc('day', v.creado_en) = serie.dia
        AND ($2::text IS NULL OR v.seccion = $2)
       GROUP BY serie.dia
       ORDER BY serie.dia ASC`,
      [dias, seccion]
    ),

    // 4) Distribución de visitas por sección parametrizada por ventana de días
    pool.query(
      `SELECT
         seccion,
         COUNT(*) FILTER (WHERE tipo = 'general')::int     AS generales,
         COUNT(*) FILTER (WHERE tipo = 'autenticado')::int AS autenticados,
         COUNT(*)::int                                     AS total
       FROM visitas_log
       WHERE creado_en >= now() - ($1::int || ' days')::interval
       GROUP BY seccion
       ORDER BY total DESC`,
      [dias]
    )
  ]);

  return {
    parametros: { dias, seccion: seccion || 'todas' },
    contadores: contadoresQuery.rows[0],
    contenido: contenidoQuery.rows[0],
    visitas_por_dia: porDiaQuery.rows,
    visitas_por_seccion: porSeccionQuery.rows,
  };
}

module.exports = { registrarVisita, obtenerResumen };
