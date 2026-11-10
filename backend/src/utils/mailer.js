// Servicio de correo transaccional con Nodemailer.
// - Con SMTP_HOST / SMTP_USER / SMTP_PASS configurados: envío real por SMTP.
// - Sin credenciales: streamTransport (el correo se genera en memoria y NO se entrega),
//   para que el flujo funcione durante la evaluación sin romper el registro en la BD.
const nodemailer = require('nodemailer');

function smtpConfigurado() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function crearTransporteEmail() {
  if (smtpConfigurado()) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });
}

/** Escapa texto ingresado por usuarios antes de insertarlo en el HTML del correo. */
function escaparHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function remitente() {
  return process.env.SMTP_FROM || `"Portfolio LOTUS" <${process.env.SMTP_USER || 'no-reply@lotus.dev'}>`;
}

/**
 * Envía un correo y devuelve { enviado, modo, messageId }.
 * `modo` es 'smtp' (entregado al servidor SMTP) o 'simulado' (sin credenciales SMTP).
 */
async function enviarCorreo({ to, subject, text, html, replyTo }) {
  const transporter = crearTransporteEmail();
  const info = await transporter.sendMail({
    from: remitente(),
    to,
    replyTo,
    subject,
    text,
    html,
  });
  return {
    enviado: true,
    modo: smtpConfigurado() ? 'smtp' : 'simulado',
    messageId: info.messageId,
  };
}

module.exports = { enviarCorreo, escaparHtml, smtpConfigurado };
