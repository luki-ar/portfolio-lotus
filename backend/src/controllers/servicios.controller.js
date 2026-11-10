// Capa de lógica de negocio para "servicios" (Servicios ofertados).
const servicioModel = require('../models/servicio.model');
const { HttpError, parseId, asyncHandler } = require('../utils/http');

/** Valida el cuerpo de alta/edición de un servicio y devuelve los datos normalizados. */
function validarServicio(body) {
  const { nombre, descripcion, categoria, precio_desde } = body || {};

  if (typeof nombre !== 'string' || nombre.trim() === '') {
    throw new HttpError(400, 'El nombre del servicio es obligatorio');
  }
  if (typeof descripcion !== 'string' || descripcion.trim() === '') {
    throw new HttpError(400, 'La descripción del servicio es obligatoria');
  }

  const precio = precio_desde !== undefined && precio_desde !== '' ? Number(precio_desde) : 0;
  if (Number.isNaN(precio) || precio < 0) {
    throw new HttpError(400, 'El precio base debe ser un número mayor o igual a 0');
  }

  return {
    nombre: nombre.trim(),
    descripcion: descripcion.trim(),
    categoria: typeof categoria === 'string' && categoria.trim() ? categoria.trim() : 'Desarrollo Web',
    precio_desde: precio,
  };
}

// GET /api/servicios
const listar = asyncHandler(async (req, res) => {
  res.json(await servicioModel.findAll());
});

// POST /api/servicios
const crear = asyncHandler(async (req, res) => {
  const servicio = await servicioModel.create(validarServicio(req.body));
  res.status(201).json(servicio);
});

// PUT /api/servicios/:id
const actualizar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const servicio = await servicioModel.update(id, validarServicio(req.body));
  if (!servicio) throw new HttpError(404, 'Servicio no encontrado');
  res.json(servicio);
});

// PATCH /api/servicios/:id/estado
const cambiarEstado = asyncHandler(async (req, res) => {
  const actualizado = await servicioModel.toggleActivo(parseId(req.params.id));
  if (!actualizado) throw new HttpError(404, 'Servicio no encontrado');
  res.json(actualizado);
});

// DELETE /api/servicios/:id
const eliminar = asyncHandler(async (req, res) => {
  const borrado = await servicioModel.remove(parseId(req.params.id));
  if (!borrado) throw new HttpError(404, 'Servicio no encontrado');
  res.status(204).end();
});

module.exports = { listar, crear, actualizar, cambiarEstado, eliminar };
