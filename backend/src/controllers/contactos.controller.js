// Capa de lógica de negocio para "contactos" con envío de correo mediante Nodemailer.
const contactoModel = require('../models/contacto.model');
const { HttpError, parseId, asyncHandler } = require('../utils/http');
const { enviarCorreo, escaparHtml } = require('../utils/mailer');

const TIPOS_CONSULTA = ['Consulta General', 'Cotización', 'Asesoría Técnica'];

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

  // 2) Enviar notificación al equipo con Nodemailer (si falla, la consulta ya quedó guardada)
  let emailInfo = null;
  try {
    emailInfo = await enviarCorreo({
      to: process.env.CONTACT_RECEIVER || 'lucas.colque@lotus.dev',
      replyTo: nuevoContacto.email,
      subject: `[LOTUS - ${nuevoContacto.tipo_consulta}] ${nuevoContacto.asunto}`,
      text: `Nuevo mensaje de ${nuevoContacto.nombre} (${nuevoContacto.email}):\n\n${nuevoContacto.mensaje}`,
      html: `
        <div style="font-family: sans-serif; padding: 16px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
          <h2 style="color: #6366f1;">Nueva ${escaparHtml(nuevoContacto.tipo_consulta)} - Portfolio LOTUS</h2>
          <p><strong>Remitente:</strong> ${escaparHtml(nuevoContacto.nombre)} (${escaparHtml(nuevoContacto.email)})</p>
          <p><strong>Asunto:</strong> ${escaparHtml(nuevoContacto.asunto)}</p>
          <p><strong>Mensaje:</strong></p>
          <blockquote style="border-left: 3px solid #ec4899; padding-left: 12px;">${escaparHtml(nuevoContacto.mensaje)}</blockquote>
          ${nuevoContacto.adjunto_nombre ? `<p><strong>Archivo adjunto:</strong> ${escaparHtml(nuevoContacto.adjunto_nombre)}</p>` : ''}
        </div>
      `
    });
  } catch (mailErr) {
    console.warn('[nodemailer] Aviso al procesar correo:', mailErr.message);
    emailInfo = { enviado: false };
  }

  res.status(201).json({ ...nuevoContacto, email_notificacion: emailInfo });
});

// POST /api/contactos/:id/responder
// Envía la respuesta del Administrador al remitente por email y la registra en la BD.
const responder = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const { respuesta } = req.body || {};

  if (typeof respuesta !== 'string' || respuesta.trim().length < 10) {
    throw new HttpError(400, 'La respuesta debe tener al menos 10 caracteres');
  }
  if (respuesta.trim().length > 2000) {
    throw new HttpError(400, 'La respuesta no puede superar los 2000 caracteres');
  }

  const contacto = await contactoModel.findById(id);
  if (!contacto) throw new HttpError(404, 'Mensaje de contacto no encontrado');

  const textoRespuesta = respuesta.trim();

  // 1) Enviar el correo primero: si el SMTP real falla, no marcamos la consulta como respondida.
  let emailInfo;
  try {
    emailInfo = await enviarCorreo({
      to: contacto.email,
      replyTo: process.env.CONTACT_RECEIVER || undefined,
      subject: `Re: ${contacto.asunto} — Equipo LOTUS`,
      text:
        `Hola ${contacto.nombre},\n\n${textoRespuesta}\n\n` +
        `— Equipo LOTUS\n\n` +
        `--- Tu consulta original ---\n${contacto.mensaje}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
          <h2 style="color: #6366f1; margin-top: 0;">Respuesta a tu ${escaparHtml(contacto.tipo_consulta)}</h2>
          <p>Hola <strong>${escaparHtml(contacto.nombre)}</strong>,</p>
          <p style="white-space: pre-line;">${escaparHtml(textoRespuesta)}</p>
          <p style="color: #f472b6;">— Equipo LOTUS</p>
          <hr style="border: none; border-top: 1px solid #334155; margin: 18px 0;" />
          <p style="color: #94a3b8; font-size: 13px;"><strong>Tu consulta original (${escaparHtml(contacto.asunto)}):</strong></p>
          <blockquote style="border-left: 3px solid #ec4899; padding-left: 12px; color: #cbd5e1; font-size: 13px;">${escaparHtml(contacto.mensaje)}</blockquote>
        </div>
      `
    });
  } catch (mailErr) {
    console.error('[nodemailer] Error al enviar la respuesta:', mailErr.message);
    throw new HttpError(502, 'No se pudo enviar el correo de respuesta. Revisá la configuración SMTP del servidor.');
  }

  // 2) Registrar la respuesta en PostgreSQL y marcar como respondido
  const actualizado = await contactoModel.registrarRespuesta(id, textoRespuesta);
  res.json({ ...actualizado, email_notificacion: emailInfo });
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

module.exports = { listar, crear, responder, marcarRespondido, eliminar };
