import React, { useEffect } from 'react';

/**
 * React Bits — ShinyText
 * Efecto de barrido especular metálico continuo sobre texto/insignias Glassmorphism.
 */
export function ShinyText({ children, className = '', speed = 4 }) {
  return (
    <span
      className={`rb-shiny-text ${className}`.trim()}
      style={{ '--shiny-duration': `${speed}s` }}
    >
      {children}
    </span>
  );
}

/**
 * React Bits — BlurText
 * Revelado palabra por palabra con desenfoque óptico progresivo (blur-to-crisp).
 */
export function BlurText({ text = '', className = '', delayStep = 70 }) {
  const palabras = String(text).trim().split(/\s+/).filter(Boolean);

  return (
    <span className={`rb-blur-text-wrap ${className}`.trim()}>
      {palabras.map((palabra, idx) => (
        <span
          key={`${palabra}-${idx}`}
          className="rb-blur-word"
          style={{ animationDelay: `${idx * delayStep}ms` }}
        >
          {palabra}
          {idx < palabras.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </span>
  );
}

/**
 * React Bits — AuroraGlassBackground
 * Esferas bioluminiscentes en capas detrás del cristal esmerilado para que
 * `backdrop-filter: blur() saturate()` refracte luz real al desplazarse con Lenis + GSAP.
 */
export function AuroraGlassBackground() {
  return (
    <div className="glass-ambient-stage" aria-hidden="true">
      <div className="glass-orb glass-orb-indigo" />
      <div className="glass-orb glass-orb-rose" />
      <div className="glass-orb glass-orb-cyan" />
      <div className="glass-grid-overlay" />
    </div>
  );
}

const HIGHLIGHTS_LOTUS = [
  {
    title: 'Arquitectura & Stack',
    description:
      'React 19, Tailwind CSS, Node.js/Express, PostgreSQL (Supabase), validación estricta con Zod y control de acceso RBAC.'
  },
  {
    title: 'Sistema de Movimiento',
    description:
      'Lenis Smooth Scroll, GSAP ScrollTrigger, Anime.js spring(1, 80, 10, 0) y efectos React Bits (SpotlightCard, BlurText, ShinyText).'
  },
  {
    title: 'Disponibilidad & Cloud',
    description:
      'Despliegue continuo en Vercel (Frontend), Render (API REST) y Supabase Cloud con caché resiliente para GitHub REST API.'
  }
];

const ENLACES_LOTUS = [
  {
    label: 'GitHub Oficial',
    handle: '@luki-ar/portfolio-lotus',
    href: 'https://github.com/luki-ar/portfolio-lotus',
    external: true,
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    )
  },
  {
    label: 'Catálogo & Demos Live',
    handle: 'Proyectos + GitHub API en vivo',
    to: '/repositorios',
    external: false,
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    )
  },
  {
    label: 'Servicios & Stack Técnico',
    handle: 'Prestaciones + Arquitectura 3 Capas',
    to: '/perfil',
    external: false,
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    )
  },
  {
    label: 'Canal de Contacto Directo',
    handle: 'Consultas vía Nodemailer + PostgreSQL',
    to: '/contacto',
    external: false,
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    )
  }
];

/**
 * Bloque Glassmorphism de Portfolio (basado en SKILL1.md — GlassmorphismPortfolioBlock)
 * Combina contenedor esmerilado multicapa (`backdrop-blur-2xl`), tarjetas de highlights con
 * elevación interactiva y tarjeta de estudio con emblema bioluminiscente y accesos directos.
 */
export function GlassmorphismPortfolioBlock({ LinkComponent = 'a' }) {
  const renderInternalLink = (to, className, children, key) => {
    if (LinkComponent === 'a') {
      return (
        <a key={key} href={to} className={className}>
          {children}
        </a>
      );
    }
    return (
      <LinkComponent key={key} to={to} className={className}>
        {children}
      </LinkComponent>
    );
  };

  return (
    <section
      className="relative overflow-hidden"
      style={{ maxWidth: '1050px', margin: '0 auto', padding: '0 20px 64px' }}
    >
      <div className="card-proyecto glass-insight-block relative overflow-hidden rounded-3xl border border-white/15 bg-slate-900/50 p-7 backdrop-blur-2xl md:p-10">
        {/* Glass gradient overlay */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/[0.08] via-transparent to-pink-500/[0.05]"
          aria-hidden="true"
        />

        <div className="relative grid gap-10 lg:grid-cols-2 items-stretch">
          {/* Columna izquierda — Contenido principal + Highlights */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-950/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.26em] text-indigo-200 backdrop-blur">
                <span className="status-dot" style={{ background: '#38bdf8', marginRight: 0 }} />
                <ShinyText speed={4.5}>Portfolio Insight • Glassmorphism UI</ShinyText>
              </span>

              <div className="space-y-3">
                <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                  LOTUS. — Ingeniería Full-Stack &amp; Dirección de Movimiento
                </h2>
                <p className="text-sm leading-relaxed text-slate-300 md:text-base" style={{ marginBottom: 0 }}>
                  Portfolio diseñado con <strong className="text-white">Obsidian Botanical Glassmorphism.</strong> fusionando persistencia transaccional y APIs RESTful en la nube.
                </p>
              </div>

              {/* Grilla de Highlights */}
              <div className="grid gap-3.5">
                {HIGHLIGHTS_LOTUS.map((item) => (
                  <div
                    key={item.title}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/55 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/40 hover:shadow-lg"
                  >
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/[0.08] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                    <div className="relative space-y-1.5">
                      <p
                        className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-300"
                        style={{ marginBottom: 0 }}
                      >
                        {item.title}
                      </p>
                      <p
                        className="text-xs md:text-sm leading-relaxed text-slate-300"
                        style={{ marginBottom: 0 }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón CTA */}
            <div className="pt-2">
              {renderInternalLink(
                '/repositorios',
                'btn-primario inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-xs uppercase tracking-[0.2em]',
                <>
                  <span>Casos &amp; Demos</span>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </>
              )}
            </div>
          </div>

          {/* Columna derecha — Tarjeta de Perfil / Estudio con Accesos Directos */}
          <div className="relative flex flex-col">
            <div
              className="pointer-events-none absolute inset-0 rounded-[32px] bg-gradient-to-b from-indigo-500/20 via-pink-500/10 to-transparent blur-3xl"
              aria-hidden="true"
            />
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[26px] border border-white/15 bg-slate-950/65 p-6 md:p-8 backdrop-blur-xl">
              <div className="flex flex-col items-center text-center">
                {/* Emblema de Avatar con halo luminoso */}
                <div className="relative mb-5">
                  <div
                    className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/30 blur-2xl"
                    aria-hidden="true"
                  />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-indigo-400/40 bg-slate-900/90 shadow-[0_20px_50px_rgba(0,0,0,0.65)]">
                    <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="url(#lotusBlockGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <defs>
                        <linearGradient id="lotusBlockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#818cf8" />
                          <stop offset="50%" stopColor="#f472b6" />
                          <stop offset="100%" stopColor="#38bdf8" />
                        </linearGradient>
                      </defs>
                      <path d="M12 3C14.8 7.5 16.5 11.8 12 19.5C7.5 11.8 9.2 7.5 12 3Z" />
                      <path d="M12 19.5C7.2 15.8 4.5 11 5.6 6.2C8.8 8.4 10.9 12.6 12 19.5Z" />
                      <path d="M12 19.5C16.8 15.8 19.5 11 18.4 6.2C15.2 8.4 13.1 12.6 12 19.5Z" />
                      <path d="M5 21C8.8 22.4 15.2 22.4 19 21" />
                    </svg>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight text-white" style={{ marginBottom: '2px' }}>
                    LOTUS. Engineering Team
                  </h3>
                </div>

                <p
                  className="mt-3 max-w-sm text-xs md:text-sm leading-relaxed text-slate-300"
                  style={{ marginBottom: 0 }}
                >
                  Alvarado Pilar, Colque Lucas, Vargas Gabriel y Navarro Mauricio son los encargados de construir tu propia experiencia digital increible. Diseñando interfaces veloces y conectadas en tiempo real.
                </p>
              </div>


              <div className="mt-6 flex flex-col gap-2.5">
                {ENLACES_LOTUS.map((item) => {
                  const innerContent = (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-slate-900/80 text-indigo-300 shadow-[0_8px_20px_rgba(0,0,0,0.4)] transition-colors group-hover:border-indigo-400/50 group-hover:text-white">
                          {item.icon}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white" style={{ marginBottom: 0 }}>
                            {item.label}
                          </p>
                          <p className="text-xs text-slate-400" style={{ marginBottom: 0 }}>
                            {item.handle}
                          </p>
                        </div>
                      </div>
                      <svg
                        className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-indigo-300"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </>
                  );

                  const cardClass =
                    'group flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/65 px-4 py-2.5 text-left no-underline transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400/40 hover:bg-slate-900/90 hover:shadow-md';

                  return item.external ? (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cardClass}
                    >
                      {innerContent}
                    </a>
                  ) : (
                    renderInternalLink(item.to, cardClass, innerContent, item.label)
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * React Bits — SpotlightCard
 * `--mouse-x` y `--mouse-y` en tiempo real sobre cualquier
 * tarjeta `.card-proyecto` bajo el cursor para proyectar refracción especular interactiva.
 */
export function useGlobalCardSpotlight() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return undefined;

    let rafId = null;

    const handlePointerMove = (e) => {
      const target = e.target instanceof Element ? e.target.closest('.card-proyecto') : null;
      if (!target) return;

      const clientX = e.clientX;
      const clientY = e.clientY;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect();
        target.style.setProperty('--mouse-x', `${(clientX - rect.left).toFixed(1)}px`);
        target.style.setProperty('--mouse-y', `${(clientY - rect.top).toFixed(1)}px`);
      });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);
}
