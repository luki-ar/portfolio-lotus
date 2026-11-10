// Capa de lógica de negocio: valida la entrada y decide la respuesta HTTP.
const proyectoModel = require('../models/proyecto.model');
const { HttpError, parseId, asyncHandler } = require('../utils/http');

const ESTADOS_VALIDOS = ['Nuevo Avance', 'En proceso', 'Deployado'];

/** Acepta un array (["React", "Node"]) o un string separado por comas ("React, Node"). */
function normalizarTecnologias(entrada) {
  if (entrada === undefined || entrada === null) return [];
  const lista = Array.isArray(entrada) ? entrada : String(entrada).split(',');
  const limpias = lista
    .map((t) => String(t).trim())
    .filter((t) => t.length > 0);

  // Quita duplicados sin distinguir mayúsculas ("React, react" => ["React"]).
  const vistas = new Set();
  return limpias.filter((t) => {
    const clave = t.toLowerCase();
    if (vistas.has(clave)) return false;
    vistas.add(clave);
    return true;
  });
}

// GET /api/proyectos
const listar = asyncHandler(async (req, res) => {
  res.json(await proyectoModel.findAll());
});

// GET /api/proyectos/:id
const obtener = asyncHandler(async (req, res) => {
  const proyecto = await proyectoModel.findById(parseId(req.params.id));
  if (!proyecto) throw new HttpError(404, 'Proyecto no encontrado');
  res.json(proyecto);
});

/** Valida el cuerpo de alta/edición y devuelve los datos normalizados. */
function validarProyecto(body) {
  const { titulo, descripcion, estado, tecnologias: tecnologiasEntrada } = body || {};

  if (typeof titulo !== 'string' || titulo.trim() === '') {
    throw new HttpError(400, 'El título es obligatorio');
  }
  if (titulo.trim().length > 120) {
    throw new HttpError(400, 'El título no puede superar los 120 caracteres');
  }
  if (estado !== undefined && !ESTADOS_VALIDOS.includes(estado)) {
    throw new HttpError(400, `Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`);
  }

  const tecnologias = normalizarTecnologias(tecnologiasEntrada);
  if (tecnologias.length === 0) {
    throw new HttpError(400, 'Indicá al menos una tecnología');
  }
  if (tecnologias.some((t) => t.length > 50)) {
    throw new HttpError(400, 'Cada tecnología puede tener como máximo 50 caracteres');
  }

  return {
    titulo: titulo.trim(),
    descripcion: typeof descripcion === 'string' ? descripcion.trim() : undefined,
    estado,
    tecnologias,
  };
}

// POST /api/proyectos
const crear = asyncHandler(async (req, res) => {
  const datos = validarProyecto(req.body);
  const proyecto = await proyectoModel.create({
    ...datos,
    descripcion: datos.descripcion ?? null,
  });

  res.status(201).location(`/api/proyectos/${proyecto.id}`).json(proyecto);
});

// PUT /api/proyectos/:id
const actualizar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const datos = validarProyecto(req.body);
  const proyecto = await proyectoModel.update(id, datos);
  if (!proyecto) throw new HttpError(404, 'Proyecto no encontrado');
  res.json(proyecto);
});

// DELETE /api/proyectos/:id
const eliminar = asyncHandler(async (req, res) => {
  const borrado = await proyectoModel.remove(parseId(req.params.id));
  if (!borrado) throw new HttpError(404, 'Proyecto no encontrado');
  res.status(204).end();
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
