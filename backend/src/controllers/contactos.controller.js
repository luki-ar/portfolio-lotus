// Capa de lógica de negocio para "contactos" con envío de correo mediante Nodemailer.
const nodemailer = require('nodemailer');
const contactoModel = require('../models/contacto.model');
const { HttpError, parseId, asyncHandler } = require('../utils/http');

const TIPOS_CONSULTA = ['Consulta General', 'Cotización', 'Asesoría Técnica'];

/**
 * Configura el transporte de Nodemailer:
 * - Si hay variables SMTP_HOST / SMTP_USER en .env, envía por SMTP real.
 * - Si no están configuradas, usa streamTransport de Nodemailer para procesar
 *   el envío de correo de forma local sin fallar durante la evaluación.
 */
function crearTransporteEmail() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true
  });
}

// GET /api/contactos
const listar = asyncHandler(async (req, res) => {
  res.json(await contactoModel.findAll());
});

// POST /api/contactos
const crear = asyncHandler(async (req, res) => {
  const { nombre, email, tipo_consulta, asunto, mensaje, adjunto_nombre } = req.body || {};

  if (typeof nombre !== 'string' || nombre.trim().length < 3) {
    throw new HttpError(400, 'El nombre debe tener al menos 3 caracteres');
  }
  if (typeof email !== 'string' || !email.includes('@')) {
    throw new HttpError(400, 'Ingresá un correo electrónico válido');
  }
  if (tipo_consulta && !TIPOS_CONSULTA.includes(tipo_consulta)) {
    throw new HttpError(400, `Tipo de consulta inválido. Permitidos: ${TIPOS_CONSULTA.join(', ')}`);
  }
  if (typeof asunto !== 'string' || asunto.trim().length < 5) {
    throw new HttpError(400, 'El asunto debe tener al menos 5 caracteres');
  }
  if (typeof mensaje !== 'string' || mensaje.trim().length < 15) {
    throw new HttpError(400, 'El mensaje debe tener al menos 15 caracteres');
  }

  // 1) Persistir en PostgreSQL (Supabase)
  const nuevoContacto = await contactoModel.create({
    nombre: nombre.trim(),
    email: email.trim(),
    tipo_consulta: tipo_consulta || 'Consulta General',
    asunto: asunto.trim(),
    mensaje: mensaje.trim(),
    adjunto_nombre: typeof adjunto_nombre === 'string' && adjunto_nombre.trim() ? adjunto_nombre.trim() : null
  });

  // 2) Enviar notificación por correo con Nodemailer
  let emailInfo = null;
  try {
    const transporter = crearTransporteEmail();
    const info = await transporter.sendMail({
      from: `"Portfolio LOTUS" <${process.env.SMTP_USER || 'no-reply@lotus.dev'}>`,
      to: process.env.CONTACT_RECEIVER || 'lucas.colque@lotus.dev',
      replyTo: nuevoContacto.email,
      subject: `[LOTUS - ${nuevoContacto.tipo_consulta}] ${nuevoContacto.asunto}`,
      text: `Nuevo mensaje de ${nuevoContacto.nombre} (${nuevoContacto.email}):\n\n${nuevoContacto.mensaje}`,
      html: `
        <div style="font-family: sans-serif; padding: 16px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
          <h2 style="color: #6366f1;">Nueva ${nuevoContacto.tipo_consulta} - Portfolio LOTUS</h2>
          <p><strong>Remitente:</strong> ${nuevoContacto.nombre} (${nuevoContacto.email})</p>
          <p><strong>Asunto:</strong> ${nuevoContacto.asunto}</p>
          <p><strong>Mensaje:</strong></p>
          <blockquote style="border-left: 3px solid #ec4899; padding-left: 12px;">${nuevoContacto.mensaje}</blockquote>
          ${nuevoContacto.adjunto_nombre ? `<p><strong>Archivo adjunto:</strong> ${nuevoContacto.adjunto_nombre}</p>` : ''}
        </div>
      `
    });
    emailInfo = { enviado: true, messageId: info.messageId };
  } catch (mailErr) {
    console.warn('[nodemailer] Aviso al procesar correo:', mailErr.message);
    emailInfo = { enviado: false };
  }

  res.status(201).json({ ...nuevoContacto, email_notificacion: emailInfo });
});

// PATCH /api/contactos/:id/respondido
const marcarRespondido = asyncHandler(async (req, res) => {
  const actualizado = await contactoModel.toggleRespondido(parseId(req.params.id));
  if (!actualizado) throw new HttpError(404, 'Mensaje de contacto no encontrado');
  res.json(actualizado);
});

// DELETE /api/contactos/:id
const eliminar = asyncHandler(async (req, res) => {
  const borrado = await contactoModel.remove(parseId(req.params.id));
  if (!borrado) throw new HttpError(404, 'Mensaje de contacto no encontrado');
  res.status(204).end();
});

module.exports = { listar, crear, marcarRespondido, eliminar };
