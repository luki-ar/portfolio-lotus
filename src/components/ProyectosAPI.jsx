import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { anime, animarHoverTarjeta } from '../utils/animaciones';

export default function ProyectosAPI() {
  const [repos, setRepos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const reposRef = useRef(null);

  useEffect(() => {
    fetch('https://api.github.com/users/luki-ar/repos?sort=updated')
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error('No se pudo conectar con la API');
        }
        return respuesta.json();
      })
      .then((datos) => {
        setRepos(datos);
        setCargando(false);
      })
      .catch((err) => {
        setError(err.message);
        setCargando(false);
      });
  }, []);

  // Cascada escalonada con anime.timeline() y spring(1, 80, 10, 0) al cargar los repositorios
  useLayoutEffect(() => {
    if (cargando || error || repos.length === 0) return;
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
  }, [cargando, error, repos.length]);

  if (cargando) {
    return (
      <div className="cargando-api">
        Sincronizando repositorios en vivo desde GitHub API...
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="p-4 my-6 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 text-center text-sm"
      >
        Error: {error}
      </div>
    );
  }

  return (
    <div ref={reposRef} className="mt-4">
      <div
        className="repos-header flex flex-wrap items-center justify-between gap-3 mb-4"
        style={{ willChange: 'transform, opacity' }}
      >
        <div>
          <span className="tag-tecnologia" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.35)' }}>
            <span className="status-dot" style={{ backgroundColor: '#38bdf8' }} />
            Integración REST Externa • GitHub API
          </span>
          <h2 className="text-2xl font-bold text-slate-100 mt-1">
            Repositorios en Tiempo Real
          </h2>
        </div>
        <span className="text-xs text-slate-400 tabular-nums">
          {repos.length} repositorios públicos sincronizados
        </span>
      </div>

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
              <span className="text-xs text-slate-400">
                Rama: <strong className="text-slate-200">{repo.default_branch || 'main'}</strong>
              </span>
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
