// Capa de lógica de negocio para "demos".
const demoModel = require('../models/demo.model');
const { HttpError, parseId, asyncHandler } = require('../utils/http');

/** Valida el cuerpo de alta/edición de una demo y devuelve los datos normalizados. */
function validarDemo(body) {
  const { titulo, descripcion, url_demo, proyecto_id } = body || {};

  if (typeof titulo !== 'string' || titulo.trim() === '') {
    throw new HttpError(400, 'El título de la demo es obligatorio');
  }
  if (typeof url_demo !== 'string' || url_demo.trim() === '') {
    throw new HttpError(400, 'La URL de la demo es obligatoria');
  }
  if (!/^https?:\/\//i.test(url_demo.trim())) {
    throw new HttpError(400, 'La URL de la demo debe iniciar con http:// o https://');
  }

  const parsedProyectoId =
    proyecto_id !== undefined && proyecto_id !== null && proyecto_id !== ''
      ? parseId(proyecto_id)
      : null;

  return {
    titulo: titulo.trim(),
    descripcion: typeof descripcion === 'string' && descripcion.trim() ? descripcion.trim() : null,
    url_demo: url_demo.trim(),
    proyecto_id: parsedProyectoId,
  };
}

// GET /api/demos
const listar = asyncHandler(async (req, res) => {
  res.json(await demoModel.findAll());
});

// POST /api/demos
const crear = asyncHandler(async (req, res) => {
  const demo = await demoModel.create(validarDemo(req.body));
  res.status(201).json(demo);
});

// PUT /api/demos/:id
const actualizar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const demo = await demoModel.update(id, validarDemo(req.body));
  if (!demo) throw new HttpError(404, 'Demo no encontrada');
  res.json(demo);
});

// DELETE /api/demos/:id
const eliminar = asyncHandler(async (req, res) => {
  const borrado = await demoModel.remove(parseId(req.params.id));
  if (!borrado) throw new HttpError(404, 'Demo no encontrada');
  res.status(204).end();
});

module.exports = { listar, crear, actualizar, eliminar };
