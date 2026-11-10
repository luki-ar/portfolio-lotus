// Esquemas de validación estricta con Zod para todos los formularios del frontend (Textos, Emails, URLs, Números y Archivos).
import { z } from 'zod';

const EXTENSIONES_PERMITIDAS = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.doc', '.docx'];
const MIME_PERMITIDOS = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
const MAX_TAMANO_ARCHIVO_BYTES = 5 * 1024 * 1024; // 5 MB
const REGEX_NOMBRE_VALIDO = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]+$/;

/**
 * Valida estrictamente un archivo adjunto o imagen opcional:
 * - Verifica que no sea un archivo vacío (0 bytes)
 * - Verifica extensión permitida (.pdf, .png, .jpg, .jpeg, .webp, .doc, .docx)
 * - Verifica tipo MIME seguro
 * - Verifica peso máximo de 5 MB
 */
export function validarArchivoAdjunto(archivo) {
  if (!archivo) return { ok: true, nombre: null };

  if (archivo.size === 0) {
    return {
      ok: false,
      error: 'El archivo seleccionado está vacío (0 bytes)'
    };
  }

  const nombre = String(archivo.name || '').toLowerCase();
  const tieneExtensionValida = EXTENSIONES_PERMITIDAS.some((ext) => nombre.endsWith(ext));
  if (!tieneExtensionValida) {
    return {
      ok: false,
      error: `Formato de archivo no permitido. Extensiones aceptadas: ${EXTENSIONES_PERMITIDAS.join(', ')}`
    };
  }

  if (archivo.type && !MIME_PERMITIDOS.includes(archivo.type)) {
    return {
      ok: false,
      error: `Tipo MIME de archivo no válido (${archivo.type}). Subí un documento PDF/Word o imagen PNG/JPG/WEBP.`
    };
  }

  if (archivo.size > MAX_TAMANO_ARCHIVO_BYTES) {
    return {
      ok: false,
      error: 'El archivo supera el tamaño máximo permitido de 5 MB'
    };
  }

  return { ok: true, nombre: archivo.name };
}

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Ingresá un correo electrónico con formato válido (ej. usuario@dominio.com)'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(64, 'La contraseña no puede superar los 64 caracteres')
});

export const registroSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, 'El nombre debe contener al menos 3 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres')
    .regex(REGEX_NOMBRE_VALIDO, 'El nombre solo puede contener letras y espacios'),
  email: z
    .string()
    .trim()
    .email('Ingresá un correo electrónico con formato válido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(64, 'La contraseña no puede superar los 64 caracteres')
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'La contraseña debe incluir al menos una letra y un número')
});

export const contactoSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener entre 3 y 100 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres')
    .regex(REGEX_NOMBRE_VALIDO, 'El nombre solo puede contener letras y espacios'),
  email: z
    .string()
    .trim()
    .email('Ingresá un correo electrónico válido para poder responderte'),
  tipo_consulta: z.enum(['Consulta General', 'Cotización', 'Asesoría Técnica']),
  asunto: z
    .string()
    .trim()
    .min(5, 'El asunto debe tener al menos 5 caracteres')
    .max(150, 'El asunto no puede superar los 150 caracteres'),
  mensaje: z
    .string()
    .trim()
    .min(15, 'El mensaje debe detallar al menos 15 caracteres')
    .max(1500, 'El mensaje no puede superar los 1500 caracteres')
});

export const proyectoSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(3, 'El título del proyecto debe tener al menos 3 caracteres')
    .max(120, 'El título no puede superar los 120 caracteres'),
  tecnologias: z
    .string()
    .trim()
    .min(2, 'Ingresá al menos una tecnología separada por coma'),
  estado: z.enum(['Nuevo Avance', 'En proceso', 'Deployado'])
});

export const demoSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(3, 'El título de la demo debe tener al menos 3 caracteres')
    .max(120, 'El título no puede superar los 120 caracteres'),
  url_demo: z
    .string()
    .trim()
    .url('La URL de la demo debe ser válida e iniciar con http:// o https://')
    .refine((val) => /^https?:\/\//i.test(val), 'La URL debe utilizar protocolo seguro http:// o https://'),
  descripcion: z
    .string()
    .trim()
    .max(300, 'La descripción no puede superar los 300 caracteres')
    .optional()
});

export const servicioSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(4, 'El nombre del servicio debe tener al menos 4 caracteres')
    .max(120, 'El nombre no puede superar los 120 caracteres'),
  categoria: z.enum(['Desarrollo Web', 'Diseño UI/UX', 'Backend & APIs', 'Base de Datos / Cloud']),
  precio_desde: z
    .number({ invalid_type_error: 'El precio debe ser un valor numérico' })
    .min(0, 'El precio no puede ser negativo')
    .max(100000, 'El precio supera el límite permitido'),
  descripcion: z
    .string()
    .trim()
    .min(10, 'La descripción del servicio debe tener al menos 10 caracteres')
    .max(500, 'La descripción no puede superar los 500 caracteres')
});

export const usuarioAdminSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres')
    .regex(REGEX_NOMBRE_VALIDO, 'El nombre solo puede contener letras y espacios'),
  email: z
    .string()
    .trim()
    .email('Ingresá un correo electrónico con formato válido'),
  rol: z.enum(['Cliente', 'Colaborador', 'Administrador'])
});

export const respuestaContactoSchema = z.object({
  respuesta: z
    .string()
    .trim()
    .min(10, 'La respuesta debe contener al menos 10 caracteres')
    .max(2000, 'La respuesta no puede superar los 2000 caracteres')
});

/**
 * Ejecuta un esquema de Zod y devuelve { ok: true, datos } o { ok: false, error }.
 */
export function validarConEsquema(esquema, valores) {
  const resultado = esquema.safeParse(valores);
  if (!resultado.success) {
    const primerMensaje = resultado.error.issues[0]?.message || 'Revisá los campos del formulario';
    return { ok: false, error: primerMensaje };
  }
  return { ok: true, datos: resultado.data };
}
