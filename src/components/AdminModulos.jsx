import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  demoSchema,
  servicioSchema,
  usuarioAdminSchema,
  respuestaContactoSchema,
  validarConEsquema
} from '../utils/validaciones';
import {
  anime,
  animarHoverTarjeta,
  yaFueAnimada,
  marcarComoAnimada
} from '../utils/animaciones';

const COLORES_PIE = ['#6366f1', '#ec4899', '#3b82f6'];
const CATEGORIAS_SERVICIO = [
  'Desarrollo Web',
  'Diseño UI/UX',
  'Backend & APIs',
  'Base de Datos / Cloud'
];
const ROLES_USUARIO = ['Cliente', 'Colaborador', 'Administrador'];

// =====================================================================
// 1. GESTIÓN DE DEMOS (CRUD conectado a /api/demos con validación Zod)
// =====================================================================
export function GestionDemos({ pedirAPI, proyectos = [], onCambioContenido }) {
  const [demos, setDemos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);

  const [titulo, setTitulo] = useState('');
  const [urlDemo, setUrlDemo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [proyectoId, setProyectoId] = useState('');
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setDemos(await pedirAPI('/demos'));
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [pedirAPI]);

  const iniciarEdicionDemo = (demo) => {
    setError(null);
    setEditandoId(demo.id);
    setTitulo(demo.titulo || '');
    setUrlDemo(demo.url_demo || '');
    setDescripcion(demo.descripcion || '');
    setProyectoId(demo.proyecto_id ? String(demo.proyecto_id) : '');
  };

  const cancelarEdicionDemo = () => {
    setError(null);
    setEditandoId(null);
    setTitulo('');
    setUrlDemo('');
    setDescripcion('');
    setProyectoId('');
  };

  const agregarDemo = async (e) => {
    e.preventDefault();
    setError(null);

    const validacion = validarConEsquema(demoSchema, {
      titulo,
      url_demo: urlDemo,
      descripcion
    });
    if (!validacion.ok) {
      setError(validacion.error);
      return;
    }

    setEnviando(true);
    try {
      const payload = {
        titulo: validacion.datos.titulo,
        url_demo: validacion.datos.url_demo,
        descripcion: validacion.datos.descripcion || null,
        proyecto_id: proyectoId ? Number(proyectoId) : null
      };

      if (editandoId) {
        const actualizada = await pedirAPI(`/demos/${editandoId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        const proyVinculado = proyectos.find((p) => Number(p.id) === Number(actualizada.proyecto_id));
        const enriquecida = {
          ...actualizada,
          proyecto_titulo: proyVinculado ? proyVinculado.titulo : null
        };
        setDemos((prev) => prev.map((d) => (d.id === editandoId ? enriquecida : d)));
      } else {
        const creada = await pedirAPI('/demos', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setDemos((prev) => [creada, ...prev]);
      }

      cancelarEdicionDemo();
      if (onCambioContenido) onCambioContenido();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const eliminarDemo = async (id) => {
    setEliminandoId(id);
    setError(null);
    try {
      await pedirAPI(`/demos/${id}`, { method: 'DELETE' });
      setDemos((prev) => prev.filter((d) => d.id !== id));
      if (editandoId === id) cancelarEdicionDemo();
      if (onCambioContenido) onCambioContenido();
    } catch (err) {
      setError(err.message);
    } finally {
      setEliminandoId(null);
    }
  };

  const demosRef = useRef(null);

  useLayoutEffect(() => {
    if (cargando || yaFueAnimada('admin-demos')) return undefined;
    const scope = demosRef.current;
    if (!scope) return undefined;

    const tl = anime.timeline({
      easing: 'cubicBezier(0.22, 1, 0.36, 1)',
      duration: 540,
      root: scope
    });

    tl.add({
      targets: '.demos-form-card',
      translateY: [16, 0],
      opacity: [0, 1]
    }).add(
      {
        targets: '.demo-admin-card',
        translateY: [18, 0],
        opacity: [0, 1],
        delay: anime.stagger(50)
      },
      '-=400'
    );

    const timerMarca = setTimeout(() => {
      marcarComoAnimada('admin-demos');
    }, 180);

    return () => {
      clearTimeout(timerMarca);
      tl.revert();
    };
  }, [cargando]);

  return (
    <div ref={demosRef}>
      <div
        className="card-proyecto demos-form-card"
        style={{ marginBottom: '40px', willChange: 'transform, opacity' }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="icon-badge" style={{ marginBottom: 0 }} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '2px' }} className="text-white font-bold">
              {editandoId ? `Editar Demo #${editandoId}` : 'Publicar Nueva Demo'}
            </h2>
            <p style={{ marginBottom: 0, fontSize: '0.84rem' }}>
              {editandoId
                ? 'Actualizá el título, URL en vivo, descripción o proyecto vinculado.'
                : 'Vinculá un despliegue interactivo al catálogo de proyectos.'}
            </p>
          </div>
        </div>
        <form onSubmit={agregarDemo} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="demo-titulo" className="label-form">Título de la Demo *</label>
              <input
                id="demo-titulo"
                type="text"
                placeholder="Título de la demo (mín. 3 caracteres)"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="input-form"
                maxLength={120}
                disabled={enviando}
              />
            </div>
            <div>
              <label htmlFor="demo-url" className="label-form">URL en Vivo (HTTPS) *</label>
              <input
                id="demo-url"
                type="url"
                placeholder="https://mi-demo.vercel.app"
                value={urlDemo}
                onChange={(e) => setUrlDemo(e.target.value)}
                className="input-form"
                disabled={enviando}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="demo-proyecto" className="label-form">Proyecto Vinculado (Opcional)</label>
              <select
                id="demo-proyecto"
                value={proyectoId}
                onChange={(e) => setProyectoId(e.target.value)}
                className="input-form"
                disabled={enviando}
                aria-label="Proyecto vinculado"
              >
                <option value="">-- Vincular a un proyecto (opcional) --</option>
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.titulo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="demo-descripcion" className="label-form">Descripción Funcional</label>
              <input
                id="demo-descripcion"
                type="text"
                placeholder="Descripción breve de lo que muestra la demo"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="input-form"
                disabled={enviando}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="btn-primario" disabled={enviando}>
              {enviando
                ? 'Guardando Demo...'
                : editandoId
                  ? 'Guardar Cambios'
                  : 'Agregar Demo'}
            </button>
            {editandoId && (
              <button
                type="button"
                onClick={cancelarEdicionDemo}
                disabled={enviando}
                className="btn-secundario-outline"
              >
                Cancelar Edición
              </button>
            )}
          </div>
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
        <div className="cargando-api">Cargando demos...</div>
      ) : demos.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>No hay demos cargadas.</p>
      ) : (
        <div className="grid-proyectos">
          {demos.map((demo) => (
            <div
              key={demo.id}
              className="card-proyecto demo-admin-card flex flex-col justify-between"
              style={{ willChange: 'transform, opacity' }}
              onMouseEnter={(e) => animarHoverTarjeta(e, true)}
              onMouseLeave={(e) => animarHoverTarjeta(e, false)}
            >
              <div>
                <span className="tag-tecnologia">
                  {demo.proyecto_titulo ? `Proyecto: ${demo.proyecto_titulo}` : 'Demo Independiente'}
                </span>
                <h3 className="text-white mt-1">{demo.titulo}</h3>
                <p style={{ marginTop: '8px' }}>
                  {demo.descripcion || 'Demostración funcional interactiva.'}
                </p>
              </div>
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2.5">
                <a
                  href={demo.url_demo}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primario"
                  style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                >
                  <span>Abrir Demo</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
                <button
                  type="button"
                  onClick={() => iniciarEdicionDemo(demo)}
                  disabled={eliminandoId === demo.id}
                  className="btn-secundario-outline"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => eliminarDemo(demo.id)}
                  disabled={eliminandoId === demo.id}
                  className="btn-peligro-outline"
                >
                  {eliminandoId === demo.id ? 'Removiendo...' : 'Remover'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================================
// 2. GESTIÓN DE SERVICIOS OFERTADOS (CRUD conectado a /api/servicios con Zod)
// =====================================================================
export function GestionServicios({ pedirAPI, onCambioContenido }) {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [procesandoId, setProcesandoId] = useState(null);
  const serviciosRef = useRef(null);

  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS_SERVICIO[0]);
  const [precioDesde, setPrecioDesde] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setServicios(await pedirAPI('/servicios'));
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [pedirAPI]);

  useLayoutEffect(() => {
    if (cargando || yaFueAnimada('admin-servicios')) return undefined;
    const scope = serviciosRef.current;
    if (!scope) return undefined;

    const tl = anime.timeline({
      easing: 'cubicBezier(0.22, 1, 0.36, 1)',
      duration: 540,
      root: scope
    });

    tl.add({
      targets: '.servicios-form-card',
      translateY: [16, 0],
      opacity: [0, 1]
    }).add(
      {
        targets: '.servicio-admin-card',
        translateY: [18, 0],
        opacity: [0, 1],
        delay: anime.stagger(50)
      },
      '-=400'
    );

    const timerMarca = setTimeout(() => {
      marcarComoAnimada('admin-servicios');
    }, 180);

    return () => {
      clearTimeout(timerMarca);
      tl.revert();
    };
  }, [cargando]);

  const iniciarEdicionServicio = (srv) => {
    setError(null);
    setEditandoId(srv.id);
    setNombre(srv.nombre || '');
    setCategoria(srv.categoria || CATEGORIAS_SERVICIO[0]);
    setPrecioDesde(srv.precio_desde !== undefined ? String(srv.precio_desde) : '');
    setDescripcion(srv.descripcion || '');
  };

  const cancelarEdicionServicio = () => {
    setError(null);
    setEditandoId(null);
    setNombre('');
    setPrecioDesde('');
    setDescripcion('');
    setCategoria(CATEGORIAS_SERVICIO[0]);
  };

  const agregarServicio = async (e) => {
    e.preventDefault();
    setError(null);

    const validacion = validarConEsquema(servicioSchema, {
      nombre,
      categoria,
      precio_desde: precioDesde === '' ? 0 : Number(precioDesde),
      descripcion
    });
    if (!validacion.ok) {
      setError(validacion.error);
      return;
    }

    setEnviando(true);
    try {
      if (editandoId) {
        const actualizado = await pedirAPI(`/servicios/${editandoId}`, {
          method: 'PUT',
          body: JSON.stringify(validacion.datos)
        });
        setServicios((prev) => prev.map((s) => (s.id === editandoId ? actualizado : s)));
      } else {
        const creado = await pedirAPI('/servicios', {
          method: 'POST',
          body: JSON.stringify(validacion.datos)
        });
        setServicios((prev) => [creado, ...prev]);
      }

      cancelarEdicionServicio();
      if (onCambioContenido) onCambioContenido();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const alternarEstado = async (id) => {
    setProcesandoId(id);
    setError(null);
    try {
      const actualizado = await pedirAPI(`/servicios/${id}/estado`, { method: 'PATCH' });
      setServicios((prev) => prev.map((s) => (s.id === id ? actualizado : s)));
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesandoId(null);
    }
  };

  const eliminarServicio = async (id) => {
    setProcesandoId(id);
    setError(null);
    try {
      await pedirAPI(`/servicios/${id}`, { method: 'DELETE' });
      setServicios((prev) => prev.filter((s) => s.id !== id));
      if (editandoId === id) cancelarEdicionServicio();
      if (onCambioContenido) onCambioContenido();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesandoId(null);
    }
  };

  return (
    <div ref={serviciosRef}>
      <div
        className="card-proyecto servicios-form-card"
        style={{ marginBottom: '40px', willChange: 'transform, opacity' }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="icon-badge" style={{ marginBottom: 0 }} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '2px' }} className="text-white font-bold">
              {editandoId ? `Editar Servicio #${editandoId}` : 'Agregar Servicio Ofertado'}
            </h2>
            <p style={{ marginBottom: 0, fontSize: '0.84rem' }}>
              {editandoId
                ? 'Modificá la prestación, categoría técnica o tarifa base en USD.'
                : 'Definí prestaciones profesionales, categoría y tarifa base en USD.'}
            </p>
          </div>
        </div>
        <form onSubmit={agregarServicio} noValidate>
          <div>
            <label htmlFor="srv-nombre" className="label-form">Nombre del Servicio *</label>
            <input
              id="srv-nombre"
              type="text"
              placeholder="Nombre del servicio (mín. 4 caracteres)"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="input-form"
              maxLength={120}
              disabled={enviando}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="srv-categoria" className="label-form">Categoría Técnica *</label>
              <select
                id="srv-categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="input-form"
                disabled={enviando}
                aria-label="Categoría del servicio"
              >
                {CATEGORIAS_SERVICIO.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="srv-precio" className="label-form">Precio Base (USD) *</label>
              <input
                id="srv-precio"
                type="number"
                min="0"
                step="10"
                placeholder="Precio base en USD (ej. 350)"
                value={precioDesde}
                onChange={(e) => setPrecioDesde(e.target.value)}
                className="input-form tabular-nums"
                disabled={enviando}
              />
            </div>
          </div>
          <div>
            <label htmlFor="srv-descripcion" className="label-form">Descripción Detallada *</label>
            <input
              id="srv-descripcion"
              type="text"
              placeholder="Descripción detallada del servicio (mín. 10 caracteres)"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="input-form"
              disabled={enviando}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="btn-primario" disabled={enviando}>
              {enviando
                ? 'Guardando Servicio...'
                : editandoId
                  ? 'Guardar Cambios'
                  : 'Publicar Servicio'}
            </button>
            {editandoId && (
              <button
                type="button"
                onClick={cancelarEdicionServicio}
                disabled={enviando}
                className="btn-secundario-outline"
              >
                Cancelar Edición
              </button>
            )}
          </div>
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
        <div className="cargando-api">Cargando servicios ofertados...</div>
      ) : servicios.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>No hay servicios ofertados cargados.</p>
      ) : (
        <div className="grid-proyectos">
          {servicios.map((srv) => (
            <div
              key={srv.id}
              className="card-proyecto servicio-admin-card flex flex-col justify-between"
              style={{ willChange: 'transform, opacity' }}
              onMouseEnter={(e) => animarHoverTarjeta(e, true)}
              onMouseLeave={(e) => animarHoverTarjeta(e, false)}
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="tag-tecnologia" style={{ marginBottom: 0 }}>{srv.categoria}</span>
                  <span
                    className="tag-tecnologia"
                    style={{
                      marginBottom: 0,
                      color: srv.activo ? '#4ade80' : '#f87171',
                      borderColor: srv.activo ? 'rgba(74, 222, 128, 0.35)' : 'rgba(248, 113, 113, 0.35)'
                    }}
                  >
                    <span className="status-dot" style={{ background: srv.activo ? '#4ade80' : '#f87171' }} />
                    {srv.activo ? 'Disponible' : 'Pausado'}
                  </span>
                </div>
                <h3 className="text-white mt-1">{srv.nombre}</h3>
                <p>{srv.descripcion}</p>
              </div>
              <div className="pt-3 border-t border-white/10">
                <p className="mb-3 text-sm text-gray-300 tabular-nums">
                  Inversión desde: <strong style={{ color: 'var(--accent-3)', fontSize: '1.1rem' }}>USD ${srv.precio_desde}</strong>
                </p>
                <div className="flex gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => iniciarEdicionServicio(srv)}
                    disabled={procesandoId === srv.id}
                    className="btn-secundario-outline"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => alternarEstado(srv.id)}
                    disabled={procesandoId === srv.id}
                    className="btn-secundario-outline"
                  >
                    {srv.activo ? 'Pausar' : 'Activar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => eliminarServicio(srv.id)}
                    disabled={procesandoId === srv.id}
                    className="btn-peligro-outline"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================================
// 3. PANEL DE USUARIOS REGISTRADOS (con cambio de rol directo y Zod)
// =====================================================================
export function PanelUsuarios({ pedirAPI, onCambioUsuarios }) {
  const [usuarios, setUsuarios] = useState([]);
  const [filtroRol, setFiltroRol] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [procesandoId, setProcesandoId] = useState(null);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('Administrador');

  const cargarUsuarios = useCallback(
    async (rolSeleccionado) => {
      setCargando(true);
      setError(null);
      try {
        const query = rolSeleccionado ? `?rol=${encodeURIComponent(rolSeleccionado)}` : '';
        setUsuarios(await pedirAPI(`/usuarios${query}`));
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    },
    [pedirAPI]
  );

  useEffect(() => {
    cargarUsuarios(filtroRol);
  }, [cargarUsuarios, filtroRol]);

  const registrarUsuario = async (e) => {
    e.preventDefault();
    setError(null);

    const validacion = validarConEsquema(usuarioAdminSchema, { nombre, email, rol });
    if (!validacion.ok) {
      setError(validacion.error);
      return;
    }

    setEnviando(true);
    try {
      const nuevo = await pedirAPI('/usuarios', {
        method: 'POST',
        body: JSON.stringify(validacion.datos)
      });
      setUsuarios((prev) => [...prev, nuevo]);
      setNombre('');
      setEmail('');
      setRol('Cliente');
      if (onCambioUsuarios) onCambioUsuarios();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const cambiarEstadoUsuario = async (id) => {
    setProcesandoId(id);
    setError(null);
    try {
      const actualizado = await pedirAPI(`/usuarios/${id}/estado`, { method: 'PATCH' });
      setUsuarios((prev) =>
        prev.map((u) => (u.id === id ? { ...u, activo: actualizado.activo } : u))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesandoId(null);
    }
  };

  const cambiarRolUsuario = async (id, nuevoRol) => {
    setProcesandoId(id);
    setError(null);
    try {
      const actualizado = await pedirAPI(`/usuarios/${id}/rol`, {
        method: 'PATCH',
        body: JSON.stringify({ rol: nuevoRol })
      });
      setUsuarios((prev) =>
        prev.map((u) => (u.id === id ? { ...u, rol: actualizado.rol } : u))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesandoId(null);
    }
  };

  const simularAccesoUsuario = async (usuario) => {
    setProcesandoId(usuario.id);
    setError(null);
    try {
      await pedirAPI('/metricas/visita', {
        method: 'POST',
        body: JSON.stringify({
          tipo: 'autenticado',
          seccion: 'gestion',
          usuario_id: usuario.id
        })
      });
      await cargarUsuarios(filtroRol);
      if (onCambioUsuarios) onCambioUsuarios();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesandoId(null);
    }
  };

  const eliminarUsuario = async (id) => {
    setProcesandoId(id);
    setError(null);
    try {
      await pedirAPI(`/usuarios/${id}`, { method: 'DELETE' });
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      if (onCambioUsuarios) onCambioUsuarios();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesandoId(null);
    }
  };

  const usuariosRef = useRef(null);

  useLayoutEffect(() => {
    if (cargando || yaFueAnimada('admin-usuarios')) return undefined;
    const scope = usuariosRef.current;
    if (!scope) return undefined;

    const tl = anime.timeline({
      easing: 'cubicBezier(0.22, 1, 0.36, 1)',
      duration: 520,
      root: scope
    });

    tl.add({
      targets: '.usuarios-form-card',
      translateY: [16, 0],
      opacity: [0, 1]
    })
      .add(
        {
          targets: '.tabla-contenedor',
          translateY: [16, 0],
          opacity: [0, 1]
        },
        '-=390'
      )
      .add(
        {
          targets: '.fila-usuario-anim',
          translateX: [-12, 0],
          opacity: [0, 1],
          delay: anime.stagger(35)
        },
        '-=350'
      );

    const timerMarca = setTimeout(() => {
      marcarComoAnimada('admin-usuarios');
    }, 180);

    return () => {
      clearTimeout(timerMarca);
      tl.revert();
    };
  }, [cargando]);

  return (
    <div ref={usuariosRef}>
      <div
        className="card-proyecto usuarios-form-card"
        style={{ marginBottom: '40px', willChange: 'transform, opacity' }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="icon-badge" style={{ marginBottom: 0 }} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '2px' }} className="text-white font-bold">Registrar Cuenta de Usuario</h2>
            <p style={{ marginBottom: 0, fontSize: '0.84rem' }}>Alta administrativa de usuarios con asignación de rol (Cliente, Colaborador o Administrador).</p>
          </div>
        </div>
        <form onSubmit={registrarUsuario} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="usr-nombre" className="label-form">Nombre Completo *</label>
              <input
                id="usr-nombre"
                type="text"
                placeholder="Nombre completo (mín. 3 caracteres)"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="input-form"
                disabled={enviando}
              />
            </div>
            <div>
              <label htmlFor="usr-email" className="label-form">Correo Electrónico *</label>
              <input
                id="usr-email"
                type="email"
                placeholder="cliente@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-form"
                disabled={enviando}
              />
            </div>
            <div>
              <label htmlFor="usr-rol" className="label-form">Rol de Acceso *</label>
              <select
                id="usr-rol"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="input-form"
                disabled={enviando}
                aria-label="Rol del usuario"
              >
                {ROLES_USUARIO.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primario" disabled={enviando}>
            {enviando ? 'Registrando...' : 'Dar de Alta Usuario'}
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.3rem' }} className="text-white font-bold tabular-nums">
          Usuarios Registrados ({usuarios.length})
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="filtro-rol-select" style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 500 }}>
            Filtrar por rol:
          </label>
          <select
            id="filtro-rol-select"
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            className="input-form"
            style={{ width: 'auto', marginBottom: 0, padding: '8px 14px' }}
          >
            <option value="">Todos los roles</option>
            {ROLES_USUARIO.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
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
        <div className="cargando-api">Cargando padrón de usuarios...</div>
      ) : usuarios.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>No hay usuarios registrados para este filtro.</p>
      ) : (
        <div
          className="tabla-contenedor card-proyecto"
          style={{ padding: '20px', overflowX: 'auto', willChange: 'transform, opacity' }}
          data-lenis-prevent="true"
        >
          <table className="tabla-admin">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol (Editable)</th>
                <th>Estado</th>
                <th>Accesos</th>
                <th>Último Acceso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="fila-usuario-anim" style={{ willChange: 'transform, opacity' }}>
                  <td style={{ fontWeight: 600 }} className="text-white">{u.nombre}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                  <td>
                    <select
                      value={u.rol}
                      onChange={(e) => cambiarRolUsuario(u.id, e.target.value)}
                      disabled={procesandoId === u.id}
                      className="input-form"
                      style={{ marginBottom: 0, padding: '6px 10px', width: 'auto', fontSize: '0.82rem' }}
                      aria-label={`Cambiar rol de ${u.nombre}`}
                    >
                      {ROLES_USUARIO.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span
                      className="inline-flex items-center gap-1.5"
                      style={{
                        color: u.activo ? '#4ade80' : '#f87171',
                        fontWeight: 600,
                        fontSize: '0.84rem'
                      }}
                    >
                      <span className="status-dot" style={{ background: u.activo ? '#4ade80' : '#f87171', marginRight: 0 }} />
                      {u.activo ? 'Activo' : 'Suspendido'}
                    </span>
                  </td>
                  <td className="tabular-nums">
                    <strong className="text-white">{u.total_accesos ?? 0}</strong>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }} className="tabular-nums">
                    {u.ultimo_acceso ? new Date(u.ultimo_acceso).toLocaleString('es-AR') : '-'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => simularAccesoUsuario(u)}
                        disabled={procesandoId === u.id}
                        className="btn-secundario-outline"
                        title="Registra un acceso autenticado para este usuario"
                      >
                        + Acceso
                      </button>
                      <button
                        onClick={() => cambiarEstadoUsuario(u.id)}
                        disabled={procesandoId === u.id}
                        className="btn-secundario-outline"
                      >
                        {u.activo ? 'Suspender' : 'Activar'}
                      </button>
                      <button
                        onClick={() => eliminarUsuario(u.id)}
                        disabled={procesandoId === u.id}
                        className="btn-peligro-outline"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// 4. PANEL DE GESTIÓN DE CONTACTOS (conectado a /api/contactos)
// =====================================================================
export function GestionContactos({ pedirAPI }) {
  const [contactos, setContactos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [procesandoId, setProcesandoId] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos'); // 'todos' | 'pendientes' | 'respondidos'
  const [respondiendoId, setRespondiendoId] = useState(null);
  const [textoRespuesta, setTextoRespuesta] = useState('');
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);
  const [feedbackEnvio, setFeedbackEnvio] = useState(null);
  const contactosRef = useRef(null);

  useEffect(() => {
    pedirAPI('/contactos')
      .then((datos) => setContactos(datos))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [pedirAPI]);

  const alternarRespondido = async (id) => {
    setProcesandoId(id);
    setError(null);
    setFeedbackEnvio(null);
    try {
      const actualizado = await pedirAPI(`/contactos/${id}/respondido`, { method: 'PATCH' });
      setContactos((prev) => prev.map((c) => (c.id === id ? actualizado : c)));
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesandoId(null);
    }
  };

  const abrirFormularioRespuesta = (item) => {
    setError(null);
    setFeedbackEnvio(null);
    if (respondiendoId === item.id) {
      setRespondiendoId(null);
      setTextoRespuesta('');
      return;
    }
    setRespondiendoId(item.id);
    setTextoRespuesta(
      item.respuesta ||
        `Hola ${item.nombre}, gracias por escribir al equipo LOTUS sobre "${item.asunto}". `
    );
  };

  const enviarRespuestaEmail = async (e, item) => {
    e.preventDefault();
    setError(null);
    setFeedbackEnvio(null);

    const validacion = validarConEsquema(respuestaContactoSchema, {
      respuesta: textoRespuesta
    });
    if (!validacion.ok) {
      setError(validacion.error);
      return;
    }

    setEnviandoRespuesta(true);
    try {
      const res = await pedirAPI(`/contactos/${item.id}/responder`, {
        method: 'POST',
        body: JSON.stringify({ respuesta: validacion.datos.respuesta })
      });
      if (res?.contacto) {
        setContactos((prev) => prev.map((c) => (c.id === item.id ? res.contacto : c)));
      }
      setFeedbackEnvio(
        `Respuesta enviada a ${item.email} y registrada en PostgreSQL (modo: ${res?.correo?.modo || 'procesado'}).`
      );
      setRespondiendoId(null);
      setTextoRespuesta('');
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviandoRespuesta(false);
    }
  };

  const eliminarContacto = async (id) => {
    setProcesandoId(id);
    setError(null);
    setFeedbackEnvio(null);
    try {
      await pedirAPI(`/contactos/${id}`, { method: 'DELETE' });
      setContactos((prev) => prev.filter((c) => c.id !== id));
      if (respondiendoId === id) {
        setRespondiendoId(null);
        setTextoRespuesta('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesandoId(null);
    }
  };

  const filtrados = contactos.filter((c) => {
    if (filtroEstado === 'pendientes') return !c.respondido;
    if (filtroEstado === 'respondidos') return c.respondido;
    return true;
  });

  // Orquestación de entrada una sola vez para la Bandeja de Contactos
  useLayoutEffect(() => {
    if (cargando || yaFueAnimada('admin-contactos')) return undefined;
    const scope = contactosRef.current;
    if (!scope) return undefined;

    const tl = anime.timeline({
      easing: 'cubicBezier(0.22, 1, 0.36, 1)',
      duration: 540,
      root: scope
    });

    tl.add({
      targets: '.contactos-header-anim',
      translateY: [-10, 0],
      opacity: [0, 1]
    }).add(
      {
        targets: '.contacto-admin-card',
        translateY: [18, 0],
        opacity: [0, 1],
        delay: anime.stagger(50)
      },
      '-=400'
    );

    const timerMarca = setTimeout(() => {
      marcarComoAnimada('admin-contactos');
    }, 180);

    return () => {
      clearTimeout(timerMarca);
      tl.revert();
    };
  }, [cargando]);

  return (
    <div ref={contactosRef}>
      <div
        className="contactos-header-anim flex flex-wrap justify-between items-center gap-4 mb-6"
        style={{ willChange: 'transform, opacity' }}
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Bandeja de Gestión de Contactos</h2>
          <p className="text-sm text-gray-400">
            Consultas, cotizaciones y pedidos de asesoría recibidos y respondidos vía email (Nodemailer + Supabase).
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <label htmlFor="filtro-contactos" className="text-xs text-gray-400 font-medium">
            Estado:
          </label>
          <select
            id="filtro-contactos"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="input-form tabular-nums"
            style={{ width: 'auto', marginBottom: 0, padding: '8px 14px' }}
            aria-label="Filtrar mensajes de contacto"
          >
            <option value="todos">Todos ({contactos.length})</option>
            <option value="pendientes">Pendientes ({contactos.filter((c) => !c.respondido).length})</option>
            <option value="respondidos">Respondidos ({contactos.filter((c) => c.respondido).length})</option>
          </select>
        </div>
      </div>

      {feedbackEnvio && (
        <div
          role="status"
          className="mb-6 p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-sm flex items-center gap-3"
        >
          <span className="status-dot" style={{ background: '#4ade80', marginRight: 0 }} />
          <span>{feedbackEnvio}</span>
        </div>
      )}

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
        <div className="cargando-api">Cargando mensajes de contacto...</div>
      ) : filtrados.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>No hay mensajes en esta bandeja.</p>
      ) : (
        <div className="grid gap-5">
          {filtrados.map((item) => (
            <div
              key={item.id}
              className="card-proyecto contacto-admin-card"
              style={{ willChange: 'transform, opacity' }}
              onMouseEnter={(e) => animarHoverTarjeta(e, true)}
              onMouseLeave={(e) => animarHoverTarjeta(e, false)}
            >
              <div className="flex flex-wrap justify-between items-start gap-3 mb-2">
                <div>
                  <span className="tag-tecnologia">{item.tipo_consulta}</span>
                  <span
                    className="tag-tecnologia"
                    style={{
                      color: item.respondido ? '#4ade80' : '#facc15',
                      borderColor: item.respondido ? 'rgba(74, 222, 128, 0.35)' : 'rgba(250, 204, 21, 0.35)'
                    }}
                  >
                    <span className="status-dot" style={{ background: item.respondido ? '#4ade80' : '#facc15' }} />
                    {item.respondido ? 'Respondido' : 'Pendiente de respuesta'}
                  </span>
                  <h3 style={{ marginBottom: '4px' }} className="text-white">{item.asunto}</h3>
                  <p style={{ marginBottom: '8px', fontSize: '0.85rem' }} className="tabular-nums">
                    De: <strong style={{ color: '#fff' }}>{item.nombre}</strong> ({item.email}) •{' '}
                    {new Date(item.creado_en).toLocaleString('es-AR')}
                  </p>
                </div>
              </div>

              <p style={{ color: '#e2e8f0', marginBottom: '14px' }}>{item.mensaje}</p>

              {item.adjunto_nombre && (
                <p style={{ fontSize: '0.82rem', color: '#38bdf8', marginBottom: '14px' }} className="inline-flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                  <span>Archivo adjunto: <strong>{item.adjunto_nombre}</strong></span>
                </p>
              )}

              {item.respuesta && (
                <div className="mb-4 rounded-xl border border-indigo-400/30 bg-indigo-950/35 p-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300" style={{ marginBottom: '4px' }}>
                    Respuesta enviada por LOTUS
                    {item.respondido_en ? ` • ${new Date(item.respondido_en).toLocaleString('es-AR')}` : ''}
                  </p>
                  <p className="text-sm text-slate-200" style={{ marginBottom: 0 }}>
                    {item.respuesta}
                  </p>
                </div>
              )}

              {respondiendoId === item.id && (
                <form
                  onSubmit={(e) => enviarRespuestaEmail(e, item)}
                  className="mb-4 rounded-2xl border border-indigo-500/35 bg-slate-950/75 p-4"
                  noValidate
                >
                  <label htmlFor={`respuesta-contacto-${item.id}`} className="label-form">
                    Redactar respuesta oficial para {item.nombre} ({item.email}) *
                  </label>
                  <textarea
                    id={`respuesta-contacto-${item.id}`}
                    rows={3}
                    value={textoRespuesta}
                    onChange={(e) => setTextoRespuesta(e.target.value)}
                    placeholder="Escribí la respuesta (mín. 10 caracteres). Se enviará vía Nodemailer y quedará registrada en PostgreSQL..."
                    className="input-form"
                    style={{ marginBottom: '12px' }}
                    disabled={enviandoRespuesta}
                  />
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="submit"
                      disabled={enviandoRespuesta}
                      className="btn-primario"
                      style={{ padding: '8px 18px', fontSize: '0.84rem' }}
                    >
                      {enviandoRespuesta ? 'Enviando correo...' : 'Enviar Respuesta (Nodemailer)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRespondiendoId(null);
                        setTextoRespuesta('');
                      }}
                      disabled={enviandoRespuesta}
                      className="btn-secundario-outline"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              <div className="flex flex-wrap gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => abrirFormularioRespuesta(item)}
                  disabled={procesandoId === item.id}
                  className="btn-primario"
                  style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                >
                  <span>{respondiendoId === item.id ? 'Cerrar Editor' : item.respuesta ? 'Editar / Reenviar Respuesta' : 'Responder desde la Web'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => alternarRespondido(item.id)}
                  disabled={procesandoId === item.id}
                  className="btn-secundario-outline"
                >
                  {item.respondido ? 'Marcar como Pendiente' : 'Marcar como Respondido'}
                </button>
                <a
                  href={`mailto:${item.email}?subject=Re: ${encodeURIComponent(item.asunto)}`}
                  className="btn-secundario-outline"
                  style={{ textDecoration: 'none' }}
                >
                  Cliente de Correo Externo
                </a>
                <button
                  type="button"
                  onClick={() => eliminarContacto(item.id)}
                  disabled={procesandoId === item.id}
                  className="btn-peligro-outline"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================================
// 5. DASHBOARD DE MÉTRICAS Y GRÁFICOS INTERACTIVOS (Recharts + SQL Parametrizado)
// =====================================================================
export function DashboardMetricas({ pedirAPI, refrescarTrigger }) {
  const [dias, setDias] = useState(7);
  const [seccion, setSeccion] = useState('todas');
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [registrando, setRegistrando] = useState(false);
  const dashboardRef = useRef(null);

  const cargarMetricas = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        dias: String(dias),
        seccion
      });
      const res = await pedirAPI(`/metricas?${params.toString()}`);
      setDatos(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [pedirAPI, dias, seccion]);

  useEffect(() => {
    cargarMetricas();
  }, [cargarMetricas, refrescarTrigger]);

  const hayDatos = Boolean(datos);

  // Orquestación de entrada una sola vez para KPIs, filtros SQL y gráficos Recharts
  useLayoutEffect(() => {
    if (!hayDatos || yaFueAnimada('admin-dashboard')) return undefined;
    const scope = dashboardRef.current;
    if (!scope) return undefined;

    const tl = anime.timeline({
      easing: 'cubicBezier(0.22, 1, 0.36, 1)',
      duration: 560,
      root: scope
    });

    tl.add({
      targets: '.kpi-card',
      translateY: [18, 0],
      opacity: [0, 1],
      delay: anime.stagger(60)
    })
      .add(
        {
          targets: '.dashboard-filtros-card',
          translateY: [14, 0],
          opacity: [0, 1]
        },
        '-=420'
      )
      .add(
        {
          targets: '.dashboard-chart-card',
          translateY: [20, 0],
          opacity: [0, 1],
          delay: anime.stagger(70)
        },
        '-=390'
      );

    const timerMarca = setTimeout(() => {
      marcarComoAnimada('admin-dashboard');
    }, 180);

    return () => {
      clearTimeout(timerMarca);
      tl.revert();
    };
  }, [hayDatos]);

  const registrarVisitaManual = async (tipo) => {
    setRegistrando(true);
    setError(null);
    try {
      await pedirAPI('/metricas/visita', {
        method: 'POST',
        body: JSON.stringify({
          tipo,
          seccion: seccion === 'todas' ? 'inicio' : seccion
        })
      });
      await cargarMetricas();
    } catch (err) {
      setError(err.message);
    } finally {
      setRegistrando(false);
    }
  };

  const datosPie = datos
    ? [
        { name: 'Proyectos', value: datos.contenido.proyectos },
        { name: 'Demos', value: datos.contenido.demos },
        { name: 'Servicios', value: datos.contenido.servicios }
      ]
    : [];

  return (
    <div ref={dashboardRef}>
      {/* Contadores de Visitas (Punto 3: Visitas Generales vs Usuarios Registrados) */}
      <div className="grid-kpis" style={{ marginBottom: '30px' }}>
        <div
          className="card-proyecto kpi-card"
          style={{ willChange: 'transform, opacity' }}
          onMouseEnter={(e) => animarHoverTarjeta(e, true)}
          onMouseLeave={(e) => animarHoverTarjeta(e, false)}
        >
          <div
            className="icon-badge mx-auto"
            style={{
              background: 'rgba(59, 130, 246, 0.14)',
              borderColor: 'rgba(59, 130, 246, 0.35)',
              color: '#60a5fa'
            }}
            aria-hidden="true"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <span className="kpi-label">Visitas Generales (Tráfico Público)</span>
          <strong className="kpi-valor" style={{ color: '#3b82f6' }}>
            {datos ? datos.contadores.visitas_generales : '...'}
          </strong>
          <button
            onClick={() => registrarVisitaManual('general')}
            disabled={registrando}
            className="btn-secundario-outline"
            style={{ marginTop: '14px' }}
          >
            + Simular Visita General
          </button>
        </div>

        <div
          className="card-proyecto kpi-card"
          style={{ willChange: 'transform, opacity' }}
          onMouseEnter={(e) => animarHoverTarjeta(e, true)}
          onMouseLeave={(e) => animarHoverTarjeta(e, false)}
        >
          <div
            className="icon-badge mx-auto"
            style={{
              background: 'rgba(236, 72, 153, 0.14)',
              borderColor: 'rgba(236, 72, 153, 0.35)',
              color: '#f472b6'
            }}
            aria-hidden="true"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
          <span className="kpi-label">Accesos de Usuarios Registrados</span>
          <strong className="kpi-valor" style={{ color: '#ec4899' }}>
            {datos ? datos.contadores.accesos_autenticados : '...'}
          </strong>
          <button
            onClick={() => registrarVisitaManual('autenticado')}
            disabled={registrando}
            className="btn-secundario-outline"
            style={{ marginTop: '14px' }}
          >
            + Simular Acceso Autenticado
          </button>
        </div>

        <div
          className="card-proyecto kpi-card"
          style={{ willChange: 'transform, opacity' }}
          onMouseEnter={(e) => animarHoverTarjeta(e, true)}
          onMouseLeave={(e) => animarHoverTarjeta(e, false)}
        >
          <div className="icon-badge mx-auto" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span className="kpi-label">Tráfico Total Acumulado</span>
          <strong className="kpi-valor" style={{ color: '#6366f1' }}>
            {datos ? datos.contadores.total_visitas : '...'}
          </strong>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '12px', display: 'block' }} className="tabular-nums">
            Usuarios activos en padrón: <strong className="text-white">{datos ? datos.contenido.usuarios : 0}</strong>
          </span>
        </div>
      </div>

      {/* Controles de Consulta Parametrizada (Punto 4) */}
      <div
        className="card-proyecto dashboard-filtros-card"
        style={{ marginBottom: '30px', padding: '22px 26px', willChange: 'transform, opacity' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="tag-tecnologia" style={{ marginBottom: '6px' }}>
              <span className="status-dot" style={{ background: '#6366f1' }} />
              SQL Parametrizado • Tiempo Real
            </span>
            <h3 style={{ marginBottom: '4px', fontSize: '1.2rem' }} className="text-white">Filtros de Consulta Parametrizada (SQL)</h3>
            <p style={{ marginBottom: 0, fontSize: '0.85rem' }}>
              Actualiza los gráficos ejecutando <code className="px-2 py-0.5 rounded bg-white/5 text-indigo-300 border border-white/10 text-xs">GET /api/metricas?dias={dias}&amp;seccion={seccion}</code>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <label htmlFor="metricas-dias" className="label-form">Ventana Temporal</label>
              <select
                id="metricas-dias"
                value={dias}
                onChange={(e) => setDias(Number(e.target.value))}
                className="input-form"
                style={{ width: 'auto', marginBottom: 0, padding: '10px 16px' }}
                aria-label="Ventana de días"
              >
                <option value={7}>Últimos 7 días</option>
                <option value={14}>Últimos 14 días</option>
                <option value={30}>Últimos 30 días</option>
              </select>
            </div>

            <div>
              <label htmlFor="metricas-seccion" className="label-form">Sección Auditada</label>
              <select
                id="metricas-seccion"
                value={seccion}
                onChange={(e) => setSeccion(e.target.value)}
                className="input-form"
                style={{ width: 'auto', marginBottom: 0, padding: '10px 16px' }}
                aria-label="Sección del sitio"
              >
                <option value="todas">Todas las secciones</option>
                <option value="inicio">Sección: Inicio</option>
                <option value="repositorios">Sección: Proyectos API</option>
                <option value="gestion">Sección: Gestión Admin</option>
                <option value="demos">Sección: Demos</option>
                <option value="servicios">Sección: Servicios</option>
              </select>
            </div>
          </div>
        </div>
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

      {cargando && !datos ? (
        <div className="cargando-api">Consultando métricas en PostgreSQL...</div>
      ) : (
        datos && (
          <div className="grid-charts">
            {/* Gráfico 1: Barras - Tráfico de Visitas por Día */}
            <div
              className="card-proyecto dashboard-chart-card"
              style={{ willChange: 'transform, opacity' }}
              onMouseEnter={(e) => animarHoverTarjeta(e, true)}
              onMouseLeave={(e) => animarHoverTarjeta(e, false)}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 style={{ marginBottom: 0 }} className="text-white">Tráfico de Visitas ({dias} días)</h3>
                <span className="tag-tecnologia tabular-nums" style={{ marginBottom: 0 }}>
                  {datos.contadores.visitas_periodo} eventos
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', marginBottom: '18px' }}>
                Comparativa diaria entre tráfico general y accesos autenticados.
              </p>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datos.visitas_por_dia} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="fecha" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#121218',
                        border: '1px solid rgba(99, 102, 241, 0.45)',
                        borderRadius: '14px',
                        color: '#fff',
                        boxShadow: '0 16px 32px rgba(0, 0, 0, 0.5)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="generales" name="Visitas Generales" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="autenticados" name="Usuarios Registrados" fill="#ec4899" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 2: Circular - Proyectos vs Demos vs Servicios */}
            <div
              className="card-proyecto dashboard-chart-card"
              style={{ willChange: 'transform, opacity' }}
              onMouseEnter={(e) => animarHoverTarjeta(e, true)}
              onMouseLeave={(e) => animarHoverTarjeta(e, false)}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 style={{ marginBottom: 0 }} className="text-white">Distribución del Catálogo</h3>
                <span className="tag-tecnologia" style={{ marginBottom: 0 }}>Supabase 3FN</span>
              </div>
              <p style={{ fontSize: '0.85rem', marginBottom: '15px' }}>
                Proporción actual de Proyectos, Demos interactivas y Servicios ofertados en Supabase.
              </p>
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={datosPie}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {datosPie.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORES_PIE[index % COLORES_PIE.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#121218',
                        border: '1px solid rgba(99, 102, 241, 0.45)',
                        borderRadius: '14px',
                        color: '#fff',
                        boxShadow: '0 16px 32px rgba(0, 0, 0, 0.5)'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
                {datosPie.map((item, idx) => (
                  <span
                    key={item.name}
                    className="tag-tecnologia tabular-nums"
                    style={{ borderColor: COLORES_PIE[idx], color: '#e2e8f0', marginBottom: 0 }}
                  >
                    <span className="status-dot" style={{ background: COLORES_PIE[idx] }} />
                    {item.name}: <strong>{item.value}</strong>
                  </span>
                ))}
              </div>
            </div>

            {/* Gráfico 3: Barras Agrupadas - Tráfico por Sección Auditada */}
            {Array.isArray(datos.visitas_por_seccion) && datos.visitas_por_seccion.length > 0 && (
              <div
                className="card-proyecto dashboard-chart-card"
                style={{ gridColumn: '1 / -1', willChange: 'transform, opacity' }}
                onMouseEnter={(e) => animarHoverTarjeta(e, true)}
                onMouseLeave={(e) => animarHoverTarjeta(e, false)}
              >
                <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                  <h3 style={{ marginBottom: 0 }} className="text-white">
                    Rendimiento y Accesos por Sección (Últimos {dias} días)
                  </h3>
                  <span className="tag-tecnologia" style={{ marginBottom: 0 }}>
                    Desglose por Módulo
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', marginBottom: '18px' }}>
                  Volumen de interacciones por módulo del sistema diferenciando visitantes públicos y usuarios registrados.
                </p>
                <div style={{ width: '100%', height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={datos.visitas_por_seccion} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="seccion" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#121218',
                          border: '1px solid rgba(99, 102, 241, 0.45)',
                          borderRadius: '14px',
                          color: '#fff',
                          boxShadow: '0 16px 32px rgba(0, 0, 0, 0.5)'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="generales" name="Tráfico Público" fill="#6366f1" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="autenticados" name="Accesos Registrados" fill="#ec4899" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
