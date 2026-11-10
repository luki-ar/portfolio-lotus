import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  GestionDemos,
  GestionServicios,
  PanelUsuarios,
  GestionContactos,
  DashboardMetricas
} from './components/AdminModulos';
import {
  PresentacionProfesional,
  FormularioContacto,
  ModuloAuth,
  SeccionProyectosProtegida
} from './components/SeccionesPublicas';
import ProtectedRoute, {
  AuthContext,
  useAuth,
  verificarEsAdmin
} from './components/ProtectedRoute';
import {
  proyectoSchema,
  validarConEsquema,
  validarArchivoAdjunto
} from './utils/validaciones';
import { anime, animarHoverTarjeta } from './utils/animaciones';
import './App.css';

// Watermark ambiental de Flor de Loto (Identidad Visual Obsidian Botanical)
function LotusWatermark() {
  return (
    <div className="lotus-watermark-bg" aria-hidden="true">
      <svg
        className="lotus-watermark-svg"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lotusGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        {/* Anillos geométricos orbitales */}
        <circle cx="200" cy="210" r="165" stroke="url(#lotusGradPrimary)" strokeWidth="0.9" strokeDasharray="5 7" />
        <circle cx="200" cy="210" r="128" stroke="url(#lotusGradPrimary)" strokeWidth="0.7" opacity="0.65" />
        {/* Pétalo central de la Flor de Loto */}
        <path
          d="M200 62C228 114 246 164 200 264C154 164 172 114 200 62Z"
          stroke="url(#lotusGradPrimary)"
          strokeWidth="1.8"
          fill="url(#lotusGradPrimary)"
          fillOpacity="0.06"
        />
        {/* Pétalos medios (Izquierda y Derecha) */}
        <path
          d="M200 264C144 218 112 156 126 98C164 126 188 176 200 264Z"
          stroke="url(#lotusGradPrimary)"
          strokeWidth="1.5"
          fill="url(#lotusGradPrimary)"
          fillOpacity="0.04"
        />
        <path
          d="M200 264C256 218 288 156 274 98C236 126 212 176 200 264Z"
          stroke="url(#lotusGradPrimary)"
          strokeWidth="1.5"
          fill="url(#lotusGradPrimary)"
          fillOpacity="0.04"
        />
        {/* Pétalos exteriores abiertos */}
        <path
          d="M200 264C122 246 76 196 68 140C118 150 162 190 200 264Z"
          stroke="url(#lotusGradPrimary)"
          strokeWidth="1.3"
        />
        <path
          d="M200 264C278 246 324 196 332 140C282 150 238 190 200 264Z"
          stroke="url(#lotusGradPrimary)"
          strokeWidth="1.3"
        />
        {/* Base de cáliz / reflejo de agua */}
        <path
          d="M92 276C136 296 264 296 308 276"
          stroke="url(#lotusGradPrimary)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M128 298C164 310 236 310 272 298"
          stroke="url(#lotusGradPrimary)"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
    </div>
  );
}

function Inicio() {
  const inicioRef = useRef(null);

  const equipo = [
    { nombre: 'Lucas Colque', rol: 'QA & Testing', habilidades: ['Postman', 'Git', 'Jest'] },
    { nombre: 'Mauricio Navarro', rol: 'Backend Developer', habilidades: ['Node.js', 'Python', 'Express'] },
    { nombre: 'Gabriel Vargas', rol: 'Database Admin', habilidades: ['PostgreSQL', 'Supabase', 'SQL'] },
    { nombre: 'Pilar Alvarado', rol: 'Frontend & UI/UX', habilidades: ['React', 'CSS', 'APIs'] }
  ];

  // Orquestación de múltiples etapas con anime.timeline(), spring(1, 80, 10, 0) y anime.stagger()
  useLayoutEffect(() => {
    const scope = inicioRef.current;
    if (!scope) return;

    const tl = anime.timeline({
      easing: 'spring(1, 80, 10, 0)',
      duration: 1000,
      root: scope
    });

    tl.add({
      targets: '.hero-badge',
      translateY: [-28, 0],
      scale: [0.85, 1],
      opacity: [0, 1]
    })
      .add(
        {
          targets: '.hero-title-part',
          translateY: [55, 0],
          scale: [0.94, 1],
          opacity: [0, 1],
          delay: anime.stagger(110)
        },
        '-=820'
      )
      .add(
        {
          targets: '.hero-cta-btn',
          translateY: [32, 0],
          scale: [0.92, 1],
          opacity: [0, 1],
          delay: anime.stagger(100)
        },
        '-=760'
      )
      .add(
        {
          targets: '.seccion-header',
          translateX: [-24, 0],
          opacity: [0, 1],
          easing: 'cubicBezier(0.22, 1, 0.36, 1)',
          delay: anime.stagger(120)
        },
        '-=740'
      )
      .add(
        {
          targets: '.card-animada',
          translateY: [50, 0],
          scale: [0.93, 1],
          opacity: [0, 1],
          delay: anime.stagger(120)
        },
        '-=680'
      )
      .add(
        {
          targets: '.team-animada',
          translateY: [45, 0],
          scale: [0.94, 1],
          opacity: [0, 1],
          delay: anime.stagger(105, { from: 'center' })
        },
        '-=700'
      );

    return () => tl.revert();
  }, []);

  return (
    <div ref={inicioRef}>
      <section className="hero-section">
        <div className="hero-elemento hero-badge mb-5" style={{ willChange: 'transform, opacity' }}>
          <span className="hero-lotus-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3C14.5 7.5 16 11.5 12 19C8 11.5 9.5 7.5 12 3Z" />
              <path d="M12 19C7.5 15.5 5 11 6 6.5C9 8.5 11 12.5 12 19Z" />
              <path d="M12 19C16.5 15.5 19 11 18 6.5C15 8.5 13 12.5 12 19Z" />
            </svg>
            <span>Lotus Engineering • Arquitectura Full-Stack en 3 Capas</span>
          </span>
        </div>
        <h1 className="hero-title">
          <span
            className="hero-elemento hero-title-part inline-block"
            style={{ willChange: 'transform, opacity' }}
          >
            Construyendo experiencias digitales{' '}
          </span>
          <span
            className="hero-elemento hero-title-part text-gradient inline-block"
            style={{ willChange: 'transform, opacity' }}
          >
            increíbles.
          </span>
        </h1>
        <p
          className="hero-subtitle hero-elemento hero-title-part"
          style={{ willChange: 'transform, opacity' }}
        >
          Ingenieros en informática con conocimientos basados en React, APIs RESTful en Node.js/Express y persistencia relacional en PostgreSQL, diseñada bajo estándares de alta precisión visual y rendimiento.
        </p>
        <div className="flex flex-wrap justify-center gap-3" style={{ marginTop: '32px' }}>
          <Link
            to="/repositorios"
            className="btn-primario hero-elemento hero-cta-btn"
            style={{ willChange: 'transform, opacity' }}
          >
            <span>Ver Trabajos</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
          <Link
            to="/perfil"
            className="btn-secundario-outline hero-elemento hero-cta-btn"
            style={{ padding: '12px 24px', fontSize: '0.95rem', willChange: 'transform, opacity' }}
          >
            Conocer Nuestro Stack
          </Link>
        </div>
      </section>

      <div className="seccion-contenedor">
        <div
          className="seccion-header flex items-center justify-between flex-wrap gap-2 mb-7"
          style={{ willChange: 'transform, opacity' }}
        >
          <h2 style={{ fontSize: '1.55rem', fontWeight: 700, letterSpacing: '-0.02em' }} className="text-white">
            Enfoque Técnico
          </h2>
        </div>
        <div className="grid-proyectos">
          <div
            className="card-proyecto card-animada flex flex-col justify-between"
            style={{ willChange: 'transform, opacity' }}
            onMouseEnter={(e) => animarHoverTarjeta(e, true)}
            onMouseLeave={(e) => animarHoverTarjeta(e, false)}
          >
            <div>
              <div className="icon-badge" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19l7-7 3 3-7 7-3-3z" />
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  <path d="M2 2l7.586 7.586" />
                  <circle cx="11" cy="11" r="2" />
                </svg>
              </div>
              <h3 className="text-white">UI/UX Design en Figma</h3>
              <p>Diseños estáticos y dinámicos creados a medida para el cliente, con prototipos funcionales, respetando jerarquía visual y estados de componentes.</p>
            </div>
            <div className="pt-3 border-t border-white/10">
              <span className="tag-tecnologia">Figma</span>
              <span className="tag-tecnologia">UI/UX</span>
            </div>
          </div>
          <div
            className="card-proyecto card-animada flex flex-col justify-between"
            style={{ willChange: 'transform, opacity' }}
            onMouseEnter={(e) => animarHoverTarjeta(e, true)}
            onMouseLeave={(e) => animarHoverTarjeta(e, false)}
          >
            <div>
              <div className="icon-badge" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3 className="text-white">APIs en Tiempo Real</h3>
              <p>Consumo asíncrono robusto gestionando estados de carga y manejo de errores para una experiencia sin interrupciones.</p>
            </div>
            <div className="pt-3 border-t border-white/10">
              <span className="tag-tecnologia">Fetch API</span>
              <span className="tag-tecnologia">JSON</span>
            </div>
          </div>
          <div
            className="card-proyecto card-animada flex flex-col justify-between"
            style={{ willChange: 'transform, opacity' }}
            onMouseEnter={(e) => animarHoverTarjeta(e, true)}
            onMouseLeave={(e) => animarHoverTarjeta(e, false)}
          >
            <div>
              <div className="icon-badge" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <h3 className="text-white">Arquitectura Limpia</h3>
              <p>Código modular, reutilización de componentes y bases sólidas preparadas para conectar con PostgreSQL.</p>
            </div>
            <div className="pt-3 border-t border-white/10">
              <span className="tag-tecnologia">Clean Code</span>
              <span className="tag-tecnologia">Git</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1050px', margin: '0 auto', padding: '0 20px 80px' }}>
        <div
          className="seccion-header flex items-center justify-between flex-wrap gap-2 mb-7"
          style={{ willChange: 'transform, opacity' }}
        >
          <h2 style={{ fontSize: '1.55rem', fontWeight: 700, letterSpacing: '-0.02em' }} className="text-white">
            Equipo de Trabajo
          </h2>
          <span className="text-gradient">LOTUS.</span>
        </div>
        <div className="grid-proyectos">
          {equipo.map((miembro, index) => (
            <div
              key={index}
              className="card-proyecto team-animada flex flex-col justify-between"
              style={{ willChange: 'transform, opacity' }}
              onMouseEnter={(e) => animarHoverTarjeta(e, true)}
              onMouseLeave={(e) => animarHoverTarjeta(e, false)}
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="icon-badge"
                    style={{ marginBottom: 0, width: '38px', height: '38px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem' }}
                    aria-hidden="true"
                  >
                    {miembro.nombre.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 style={{ marginBottom: '2px', fontSize: '1.15rem' }} className="text-white">{miembro.nombre}</h3>
                    <p style={{ color: 'var(--accent-3)', fontSize: '0.84rem', fontWeight: '600', marginBottom: 0 }}>
                      {miembro.rol}
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-white/10">
                {miembro.habilidades.map((hab, i) => (
                  <span key={i} className="tag-tecnologia">{hab}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// URL base del backend. Se puede sobrescribir con REACT_APP_API_URL en un archivo .env
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
const ESTADOS = ['Nuevo Avance', 'En proceso', 'Deployado'];

// Helper: hace la petición y lanza un Error con el mensaje que devuelve la API si falla.
async function pedirAPI(ruta, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones
    });
  } catch (err) {
    throw new Error('No se pudo conectar con el servidor. Verificá que el backend esté corriendo en el puerto 4000.');
  }
  if (respuesta.status === 204) return null; // DELETE exitoso: sin contenido
  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    throw new Error(datos?.error || `Error ${respuesta.status} al comunicarse con el servidor`);
  }
  return datos;
}

function GestionProyectos({ seccionInicial = 'proyectos' }) {
  const [seccionActiva, setSeccionActiva] = useState(seccionInicial);
  const [refrescarDashboard, setRefrescarDashboard] = useState(0);

  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);

  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaTec, setNuevaTec] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState(ESTADOS[0]);
  const [archivoPortada, setArchivoPortada] = useState(null);

  useEffect(() => {
    setSeccionActiva(seccionInicial);
  }, [seccionInicial]);

  const notificarCambio = () => setRefrescarDashboard((n) => n + 1);

  // READ: al montar el componente se piden los proyectos al backend (GET).
  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        setProyectos(await pedirAPI('/proyectos'));
      } catch (err) {
        setError(err.message === 'Failed to fetch'
          ? 'No se pudo conectar con el servidor. ¿Está corriendo el backend?'
          : err.message);
      } finally {
        setCargando(false);
      }
    };
    cargarProyectos();
  }, []);

  // CREATE: valida con Zod + archivo opcional, envía al backend (POST) y actualiza la lista.
  const agregarProyecto = async (e) => {
    e.preventDefault();
    setError(null);

    const valTexto = validarConEsquema(proyectoSchema, {
      titulo: nuevoTitulo,
      tecnologias: nuevaTec,
      estado: nuevoEstado
    });
    if (!valTexto.ok) {
      setError(valTexto.error);
      return;
    }

    const valArchivo = validarArchivoAdjunto(archivoPortada);
    if (!valArchivo.ok) {
      setError(valArchivo.error);
      return;
    }

    const listaTecnologias = valTexto.datos.tecnologias
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (listaTecnologias.length === 0) {
      setError('Indicá al menos una tecnología válida');
      return;
    }

    setEnviando(true);
    try {
      const creado = await pedirAPI('/proyectos', {
        method: 'POST',
        body: JSON.stringify({
          titulo: valTexto.datos.titulo,
          tecnologias: listaTecnologias,
          estado: valTexto.datos.estado
        })
      });
      setProyectos((previos) => [...previos, creado]);
      setNuevoTitulo('');
      setNuevaTec('');
      setNuevoEstado(ESTADOS[0]);
      setArchivoPortada(null);
      notificarCambio();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  // DELETE: borra en el backend y, solo si salió bien, lo quita de la vista.
  const eliminarProyecto = async (id) => {
    setEliminandoId(id);
    setError(null);
    try {
      await pedirAPI(`/proyectos/${id}`, { method: 'DELETE' });
      setProyectos((previos) => previos.filter((p) => p.id !== id));
      notificarCambio();
    } catch (err) {
      setError(err.message);
    } finally {
      setEliminandoId(null);
    }
  };

  const pestañas = [
    { id: 'proyectos', label: 'Proyectos' },
    { id: 'demos', label: 'Demos' },
    { id: 'servicios', label: 'Servicios Ofertados' },
    { id: 'usuarios', label: 'Usuarios Registrados' },
    { id: 'contactos', label: 'Gestión de Contactos' },
    { id: 'dashboard', label: 'Dashboard & Métricas' }
  ];

  const adminPanelRef = useRef(null);

  // Orquestación de cabecera y pestañas administrativas con anime.timeline()
  useLayoutEffect(() => {
    const scope = adminPanelRef.current;
    if (!scope) return;

    const tl = anime.timeline({
      easing: 'spring(1, 80, 10, 0)',
      duration: 900,
      root: scope
    });

    tl.add({
      targets: '.admin-header-anim',
      translateY: [-22, 0],
      opacity: [0, 1]
    }).add(
      {
        targets: '.admin-tab',
        translateY: [18, 0],
        scale: [0.94, 1],
        opacity: [0, 1],
        delay: anime.stagger(55)
      },
      '-=720'
    );

    return () => tl.revert();
  }, []);

  // Cascada escalonada cuando se renderiza la sección de Proyectos en el panel Admin
  useLayoutEffect(() => {
    if (seccionActiva !== 'proyectos') return;
    const scope = adminPanelRef.current;
    if (!scope) return;

    const tl = anime.timeline({
      easing: 'spring(1, 80, 10, 0)',
      duration: 950,
      root: scope
    });

    tl.add({
      targets: '.admin-form-proyectos',
      translateY: [28, 0],
      scale: [0.98, 1],
      opacity: [0, 1]
    }).add(
      {
        targets: '.proyecto-admin-card',
        translateY: [42, 0],
        scale: [0.93, 1],
        opacity: [0, 1],
        delay: anime.stagger(90)
      },
      '-=680'
    );

    return () => tl.revert();
  }, [seccionActiva, cargando, proyectos.length]);

  return (
    <div ref={adminPanelRef} style={{ maxWidth: '1050px', margin: '50px auto', padding: '0 20px' }}>
      <div className="admin-header-anim" style={{ marginBottom: '28px', willChange: 'transform, opacity' }}>
        <span className="tag-tecnologia" style={{ color: '#f472b6', borderColor: 'rgba(236, 72, 153, 0.35)' }}>
          <span className="status-dot" style={{ background: '#ec4899' }} />
          Rol Operador / Administrador
        </span>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.025em' }} className="text-white">
          Panel de Administración <span className="text-gradient">LOTUS</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Gestión integral de contenidos, usuarios registrados, contactos vía email y analítica parametrizada.
        </p>
      </div>

      {/* Sub-navegación del Panel de Control del Rol Administrador */}
      <div className="admin-tabs" role="tablist" aria-label="Secciones de administración">
        {pestañas.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={seccionActiva === tab.id}
            onClick={() => setSeccionActiva(tab.id)}
            className={`admin-tab ${seccionActiva === tab.id ? 'admin-tab-activo' : ''}`}
            style={{ willChange: 'transform, opacity' }}
          >
            {tab.id === 'proyectos' && (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            )}
            {tab.id === 'demos' && (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
            {tab.id === 'servicios' && (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            )}
            {tab.id === 'usuarios' && (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            )}
            {tab.id === 'contactos' && (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            )}
            {tab.id === 'dashboard' && (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            )}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* SECCIÓN 1: CRUD DE PROYECTOS */}
      {seccionActiva === 'proyectos' && (
        <div>
          <div className="card-proyecto admin-form-proyectos" style={{ marginBottom: '40px', willChange: 'transform, opacity' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="icon-badge" style={{ marginBottom: 0 }} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  <line x1="12" y1="11" x2="12" y2="17" />
                  <line x1="9" y1="14" x2="15" y2="14" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '2px' }} className="text-white font-bold">Agregar al Portfolio</h2>
                <p style={{ marginBottom: 0, fontSize: '0.84rem' }}>Alta de proyectos con relación N:M hacia el catálogo de tecnologías en PostgreSQL.</p>
              </div>
            </div>
            <form onSubmit={agregarProyecto} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="proy-titulo" className="label-form">Título del Proyecto *</label>
                  <input id="proy-titulo" type="text" placeholder="Título del proyecto (mín. 3 caracteres)" value={nuevoTitulo} onChange={(e) => setNuevoTitulo(e.target.value)} className="input-form" maxLength={120} disabled={enviando} />
                </div>
                <div>
                  <label htmlFor="proy-tecnologias" className="label-form">Tecnologías (separadas por coma) *</label>
                  <input id="proy-tecnologias" type="text" placeholder="Ej. React, Supabase, Node.js" value={nuevaTec} onChange={(e) => setNuevaTec(e.target.value)} className="input-form" disabled={enviando} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="proy-estado" className="label-form">Estado del Proyecto *</label>
                  <select id="proy-estado" value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)} className="input-form" disabled={enviando} aria-label="Estado del proyecto">
                    {ESTADOS.map((estado) => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="proy-portada" className="label-form">Portada o Ficha Técnica (Opcional — máx. 5 MB)</label>
                  <input
                    id="proy-portada"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (!file) {
                        setArchivoPortada(null);
                        return;
                      }
                      const val = validarArchivoAdjunto(file);
                      if (!val.ok) {
                        setError(val.error);
                        e.target.value = '';
                        setArchivoPortada(null);
                        return;
                      }
                      setError(null);
                      setArchivoPortada(file);
                    }}
                    className="input-form"
                    style={{ padding: '10px 14px', marginBottom: archivoPortada ? '6px' : '18px' }}
                    disabled={enviando}
                    aria-label="Portada o ficha técnica opcional"
                  />
                  {archivoPortada && (
                    <span className="text-xs text-indigo-400 font-medium inline-flex items-center gap-1.5 mb-3">
                      <span className="status-dot" style={{ background: '#4ade80' }} />
                      Portada validada: {archivoPortada.name} ({(archivoPortada.size / 1024).toFixed(1)} KB)
                    </span>
                  )}
                </div>
              </div>
              <button type="submit" className="btn-primario" disabled={enviando}>
                {enviando ? 'Publicando...' : 'Publicar Proyecto'}
              </button>
            </form>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 text-sm flex items-center gap-3"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-red-400" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Error: {error}</span>
            </div>
          )}

          {cargando ? (
            <div className="cargando-api">Cargando proyectos desde la base de datos...</div>
          ) : proyectos.length === 0 && !error ? (
            <p style={{ textAlign: 'center', color: '#94a3b8' }}>Todavía no hay proyectos cargados.</p>
          ) : (
            <div className="grid-proyectos">
              {proyectos.map((proy) => (
                <div
                  key={proy.id}
                  className="card-proyecto proyecto-admin-card flex flex-col justify-between"
                  style={{ willChange: 'transform, opacity' }}
                  onMouseEnter={(e) => animarHoverTarjeta(e, true)}
                  onMouseLeave={(e) => animarHoverTarjeta(e, false)}
                >
                  <div>
                    <h3 className="text-white">{proy.titulo}</h3>
                    <div>
                      {proy.tecnologias.map((tec) => (
                        <span key={tec.id} className="tag-tecnologia">{tec.nombre}</span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-3 mt-4 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs text-gray-300 inline-flex items-center gap-1.5">
                      <span className="status-dot" style={{ background: '#6366f1', marginRight: 0 }} />
                      Estado: <strong style={{ color: 'var(--accent-1)' }}>{proy.estado}</strong>
                    </span>
                    <button onClick={() => eliminarProyecto(proy.id)} disabled={eliminandoId === proy.id} className="btn-peligro-outline">
                      {eliminandoId === proy.id ? 'Removiendo...' : 'Remover'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECCIÓN 2: CRUD DE DEMOS */}
      {seccionActiva === 'demos' && (
        <GestionDemos pedirAPI={pedirAPI} proyectos={proyectos} onCambioContenido={notificarCambio} />
      )}

      {/* SECCIÓN 3: CRUD DE SERVICIOS OFERTADOS */}
      {seccionActiva === 'servicios' && (
        <GestionServicios pedirAPI={pedirAPI} onCambioContenido={notificarCambio} />
      )}

      {/* SECCIÓN 4: PANEL DE USUARIOS REGISTRADOS */}
      {seccionActiva === 'usuarios' && (
        <PanelUsuarios pedirAPI={pedirAPI} onCambioUsuarios={notificarCambio} />
      )}

      {/* SECCIÓN 5: PANEL DE GESTIÓN DE CONTACTOS */}
      {seccionActiva === 'contactos' && (
        <GestionContactos pedirAPI={pedirAPI} />
      )}

      {/* SECCIÓN 6: DASHBOARD DE MÉTRICAS Y GRÁFICOS INTERACTIVOS */}
      {seccionActiva === 'dashboard' && (
        <DashboardMetricas pedirAPI={pedirAPI} refrescarTrigger={refrescarDashboard} />
      )}
    </div>
  );
}

// Barra de Navegación Responsiva (PC & Móvil) con Ocultamiento de UI basado en Roles (RBAC)
function Navbar() {
  const { usuarioActual, esAdmin, cerrarSesion } = useAuth();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Cierra el menú móvil automáticamente al navegar a otra ruta
  useEffect(() => {
    setMenuAbierto(false);
  }, [location.pathname]);

  const rutaActiva = (path) => (location.pathname === path ? 'nav-link nav-link-activo' : 'nav-link');

  return (
    <nav className="navbar" aria-label="Navegación principal">
      <Link to="/" className="navbar-brand">
        <span className="navbar-lotus-emblem" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3C14.5 7.5 16 11.5 12 19C8 11.5 9.5 7.5 12 3Z" />
            <path d="M12 19C7.5 15.5 5 11 6 6.5C9 8.5 11 12.5 12 19Z" />
            <path d="M12 19C16.5 15.5 19 11 18 6.5C15 8.5 13 12.5 12 19Z" />
            <path d="M5 20C9 21.5 15 21.5 19 20" />
          </svg>
        </span>
        <span>
          LOTUS<span className="text-gradient">.</span>
        </span>
      </Link>

      <button
        type="button"
        className="nav-mobile-toggle"
        onClick={() => setMenuAbierto((prev) => !prev)}
        aria-expanded={menuAbierto}
        aria-label={menuAbierto ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
      >
        {menuAbierto ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      <div className={`nav-links ${menuAbierto ? 'nav-links-abierto' : ''}`}>
        <Link to="/" className={rutaActiva('/')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Inicio</span>
        </Link>
        <Link to="/perfil" className={rutaActiva('/perfil')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Perfil Profesional</span>
        </Link>
        <Link to="/repositorios" className={rutaActiva('/repositorios')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <span>Proyectos &amp; Demos</span>
        </Link>
        <Link to="/contacto" className={rutaActiva('/contacto')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <span>Contacto</span>
        </Link>

        {/* Enlaces exclusivos de Operador / Administrador: ocultos si no es Admin */}
        {esAdmin && (
          <>
            <Link
              to="/gestion"
              className={rutaActiva('/gestion')}
              style={{ color: '#c4b5fd', fontWeight: 600 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Lotus Gestión Admin</span>
            </Link>
            <Link
              to="/dashboard"
              className={rutaActiva('/dashboard')}
              style={{ color: '#f9a8d4', fontWeight: 600 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              <span>Dashboard</span>
            </Link>
          </>
        )}

        {usuarioActual ? (
          <div className="nav-auth-box">
            <span
              className="tag-tecnologia"
              style={{
                marginBottom: 0,
                color: esAdmin ? '#f9a8d4' : '#38bdf8',
                borderColor: esAdmin ? 'rgba(236, 72, 153, 0.4)' : 'rgba(56, 189, 248, 0.4)'
              }}
            >
              <span className="status-dot" style={{ background: esAdmin ? '#ec4899' : '#38bdf8' }} />
              {usuarioActual.nombre.split(' ')[0]} ({esAdmin ? 'Admin' : 'Cliente'})
            </span>
            <button
              onClick={cerrarSesion}
              className="btn-secundario-outline"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              title={`Cerrar sesión de ${usuarioActual.nombre}`}
            >
              Salir
            </button>
          </div>
        ) : (
          <div className="nav-auth-box">
            <Link
              to="/login"
              className="btn-secundario-outline"
              style={{ padding: '7px 15px', fontSize: '0.82rem', textDecoration: 'none', width: '100%' }}
            >
              Iniciar Sesión
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

// Pie de página institucional con firma de arquitectura en 3 capas
function FooterLotus() {
  return (
    <footer className="footer-lotus">
      <div
        style={{ maxWidth: '1060px', margin: '0 auto' }}
        className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400"
      >
        <div className="flex items-center gap-2.5">
          <span className="navbar-lotus-emblem" style={{ width: '26px', height: '26px', borderRadius: '8px' }} aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3C14.5 7.5 16 11.5 12 19C8 11.5 9.5 7.5 12 3Z" />
              <path d="M12 19C7.5 15.5 5 11 6 6.5C9 8.5 11 12.5 12 19Z" />
              <path d="M12 19C16.5 15.5 19 11 18 6.5C15 8.5 13 12.5 12 19Z" />
            </svg>
          </span>
          <span className="font-semibold text-slate-200">LOTUS.</span>
          <span>• Portfolio Full-Stack Integrador (Lenguajes IV)</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="tag-tecnologia" style={{ marginBottom: 0 }}>React 19 + Tailwind</span>
          <span className="tag-tecnologia" style={{ marginBottom: 0 }}>Node.js + Express</span>
          <span className="tag-tecnologia" style={{ marginBottom: 0 }}>PostgreSQL / Supabase</span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [usuarioActual, setUsuarioActual] = useState(() => {
    try {
      const guardado = localStorage.getItem('lotus_usuario_actual');
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  });

  const esAdmin = verificarEsAdmin(usuarioActual);

  const iniciarSesion = (usuario) => {
    setUsuarioActual(usuario);
    localStorage.setItem('lotus_usuario_actual', JSON.stringify(usuario));
  };

  const cerrarSesion = () => {
    setUsuarioActual(null);
    localStorage.removeItem('lotus_usuario_actual');
  };

  // Registra automáticamente una visita general al ingresar al sitio (una vez por sesión).
  useEffect(() => {
    if (!sessionStorage.getItem('lotus_visita_registrada')) {
      sessionStorage.setItem('lotus_visita_registrada', '1');
      pedirAPI('/metricas/visita', {
        method: 'POST',
        body: JSON.stringify({ tipo: 'general', seccion: 'inicio' })
      }).catch(() => {});
    }
  }, []);

  return (
    <AuthContext.Provider value={{ usuarioActual, esAdmin, iniciarSesion, cerrarSesion }}>
      <Router>
        <LotusWatermark />
        <div className="app-shell">
          <Navbar />

          <main style={{ flex: 1 }}>
            <Routes>
              {/* Rutas Públicas abiertas */}
              <Route path="/" element={<Inicio />} />
              <Route path="/perfil" element={<PresentacionProfesional pedirAPI={pedirAPI} />} />
              <Route path="/contacto" element={<FormularioContacto pedirAPI={pedirAPI} />} />
              <Route
                path="/login"
                element={
                  usuarioActual ? (
                    <SeccionProyectosProtegida
                      usuarioActual={usuarioActual}
                      onAutenticado={iniciarSesion}
                      pedirAPI={pedirAPI}
                    />
                  ) : (
                    <ModuloAuth pedirAPI={pedirAPI} onAutenticado={iniciarSesion} />
                  )
                }
              />

              {/* Ruta Protegida: Accesible tanto para rol Cliente como Administrador tras iniciar sesión */}
              <Route
                path="/repositorios"
                element={
                  <ProtectedRoute requiereAdmin={false} pedirAPI={pedirAPI}>
                    <SeccionProyectosProtegida
                      usuarioActual={usuarioActual}
                      onAutenticado={iniciarSesion}
                      pedirAPI={pedirAPI}
                    />
                  </ProtectedRoute>
                }
              />

              {/* Rutas Privadas Exclusivas de Rol Administrador (CRUD, Contactos, Usuarios y Dashboard) */}
              <Route
                path="/gestion"
                element={
                  <ProtectedRoute requiereAdmin={true} pedirAPI={pedirAPI}>
                    <GestionProyectos seccionInicial="proyectos" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contactos-admin"
                element={
                  <ProtectedRoute requiereAdmin={true} pedirAPI={pedirAPI}>
                    <GestionProyectos seccionInicial="contactos" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiereAdmin={true} pedirAPI={pedirAPI}>
                    <GestionProyectos seccionInicial="dashboard" />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <FooterLotus />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}
