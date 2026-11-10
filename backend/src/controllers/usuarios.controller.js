// Capa de lógica de negocio para "usuarios" y autenticación (Registro / Login).
const usuarioModel = require('../models/usuario.model');
const { HttpError, parseId, asyncHandler } = require('../utils/http');

const ROLES_VALIDOS = ['Administrador', 'Cliente', 'Colaborador'];

// GET /api/usuarios?rol=...
const listar = asyncHandler(async (req, res) => {
  const { rol } = req.query;
  if (rol && !ROLES_VALIDOS.includes(rol)) {
    throw new HttpError(400, `Rol inválido. Valores permitidos: ${ROLES_VALIDOS.join(', ')}`);
  }
  res.json(await usuarioModel.findAll({ rol: rol || null }));
});

// POST /api/usuarios (Alta desde el panel Admin)
const crear = asyncHandler(async (req, res) => {
  const { nombre, email, rol, password } = req.body || {};

  if (typeof nombre !== 'string' || nombre.trim().length < 3) {
    throw new HttpError(400, 'El nombre del usuario debe tener al menos 3 caracteres');
  }
  if (typeof email !== 'string' || !email.includes('@')) {
    throw new HttpError(400, 'Ingresá un email válido');
  }
  if (rol !== undefined && !ROLES_VALIDOS.includes(rol)) {
    throw new HttpError(400, `Rol inválido. Valores permitidos: ${ROLES_VALIDOS.join(', ')}`);
  }

  const usuario = await usuarioModel.create({
    nombre: nombre.trim(),
    email: email.trim(),
    rol: rol || 'Cliente',
    password: password || null
  });

  res.status(201).json(usuario);
});

// POST /api/usuarios/registro (Registro público de visitantes para acceder a Proyectos y Demos)
const registrarVisitante = asyncHandler(async (req, res) => {
  const { nombre, email, password } = req.body || {};

  if (typeof nombre !== 'string' || nombre.trim().length < 3) {
    throw new HttpError(400, 'El nombre debe tener al menos 3 caracteres');
  }
  if (typeof email !== 'string' || !email.includes('@')) {
    throw new HttpError(400, 'Ingresá un correo electrónico válido');
  }
  if (typeof password !== 'string' || password.length < 6) {
    throw new HttpError(400, 'La contraseña debe tener al menos 6 caracteres');
  }

  const usuario = await usuarioModel.registerAndLogVisit({
    nombre: nombre.trim(),
    email: email.trim(),
    password
  });

  res.status(201).json({ usuario });
});

// POST /api/usuarios/login (Autenticación de usuarios registrados)
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  if (typeof email !== 'string' || !email.includes('@')) {
    throw new HttpError(400, 'Ingresá un correo electrónico válido');
  }
  if (typeof password !== 'string' || password.length < 6) {
    throw new HttpError(400, 'La contraseña debe tener al menos 6 caracteres');
  }

  const resultado = await usuarioModel.authenticate({
    email: email.trim(),
    password
  });

  if (resultado.error) {
    throw new HttpError(401, resultado.error);
  }

  res.json(resultado);
});

// PATCH /api/usuarios/:id/estado
const cambiarEstado = asyncHandler(async (req, res) => {
  const actualizado = await usuarioModel.toggleActivo(parseId(req.params.id));
  if (!actualizado) throw new HttpError(404, 'Usuario no encontrado');
  res.json(actualizado);
});

// PATCH /api/usuarios/:id/rol
const cambiarRol = asyncHandler(async (req, res) => {
  const { rol } = req.body || {};
  if (!ROLES_VALIDOS.includes(rol)) {
    throw new HttpError(400, `Rol inválido. Valores permitidos: ${ROLES_VALIDOS.join(', ')}`);
  }
  const actualizado = await usuarioModel.cambiarRol(parseId(req.params.id), rol);
  if (!actualizado) throw new HttpError(404, 'Usuario no encontrado');
  res.json(actualizado);
});

// DELETE /api/usuarios/:id
const eliminar = asyncHandler(async (req, res) => {
  const borrado = await usuarioModel.remove(parseId(req.params.id));
  if (!borrado) throw new HttpError(404, 'Usuario no encontrado');
  res.status(204).end();
});

module.exports = {
  listar,
  crear,
  registrarVisitante,
  login,
  cambiarEstado,
  cambiarRol,
  eliminar
};
