// Capa de lógica de negocio para "tecnologias".
const tecnologiaModel = require('../models/tecnologia.model');
const { HttpError, parseId, asyncHandler } = require('../utils/http');

// GET /api/tecnologias
const listar = asyncHandler(async (req, res) => {
  res.json(await tecnologiaModel.findAll());
});

// POST /api/tecnologias
const crear = asyncHandler(async (req, res) => {
  const { nombre } = req.body || {};
  if (typeof nombre !== 'string' || nombre.trim() === '') {
    throw new HttpError(400, 'El nombre es obligatorio');
  }
  if (nombre.trim().length > 50) {
    throw new HttpError(400, 'El nombre puede tener como máximo 50 caracteres');
  }
  // Si ya existe, la restricción UNIQUE de la base lanza 23505 => 409 Conflict.
  const tecnologia = await tecnologiaModel.create(nombre.trim());
  res.status(201).json(tecnologia);
});

// DELETE /api/tecnologias/:id
const eliminar = asyncHandler(async (req, res) => {
  const borrado = await tecnologiaModel.remove(parseId(req.params.id));
  if (!borrado) throw new HttpError(404, 'Tecnología no encontrada');
  res.status(204).end();
});

module.exports = { listar, crear, eliminar };
