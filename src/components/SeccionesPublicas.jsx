import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProyectosAPI from './ProyectosAPI';
import {
  loginSchema,
  registroSchema,
  contactoSchema,
  validarConEsquema,
  validarArchivoAdjunto
} from '../utils/validaciones';
import {
  anime,
  animarHoverTarjeta,
  animarScrollRevealGSAP,
  yaFueAnimada,
  marcarComoAnimada
} from '../utils/animaciones';
import { ShinyText } from './ReactBitsEffects';
import EquipoTrabajoGrid from './EquipoLOTUS';

// =====================================================================
// 1. PRESENTACIÓN PROFESIONAL (Perfil, Stack Full-Stack, Servicios y Experiencia)
// =====================================================================
export function PresentacionProfesional({ pedirAPI }) {
  const [servicios, setServicios] = useState([]);
  const [cargandoServicios, setCargandoServicios] = useState(true);
  const perfilRef = useRef(null);

  const stackCategorias = [
    {
      area: 'Frontend & UI/UX',
      descripcion: 'Interfaces SPA reactivas con Glassmorphism multicapa, smooth scroll, animaciones cinéticas y visualización de datos.',
      tecnologias: ['React 19', 'Tailwind CSS', 'GSAP & ScrollTrigger', 'Lenis Smooth Scroll', 'React Bits Glass UI', 'Anime.js', 'Recharts', 'Zod']
    },
    {
      area: 'Backend & APIs REST',
      descripcion: 'Arquitectura en capas (Routes, Controllers, Models), transacciones ACID y envío de correos transaccionales.',
      tecnologias: ['Node.js', 'Express', 'REST API', 'Nodemailer', 'CORS', 'Dotenv', 'Scrypt Auth']
    },
    {
      area: 'Base de Datos Relacional',
      descripcion: 'Modelado normalizado en 3FN, integridad referencial (CASCADE / RESTRICT), consultas parametrizadas y RLS.',
      tecnologias: ['PostgreSQL', 'Supabase', 'Driver pg (Pool)', 'SQL Parametrizado', 'Row Level Security']
    },
    {
      area: 'QA, Testing & Cloud Deploy',
      descripcion: 'Control de versiones distribuido, pruebas de endpoints y despliegue continuo en la nube.',
      tecnologias: ['Git & GitHub', 'Postman', 'Jest', 'Vercel (Frontend)', 'Render (Backend)']
    }
  ];

  const experiencia = [
    {
      periodo: '2026 - Presente',
      rol: 'Desarrollo Full-Stack en Arquitectura de 3 Capas',
      hito: 'Diseño e implementación de plataforma SPA en React conectada a API REST en Express y PostgreSQL (Supabase) con panel administrativo y analítica en tiempo real.'
    },
    {
      periodo: '2025 - 2026',
      rol: 'Modelado de Bases de Datos Relacionales & APIs',
      hito: 'Normalización de esquemas SQL, resolución de relaciones N:M, claves foráneas con integridad referencial y prevención de inyección SQL.'
    },
    {
      periodo: '2024 - 2025',
      rol: 'Diseño UI/UX & Maquetación Web Responsiva',
      hito: 'Prototipado de alta fidelidad en Figma, sistemas de diseño oscuros (Dark Mode) y accesibilidad web WCAG.'
    }
  ];

  useEffect(() => {
    pedirAPI('/servicios')
      .then((lista) => setServicios(lista.filter((s) => s.activo)))
      .catch(() => {})
      .finally(() => setCargandoServicios(false));
  }, [pedirAPI]);

  // Orquestación de entrada + Scroll Reveal GSAP (solo la primera visita a /perfil)
  useLayoutEffect(() => {
    const scope = perfilRef.current;
    if (!scope || yaFueAnimada('vista-perfil-hero')) return undefined;

    const tl = anime.timeline({
      easing: 'cubicBezier(0.22, 1, 0.36, 1)',
      duration: 580,
      root: scope
    });

    tl.add({
      targets: '.perfil-hero-card',
      translateY: [18, 0],
      opacity: [0, 1]
    }).add(
      {
        targets: '.perfil-hero-item',
        translateY: [14, 0],
        opacity: [0, 1],
        delay: anime.stagger(55)
      },
      '-=440'
    );

    const limpiarGSAP = animarScrollRevealGSAP(scope, [
      { selector: '.team-animada', y: 18, staggerDelay: 0.06 },
      { selector: '.stack-card', y: 20, staggerDelay: 0.06 },
      { selector: '.experiencia-card', y: 18, staggerDelay: 0.06 }
    ]);

    const timerMarca = setTimeout(() => {
      marcarComoAnimada('vista-perfil-hero');
    }, 180);

    return () => {
      clearTimeout(timerMarca);
      tl.revert();
      limpiarGSAP();
    };
  }, []);

  // Cascada escalonada una sola vez cuando cargan los servicios ofertados desde Supabase
  useLayoutEffect(() => {
    if (cargandoServicios || servicios.length === 0 || yaFueAnimada('vista-perfil-servicios')) {
      return undefined;
    }
    const scope = perfilRef.current;
    if (!scope) return undefined;

    const tl = anime.timeline({
      easing: 'cubicBezier(0.22, 1, 0.36, 1)',
      duration: 540,
      root: scope
    });

    tl.add({
      targets: '.servicio-publico-card',
      translateY: [18, 0],
      opacity: [0, 1],
      delay: anime.stagger(55)
    });

    const timerMarca = setTimeout(() => {
      marcarComoAnimada('vista-perfil-servicios');
    }, 180);

    return () => {
      clearTimeout(timerMarca);
      tl.revert();
    };
  }, [cargandoServicios, servicios.length]);

  return (
    <div ref={perfilRef} className="max-w-5xl mx-auto px-5 py-12">
      {/* Encabezado de Perfil Profesional */}
      <div
        className="card-proyecto perfil-hero-card mb-12"
        style={{ willChange: 'transform, opacity' }}
      >
        <div className="perfil-hero-item mb-3" style={{ willChange: 'transform, opacity' }}>
          <span className="hero-lotus-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3C14.5 7.5 16 11.5 12 19C8 11.5 9.5 7.5 12 3Z" />
              <path d="M12 19C7.5 15.5 5 11 6 6.5C9 8.5 11 12.5 12 19Z" />
              <path d="M12 19C16.5 15.5 19 11 18 6.5C15 8.5 13 12.5 12 19Z" />
            </svg>
            <ShinyText speed={4.2}>Presentación Profesional</ShinyText>
          </span>
        </div>
        <h1
          className="perfil-hero-item text-3xl md:text-4xl font-extrabold mt-2 mb-4 tracking-tight text-white"
          style={{ willChange: 'transform, opacity' }}
        >
          Equipo <span className="text-gradient">LOTUS.</span>
        </h1>
        <p
          className="perfil-hero-item text-gray-300 leading-relaxed mb-6 max-w-3xl"
          style={{ willChange: 'transform, opacity' }}
        >
          Team Developers Full-Stack especializados en la construcción de aplicaciones web modernas. Nuestro enfoque combina <strong className="text-white">Diseño UI/UX</strong> de
          alto impacto con bases de datos íntegras, seguras y escalables.
        </p>
        <div
          className="perfil-hero-item flex flex-wrap gap-3"
          style={{ willChange: 'transform, opacity' }}
        >
          <Link to="/repositorios" className="btn-primario">
            <span>Explorar Proyectos y Demos</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
          <Link to="/contacto" className="btn-secundario-outline" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
            Solicitar Cotización / Asesoría
          </Link>
        </div>
      </div>

      {/* Integrantes del Equipo LOTUS (Revelado interactivo de foto en hover) */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-5">
        <h2 className="text-2xl font-bold tracking-tight text-white">Integrantes del Equipo</h2>
      </div>
      <div className="mb-14">
        <EquipoTrabajoGrid />
      </div>

      {/* Stack Tecnológico Full-Stack */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">Stack Tecnológico Full-Stack</h2>
      </div>
      <div className="grid-proyectos mb-14">
        {stackCategorias.map((item, idx) => (
          <div
            key={item.area}
            className="card-proyecto stack-card flex flex-col justify-between"
            style={{ willChange: 'transform, opacity' }}
            onMouseEnter={(e) => animarHoverTarjeta(e, true)}
            onMouseLeave={(e) => animarHoverTarjeta(e, false)}
          >
            <div>
              <div className="icon-badge" aria-hidden="true">
                {idx === 0 && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                )}
                {idx === 1 && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                )}
                {idx === 2 && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                  </svg>
                )}
                {idx === 3 && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">{item.area}</h3>
              <p className="text-sm text-gray-400 mb-4">{item.descripcion}</p>
            </div>
            <div className="flex flex-wrap gap-1 pt-2 border-t border-white/10">
              {item.tecnologias.map((t) => (
                <span key={t} className="tag-tecnologia">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Servicios Ofertados (Sincronizados con Supabase) */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">Servicios Profesionales Ofertados</h2>
      </div>
      {cargandoServicios ? (
        <div className="cargando-api">Cargando catálogo de servicios...</div>
      ) : (
        <div className="grid-proyectos mb-14">
          {servicios.map((srv) => (
            <div
              key={srv.id}
              className="card-proyecto servicio-publico-card flex flex-col justify-between"
              style={{ willChange: 'transform, opacity' }}
              onMouseEnter={(e) => animarHoverTarjeta(e, true)}
              onMouseLeave={(e) => animarHoverTarjeta(e, false)}
            >
              <div>
                <span className="tag-tecnologia">{srv.categoria}</span>
                <h3 className="text-white">{srv.nombre}</h3>
                <p>{srv.descripcion}</p>
              </div>
              <div className="pt-4 mt-2 border-t border-white/10 flex items-center justify-between gap-3">
                <span className="text-sm text-gray-300 tabular-nums">
                  Desde <strong className="text-indigo-400 text-base font-bold">USD ${srv.precio_desde}</strong>
                </span>
                <Link to="/contacto" className="btn-secundario-outline">
                  Consultar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trayectoria y Experiencia */}
      <h2 className="text-2xl font-bold mb-6 tracking-tight text-white">Experiencia y Metodología</h2>
      <div className="grid gap-5">
        {experiencia.map((exp) => (
          <div
            key={exp.periodo}
            className="card-proyecto experiencia-card"
            style={{ padding: '24px 28px', willChange: 'transform, opacity' }}
            onMouseEnter={(e) => animarHoverTarjeta(e, true)}
            onMouseLeave={(e) => animarHoverTarjeta(e, false)}
          >
            <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
              <h3 style={{ marginBottom: 0, fontSize: '1.18rem' }} className="text-white">{exp.rol}</h3>
              <span className="tag-tecnologia tabular-nums" style={{ marginBottom: 0, color: '#f472b6', borderColor: 'rgba(236, 72, 153, 0.35)' }}>
                <span className="status-dot" style={{ background: '#ec4899' }} />
                {exp.periodo}
              </span>
            </div>
            <p style={{ marginBottom: 0 }}>{exp.hito}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================================
// 2. FORMULARIO DE CONTACTO (Con validación Zod + Archivo + Nodemailer en Backend)
// =====================================================================
export function FormularioContacto({ pedirAPI }) {
  const animarPrimeraVisitaRef = useRef(!yaFueAnimada('vista-contacto'));
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [tipoConsulta, setTipoConsulta] = useState('Consulta General');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [archivo, setArchivo] = useState(null);

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => marcarComoAnimada('vista-contacto'), 180);
    return () => clearTimeout(timer);
  }, []);

  const manejarCambioArchivo = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setArchivo(null);
      return;
    }
    const validacion = validarArchivoAdjunto(file);
    if (!validacion.ok) {
      setError(validacion.error);
      e.target.value = '';
      setArchivo(null);
      return;
    }
    setError(null);
    setArchivo(file);
  };

  const enviarFormulario = async (e) => {
    e.preventDefault();
    setError(null);
    setExito(null);

    const validacionTexto = validarConEsquema(contactoSchema, {
      nombre,
      email,
      tipo_consulta: tipoConsulta,
      asunto,
      mensaje
    });
    if (!validacionTexto.ok) {
      setError(validacionTexto.error);
      return;
    }

    const validacionArchivo = validarArchivoAdjunto(archivo);
    if (!validacionArchivo.ok) {
      setError(validacionArchivo.error);
      return;
    }

    setEnviando(true);
    try {
      await pedirAPI('/contactos', {
        method: 'POST',
        body: JSON.stringify({
          ...validacionTexto.datos,
          adjunto_nombre: validacionArchivo.nombre
        })
      });
      setExito(
        '¡Tu mensaje fue enviado con éxito! Se procesó la notificación por email (Nodemailer) y quedó registrado en el panel de administración.'
      );
      setNombre('');
      setEmail('');
      setAsunto('');
      setMensaje('');
      setArchivo(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={`${animarPrimeraVisitaRef.current ? 'animar-entrada ' : ''}max-w-3xl mx-auto px-5 py-12`}>
      <div className="card-proyecto">
        <div className="icon-badge" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <span className="tag-tecnologia">Contacto Directo &amp; Presupuestos</span>
        <h1 className="text-3xl font-bold mb-2 tracking-tight text-white">Formulario de Contacto</h1>
        <p className="mb-6">
          Enviá tu consulta, solicitud de cotización o pedido de asesoría técnica y te responderemos a la brevedad.
        </p>

        {error && (
          <div
            role="alert"
            className="mb-5 p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 text-sm flex items-start gap-3"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-red-400" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <strong className="text-red-400">Validación:</strong> {error}
            </div>
          </div>
        )}

        {exito && (
          <div
            role="status"
            className="mb-5 p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-sm flex items-start gap-3"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-emerald-400" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <div>{exito}</div>
          </div>
        )}

        <form onSubmit={enviarFormulario} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contacto-nombre" className="label-form">Nombre y apellido</label>
              <input
                id="contacto-nombre"
                type="text"
                placeholder="Ej. Eugenia Loto"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="input-form"
                disabled={enviando}
              />
            </div>
            <div>
              <label htmlFor="contacto-email" className="label-form">Correo</label>
              <input
                id="contacto-email"
                type="email"
                placeholder="nombre@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-form"
                disabled={enviando}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contacto-motivo" className="label-form">Motivo</label>
              <select
                id="contacto-motivo"
                value={tipoConsulta}
                onChange={(e) => setTipoConsulta(e.target.value)}
                className="input-form"
                disabled={enviando}
              >
                <option value="Consulta General">Consulta General</option>
                <option value="Cotización">Cotización de Proyecto</option>
                <option value="Asesoría Técnica">Asesoría Técnica</option>
              </select>
            </div>
            <div>
              <label htmlFor="contacto-asunto" className="label-form">Asunto (mín. 5 caracteres)</label>
              <input
                id="contacto-asunto"
                type="text"
                placeholder="Ej. Desarrollo de aplicación web"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                className="input-form"
                disabled={enviando}
              />
            </div>
          </div>

          <div>
            <label htmlFor="contacto-mensaje" className="label-form">
              Descripción (mín. 15 caracteres)
            </label>
            <textarea
              id="contacto-mensaje"
              rows={4}
              placeholder="Describí los objetivos de tu consulta aqui."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              className="input-form"
              style={{ resize: 'vertical' }}
              disabled={enviando}
            />
          </div>

          <div className="mb-5">
            <label htmlFor="contacto-archivo" className="label-form">
              Adjuntar especificación o captura (Archivos: .pdf, .png, .jpg, .webp, .doc, .docx — máx. 5 MB)
            </label>
            <input
              id="contacto-archivo"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
              onChange={manejarCambioArchivo}
              className="input-form"
              style={{ padding: '10px 14px', marginBottom: '6px' }}
              disabled={enviando}
            />
            {archivo && (
              <span className="text-xs text-indigo-400 font-medium inline-flex items-center gap-1.5">
                <span className="status-dot" style={{ background: '#4ade80' }} />
                Archivo validado: {archivo.name} ({(archivo.size / 1024).toFixed(1)} KB)
              </span>
            )}
          </div>

          <button type="submit" className="btn-primario" disabled={enviando}>
            <span>{enviando ? 'Enviando mensaje...' : 'Enviar Mensaje por Email'}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

// =====================================================================
// 3. MÓDULO DE AUTENTICACIÓN
// =====================================================================
export function ModuloAuth({ pedirAPI, onAutenticado, tituloPersonalizado }) {
  const animarPrimeraVisitaRef = useRef(!yaFueAnimada('vista-login'));
  const [modo, setModo] = useState('login'); // 'login' | 'registro'
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => marcarComoAnimada('vista-login'), 180);
    return () => clearTimeout(timer);
  }, []);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (modo === 'login') {
      const val = validarConEsquema(loginSchema, { email, password });
      if (!val.ok) {
        setError(val.error);
        return;
      }
      setEnviando(true);
      try {
        const res = await pedirAPI('/usuarios/login', {
          method: 'POST',
          body: JSON.stringify(val.datos)
        });
        onAutenticado(res.usuario);
      } catch (err) {
        setError(err.message);
      } finally {
        setEnviando(false);
      }
    } else {
      const val = validarConEsquema(registroSchema, { nombre, email, password });
      if (!val.ok) {
        setError(val.error);
        return;
      }
      setEnviando(true);
      try {
        const res = await pedirAPI('/usuarios/registro', {
          method: 'POST',
          body: JSON.stringify(val.datos)
        });
        onAutenticado(res.usuario);
      } catch (err) {
        setError(err.message);
      } finally {
        setEnviando(false);
      }
    }
  };

  const accesoRapidoRol = async (emailDemo, passDemo) => {
    setError(null);
    setEnviando(true);
    try {
      const res = await pedirAPI('/usuarios/login', {
        method: 'POST',
        body: JSON.stringify({
          email: emailDemo,
          password: passDemo
        })
      });
      onAutenticado(res.usuario);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={`${animarPrimeraVisitaRef.current ? 'animar-entrada ' : ''}max-w-md mx-auto px-5 py-14`}>
      <div className="card-proyecto">
        <div className="icon-badge" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <span className="tag-tecnologia" style={{ color: '#f472b6', borderColor: 'rgba(236, 72, 153, 0.35)' }}>
          <span className="status-dot" style={{ background: '#ec4899' }} />
          Acceso Exclusivo para Usuarios Registrados
        </span>
        <h2 className="text-2xl font-bold mb-2 tracking-tight text-white">
          {tituloPersonalizado || (modo === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta de Visitante')}
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          Registrate o iniciá sesión para desbloquear el catálogo completo de Proyectos, Demos interactivas y
          repositorios técnicos.
        </p>

        <div className="flex gap-2 mb-6" role="tablist" aria-label="Modo de autenticación">
          <button
            type="button"
            role="tab"
            aria-selected={modo === 'login'}
            onClick={() => {
              setModo('login');
              setError(null);
            }}
            className={`admin-tab flex-1 justify-center ${modo === 'login' ? 'admin-tab-activo' : ''}`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={modo === 'registro'}
            onClick={() => {
              setModo('registro');
              setError(null);
            }}
            className={`admin-tab flex-1 justify-center ${modo === 'registro' ? 'admin-tab-activo' : ''}`}
          >
            Registrarse
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 p-3.5 rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 text-xs flex items-start gap-2.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-red-400" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={manejarSubmit} noValidate>
          {modo === 'registro' && (
            <div>
              <label htmlFor="auth-nombre" className="label-form">Nombre y apellido *</label>
              <input
                id="auth-nombre"
                type="text"
                placeholder="Ej. Ana Martínez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="input-form"
                disabled={enviando}
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="label-form">Correo electrónico</label>
            <input
              id="auth-email"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-form"
              disabled={enviando}
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="label-form">
              Contraseña {modo === 'registro' ? '(mín. 6 caracteres, letras y números) *' : '*'}
            </label>
            <input
              id="auth-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-form"
              disabled={enviando}
            />
          </div>

          <button type="submit" className="btn-primario w-full text-center" disabled={enviando}>
            {enviando
              ? 'Verificando...'
              : modo === 'login'
              ? 'Ingresar a Proyectos y Demos'
              : 'Crear Cuenta e Ingresar'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-xs text-gray-400 mb-3 font-medium">
            'Simulacion de roles'
          </p>
          <div className="grid grid-cols-1 gap-2.5">
            <button
              type="button"
              onClick={() => accesoRapidoRol('sofia.mendez@empresa.com', 'ClienteLotus2026')}
              disabled={enviando}
              className="btn-secundario-outline w-full"
            >
              <span className="status-dot" style={{ background: '#38bdf8' }} />
              <span>Ingresar como cliente</span>
            </button>
            <button
              type="button"
              onClick={() => accesoRapidoRol('lucas.colque@lotus.dev', 'AdminLotus2026')}
              disabled={enviando}
              className="btn-secundario-outline w-full"
              style={{ borderColor: 'rgba(236, 72, 153, 0.45)', color: '#f9a8d4' }}
            >
              <span className="status-dot" style={{ background: '#ec4899' }} />
              <span>Ingresar como administrador</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 4. SECCIÓN PROTEGIDA DE PROYECTOS Y DEMOS
// =====================================================================
export function SeccionProyectosProtegida({ usuarioActual, onAutenticado, pedirAPI }) {
  const [proyectosDB, setProyectosDB] = useState([]);
  const [demosDB, setDemosDB] = useState([]);
  const [cargando, setCargando] = useState(true);
  const catalogoRef = useRef(null);

  useEffect(() => {
    if (!usuarioActual) return;
    setCargando(true);
    Promise.all([pedirAPI('/proyectos'), pedirAPI('/demos')])
      .then(([proys, dms]) => {
        setProyectosDB(proys);
        setDemosDB(dms);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [usuarioActual, pedirAPI]);

  // Orquestación en cascada una sola vez cuando terminan de cargar Proyectos y Demos
  useLayoutEffect(() => {
    if (!usuarioActual || cargando || yaFueAnimada('vista-repos-catalogo')) {
      return undefined;
    }
    const scope = catalogoRef.current;
    if (!scope) return undefined;

    const tl = anime.timeline({
      easing: 'cubicBezier(0.22, 1, 0.36, 1)',
      duration: 560,
      root: scope
    });

    tl.add({
      targets: '.sesion-banner',
      translateY: [-10, 0],
      opacity: [0, 1]
    })
      .add(
        {
          targets: '.proyecto-db-card',
          translateY: [18, 0],
          opacity: [0, 1],
          delay: anime.stagger(55)
        },
        '-=420'
      )
      .add(
        {
          targets: '.demo-db-card',
          translateY: [18, 0],
          opacity: [0, 1],
          delay: anime.stagger(55)
        },
        '-=380'
      );

    const timerMarca = setTimeout(() => {
      marcarComoAnimada('vista-repos-catalogo');
    }, 180);

    return () => {
      clearTimeout(timerMarca);
      tl.revert();
    };
  }, [usuarioActual, cargando]);

  if (!usuarioActual) {
    return (
      <ModuloAuth
        pedirAPI={pedirAPI}
        onAutenticado={onAutenticado}
        tituloPersonalizado="Sección Protegida: Proyectos y Demos"
      />
    );
  }

  return (
    <div ref={catalogoRef} className="max-w-5xl mx-auto px-5 py-10">
      <div
        className="card-proyecto sesion-banner mb-10 flex flex-wrap justify-between items-center gap-4"
        style={{ padding: '22px 28px', willChange: 'transform, opacity' }}
      >
        <div>
          <span className="tag-tecnologia" style={{ color: '#4ade80', borderColor: 'rgba(74, 222, 128, 0.35)', marginBottom: '8px' }}>
            <span className="status-dot" style={{ background: '#4ade80' }} />
            Sesión Activa • {usuarioActual.rol}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Bienvenido/a, {usuarioActual.nombre}
          </h1>
          <p style={{ marginBottom: 0, fontSize: '0.9rem' }}>
            Tenés acceso completo al catálogo de Proyectos en PostgreSQL, Demos interactivas y Repositorios de GitHub.
          </p>
        </div>
      </div>

      {/* Proyectos y Demos almacenados en Supabase */}
      <h2 className="text-2xl font-bold mb-5 tracking-tight text-white">Proyectos Destacados (Base de Datos Supabase)</h2>
      {cargando ? (
        <div className="cargando-api">Cargando proyectos y demos desde PostgreSQL...</div>
      ) : (
        <>
          <div className="grid-proyectos mb-12">
            {proyectosDB.map((proy) => (
              <div
                key={proy.id}
                className="card-proyecto proyecto-db-card flex flex-col justify-between"
                style={{ willChange: 'transform, opacity' }}
                onMouseEnter={(e) => animarHoverTarjeta(e, true)}
                onMouseLeave={(e) => animarHoverTarjeta(e, false)}
              >
                <div>
                  <h3 className="text-white">{proy.titulo}</h3>
                  <div className="mt-2">
                    {proy.tecnologias.map((tec) => (
                      <span key={tec.id} className="tag-tecnologia">
                        {tec.nombre}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-gray-400">Estado actual</span>
                  <span className="tag-tecnologia" style={{ marginBottom: 0, color: '#a5b4fc' }}>
                    <span className="status-dot" style={{ background: '#6366f1' }} />
                    {proy.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-5 tracking-tight text-white">Demos Interactivas</h2>
          <div className="grid-proyectos mb-14">
            {demosDB.map((demo) => (
              <div
                key={demo.id}
                className="card-proyecto demo-db-card flex flex-col justify-between"
                style={{ willChange: 'transform, opacity' }}
                onMouseEnter={(e) => animarHoverTarjeta(e, true)}
                onMouseLeave={(e) => animarHoverTarjeta(e, false)}
              >
                <div>
                  <span className="tag-tecnologia">
                    {demo.proyecto_titulo ? `Proyecto: ${demo.proyecto_titulo}` : 'Demo Independiente'}
                  </span>
                  <h3 className="text-white mt-1">{demo.titulo}</h3>
                  <p>{demo.descripcion || 'Demostración funcional en vivo.'}</p>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <a
                    href={demo.url_demo}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primario"
                    style={{ padding: '9px 18px', fontSize: '0.85rem' }}
                  >
                    <span>Probar Demo en Vivo</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Repositorios en Tiempo Real desde GitHub API */}
      <ProyectosAPI />
    </div>
  );
}
