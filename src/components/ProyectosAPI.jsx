import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { anime, animarHoverTarjeta } from '../utils/animaciones';

const GITHUB_USUARIO = 'luki-ar';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USUARIO}/repos?sort=updated&per_page=12`;
const GITHUB_PERFIL_REPOS_URL = `https://github.com/${GITHUB_USUARIO}?tab=repositories`;
const CACHE_KEY = 'lotus_github_repos_cache_v1';
const CACHE_TTL_MS = 30 * 60 * 1000;

// Catálogo real verificado desde github.com/luki-ar para evitar fallos cuando GitHub API
// agota su cuota pública de 60 req/h por IP (HTTP 403/429).
const REPOS_RESPALDO_VERIFICADOS = [
  {
    id: 'respaldo-portfolio-lotus',
    name: 'portfolio-lotus',
    description:
      'Portfolio de LOTUS, profesionales especializados en la construcción de aplicaciones web modernas bajo arquitectura en 3 capas.',
    language: 'JavaScript',
    default_branch: 'main',
    html_url: 'https://github.com/luki-ar/portfolio-lotus'
  },
  {
    id: 'respaldo-tp9-lengiv',
    name: 'TP9-LENGIV',
    description: 'Trabajo práctico de desarrollo web con React — Lenguajes IV.',
    language: 'JavaScript',
    html_url: 'https://github.com/luki-ar/TP9-LENGIV'
  },
  {
    id: 'respaldo-tp1-leng4',
    name: 'TP1-LENG4',
    description: 'Trabajo práctico inicial de maquetación y estilos — Lenguajes IV.',
    language: 'CSS',
    html_url: 'https://github.com/luki-ar/TP1-LENG4'
  },
  {
    id: 'respaldo-tp6-leng4',
    name: 'TP6---LENG4',
    description: 'Práctica de desarrollo frontend — Lenguajes IV.',
    language: 'JavaScript',
    html_url: 'https://github.com/luki-ar/TP6---LENG4'
  },
  {
    id: 'respaldo-tp8-leng4',
    name: 'TP8-LENG4',
    description: 'Práctica de componentes y lógica en JavaScript — Lenguajes IV.',
    language: 'JavaScript',
    html_url: 'https://github.com/luki-ar/TP8-LENG4'
  },
  {
    id: 'respaldo-tp10-leng3',
    name: 'TP10-LENG3',
    description: 'Proyecto integrador de programación web — Lenguajes III.',
    language: 'JavaScript',
    html_url: 'https://github.com/luki-ar/TP10-LENG3'
  },
  {
    id: 'respaldo-parcial-leng3',
    name: 'ParcialLeng3-ColqueLucasAriel',
    description: 'Evaluación parcial de JavaScript y DOM — Lenguajes III.',
    language: 'JavaScript',
    html_url: 'https://github.com/luki-ar/ParcialLeng3-ColqueLucasAriel'
  },
  {
    id: 'respaldo-parcial',
    name: 'Parcial-ColqueLucasAriel',
    description: 'Instancia evaluativa práctica en JavaScript — Lenguajes III.',
    language: 'JavaScript',
    html_url: 'https://github.com/luki-ar/Parcial-ColqueLucasAriel'
  },
  {
    id: 'respaldo-tp8-repaso',
    name: 'TP8-RepasoParcial',
    description: 'Ejercitación de repaso web en HTML/JavaScript — Lenguajes III.',
    language: 'HTML',
    html_url: 'https://github.com/luki-ar/TP8-RepasoParcial'
  }
];

function leerCacheRepos() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed.timestamp !== 'number' ||
      !Array.isArray(parsed.repos) ||
      parsed.repos.length === 0
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function guardarCacheRepos(repos) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        repos
      })
    );
  } catch {
    // Ignorar si localStorage está deshabilitado o sin espacio
  }
}

function formatearHoraReset(resetHeader) {
  const epochSegundos = Number(resetHeader);
  if (!Number.isFinite(epochSegundos) || epochSegundos <= 0) return null;
  try {
    return new Date(epochSegundos * 1000).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return null;
  }
}

export default function ProyectosAPI() {
  const [repos, setRepos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [origenDatos, setOrigenDatos] = useState('live'); // 'live' | 'cache' | 'rate-limit' | 'fallback'
  const [aviso, setAviso] = useState(null);
  const [recargaToken, setRecargaToken] = useState(0);
  const forzarFetchRef = useRef(false);
  const reposRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const forzarFetch = forzarFetchRef.current;
    forzarFetchRef.current = false;

    const cache = leerCacheRepos();
    const cacheVigente = cache && Date.now() - cache.timestamp < CACHE_TTL_MS;

    if (!forzarFetch && cacheVigente) {
      setRepos(cache.repos);
      setOrigenDatos('cache');
      setAviso(null);
      setCargando(false);
      return () => controller.abort();
    }

    setCargando(true);

    fetch(GITHUB_API_URL, {
      signal: controller.signal,
      headers: { Accept: 'application/vnd.github+json' }
    })
      .then(async (respuesta) => {
        if (!respuesta.ok) {
          const err = new Error(`GitHub API HTTP ${respuesta.status}`);
          err.status = respuesta.status;
          err.resetHora = formatearHoraReset(respuesta.headers?.get('X-RateLimit-Reset'));
          throw err;
        }
        return respuesta.json();
      })
      .then((datos) => {
        if (controller.signal.aborted) return;
        if (Array.isArray(datos) && datos.length > 0) {
          guardarCacheRepos(datos);
          setRepos(datos);
          setOrigenDatos('live');
          setAviso(null);
        } else {
          const reposAlternativos = cache?.repos || REPOS_RESPALDO_VERIFICADOS;
          setRepos(reposAlternativos);
          setOrigenDatos('fallback');
          setAviso(
            `No se recibieron repositorios nuevos desde GitHub API. Mostrando ${
              cache ? 'caché local' : 'catálogo verificado'
            } de @${GITHUB_USUARIO}.`
          );
        }
      })
      .catch((err) => {
        if (err?.name === 'AbortError' || controller.signal.aborted) return;

        const reposAlternativos = cache?.repos || REPOS_RESPALDO_VERIFICADOS;
        const esRateLimit = err?.status === 403 || err?.status === 429;
        const fuenteTexto = cache ? 'el último caché sincronizado' : 'el catálogo verificado';

        setRepos(reposAlternativos);
        setOrigenDatos(esRateLimit ? 'rate-limit' : 'fallback');

        if (esRateLimit) {
          setAviso(
            `La API pública de GitHub alcanzó su límite temporal de 60 consultas/hora por IP${
              err.resetHora ? ` (se restablece aprox. a las ${err.resetHora} hs)` : ''
            }. Mostrando ${fuenteTexto} de @${GITHUB_USUARIO}.`
          );
        } else {
          setAviso(
            `No se pudo sincronizar en vivo con GitHub API en este momento. Mostrando ${fuenteTexto} de @${GITHUB_USUARIO}.`
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      });

    return () => controller.abort();
  }, [recargaToken]);

  const manejarSincronizacion = () => {
    forzarFetchRef.current = true;
    setRecargaToken((n) => n + 1);
  };

  // Cascada escalonada con anime.timeline() y spring(1, 80, 10, 0) al cargar los repositorios
  useLayoutEffect(() => {
    if (cargando || repos.length === 0) return;
    const scope = reposRef.current;
    if (!scope) return;

    const tl = anime.timeline({
      easing: 'spring(1, 80, 10, 0)',
      duration: 950,
      root: scope
    });

    tl.add({
      targets: '.repos-header',
      translateY: [-18, 0],
      opacity: [0, 1]
    }).add(
      {
        targets: '.repo-card-anim',
        translateY: [45, 0],
        scale: [0.93, 1],
        opacity: [0, 1],
        delay: anime.stagger(75)
      },
      '-=750'
    );

    return () => tl.revert();
  }, [cargando, repos.length]);

  if (cargando) {
    return (
      <div className="cargando-api">
        Sincronizando repositorios...
      </div>
    );
  }

  const esModoRespaldo = origenDatos === 'rate-limit' || origenDatos === 'fallback';
  const etiquetaOrigen =
    origenDatos === 'live'
      ? 'Integración REST Externa • GitHub API'
      : origenDatos === 'cache'
      ? 'GitHub API • Caché Local Sincronizado'
      : 'GitHub API • Catálogo Verificado de Respaldo';
  const colorEstado = esModoRespaldo ? '#fbbf24' : origenDatos === 'cache' ? '#4ade80' : '#38bdf8';

  return (
    <div ref={reposRef} className="mt-4">
      <div
        className="repos-header flex flex-wrap items-center justify-between gap-3 mb-4"
        style={{ willChange: 'transform, opacity' }}
      >
        <div>
          <span
            className="tag-tecnologia"
            style={{
              color: colorEstado,
              borderColor: esModoRespaldo
                ? 'rgba(251, 191, 36, 0.35)'
                : origenDatos === 'cache'
                ? 'rgba(74, 222, 128, 0.35)'
                : 'rgba(56, 189, 248, 0.35)'
            }}
          >
            <span className="status-dot" style={{ backgroundColor: colorEstado }} />
            {etiquetaOrigen}
          </span>
          <h2 className="text-2xl font-bold text-slate-100 mt-1">
            Repositorios
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-slate-400 tabular-nums">
            {repos.length} repositorios públicos
          </span>
          <button
            type="button"
            onClick={manejarSincronizacion}
            className="btn-secundario-outline"
            style={{ padding: '6px 14px', fontSize: '0.78rem' }}
          >
            {esModoRespaldo ? 'Reintentar en vivo' : 'Sincronizar ahora'}
          </button>
        </div>
      </div>

      {aviso && (
        <div
          role="status"
          className="mb-5 p-3.5 rounded-xl border border-amber-500/35 bg-amber-500/10 text-amber-200 text-xs flex flex-wrap items-center justify-between gap-3"
        >
          <span>{aviso}</span>
          <a
            href={GITHUB_PERFIL_REPOS_URL}
            target="_blank"
            rel="noreferrer"
            className="text-sky-300 underline font-medium shrink-0"
          >
            Abrir perfil en GitHub
          </a>
        </div>
      )}

      <div className="grid-proyectos">
        {repos.map((repo) => (
          <div
            key={repo.id}
            className="card-proyecto repo-card-anim flex flex-col justify-between"
            style={{ willChange: 'transform, opacity' }}
            onMouseEnter={(e) => animarHoverTarjeta(e, true)}
            onMouseLeave={(e) => animarHoverTarjeta(e, false)}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="icon-badge" style={{ marginBottom: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                </div>
                <span className="tag-tecnologia" style={{ marginBottom: 0 }}>
                  <span className="status-dot" style={{ backgroundColor: '#818cf8' }} />
                  {repo.language || 'JavaScript / React'}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-sky-400 mb-2 break-words">
                {repo.name}
              </h3>
              <p className="text-slate-300 text-sm mb-5">
                {repo.description
                  ? repo.description
                  : 'Proyecto práctico de desarrollo en React - Lenguajes IV.'}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
              {repo.default_branch ? (
                <span className="text-xs text-slate-400">
                  Rama: <strong className="text-slate-200">{repo.default_branch}</strong>
                </span>
              ) : (
                <span className="text-xs text-slate-400">
                  Perfil: <strong className="text-slate-200">@{GITHUB_USUARIO}</strong>
                </span>
              )}
              <a
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="btn-primario"
                style={{ padding: '8px 18px', fontSize: '0.82rem' }}
              >
                <span>Ver Código</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M7 17L17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
