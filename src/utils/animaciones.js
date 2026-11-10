import {
  animate,
  createTimeline,
  stagger,
  spring,
  cubicBezier
} from 'animejs';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Registro en memoria de vistas/secciones ya animadas durante la sesión actual
// para evitar que las animaciones de entrada se repitan al volver a una ruta visitada.
const vistasYaAnimadas = new Set();
let lenisActivo = null;

export function yaFueAnimada(clave) {
  return Boolean(clave && vistasYaAnimadas.has(clave));
}

export function marcarComoAnimada(clave) {
  if (clave) {
    vistasYaAnimadas.add(clave);
  }
}

export function reiniciarHistorialAnimaciones() {
  vistasYaAnimadas.clear();
}

/**
 * Restablece el desplazamiento al inicio de la página de forma inmediata al cambiar de ruta,
 * sincronizando tanto Lenis Smooth Scroll como el scroll nativo del navegador y ScrollTrigger.
 */
export function scrollAlInicioInmediato() {
  if (typeof window === 'undefined') return;

  if (lenisActivo) {
    try {
      lenisActivo.scrollTo(0, { immediate: true, force: true });
    } catch {
      // Fallback al scroll nativo del navegador debajo
    }
  }

  try {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  } catch {
    window.scrollTo(0, 0);
  }

  if (document.documentElement) document.documentElement.scrollTop = 0;
  if (document.body) document.body.scrollTop = 0;

  if (typeof ScrollTrigger !== 'undefined') {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }
}

/**
 * Convierte una definición de easing avanzada (como 'cubicBezier(0.22, 1, 0.36, 1)' o
 * 'spring(1, 120, 22, 0)') en la función nativa de Anime.js v4.
 */
export function resolverEasing(easingInput) {
  if (!easingInput) {
    return cubicBezier(0.22, 1, 0.36, 1);
  }
  if (typeof easingInput !== 'string') {
    return easingInput;
  }

  const limpio = easingInput.trim();

  if (limpio.startsWith('spring(') && limpio.endsWith(')')) {
    const partes = limpio
      .slice(7, -1)
      .split(',')
      .map((n) => Number(n.trim()));
    const [mass = 1, stiffness = 80, damping = 10, velocity = 0] = partes;
    return spring({ mass, stiffness, damping, velocity });
  }

  if (limpio.startsWith('cubicBezier(') && limpio.endsWith(')')) {
    const partes = limpio
      .slice(12, -1)
      .split(',')
      .map((n) => Number(n.trim()));
    const [x1 = 0.22, y1 = 1, x2 = 0.36, y2 = 1] = partes;
    return cubicBezier(x1, y1, x2, y2);
  }

  return limpio;
}

/**
 * Resuelve un selector o lista de nodos dentro de un contenedor (useRef)
 * y garantiza que existan elementos en el DOM antes de animar.
 */
export function obtenerNodos(targets, rootEl = null) {
  if (!targets) return [];
  if (typeof targets === 'string') {
    const base = rootEl || document;
    return Array.from(base.querySelectorAll(targets));
  }
  if (targets instanceof Element) {
    return [targets];
  }
  if (NodeList.prototype.isPrototypeOf(targets) || Array.isArray(targets)) {
    return Array.from(targets).filter(Boolean);
  }
  return [];
}

/**
 * Adaptador unificado de Anime.js que respeta la sintaxis de `SKILL.md`:
 * - `anime.timeline({ easing: 'spring(1, 80, 10, 0)', duration: 1000 })`
 * - `tl.add({ targets: '.elemento', translateY: [50, 0], opacity: [0, 1], delay: anime.stagger(100) }, '-=800')`
 * - `anime.stagger(100, { start: 150, from: 'first' })`
 */
export const anime = {
  stagger,
  spring: (mass = 1, stiffness = 80, damping = 10, velocity = 0) =>
    spring({ mass, stiffness, damping, velocity }),
  cubicBezier: (x1 = 0.22, y1 = 1, x2 = 0.36, y2 = 1) =>
    cubicBezier(x1, y1, x2, y2),

  animate: ({ targets, easing, root, ...rest }) => {
    const nodos = obtenerNodos(targets, root);
    if (nodos.length === 0) return null;
    return animate(nodos, {
      ...rest,
      ease: resolverEasing(easing || rest.ease)
    });
  },

  timeline: (opciones = {}) => {
    const {
      easing = 'cubicBezier(0.22, 1, 0.36, 1)',
      duration = 620,
      root = null,
      ...restoOpciones
    } = opciones;

    const nodosRegistrados = new Set();

    const tl = createTimeline({
      defaults: {
        ease: resolverEasing(easing),
        duration
      },
      ...restoOpciones
    });

    const wrapper = {
      instancia: tl,
      add(paso, offset) {
        if (!paso) return wrapper;
        const { targets, easing: pasoEasing, onComplete, ...propiedades } = paso;
        const nodos = obtenerNodos(targets, root);
        if (nodos.length === 0) return wrapper;

        nodos.forEach((n) => nodosRegistrados.add(n));

        const params = {
          ...propiedades,
          onComplete: (anim) => {
            nodos.forEach((n) => {
              n.style.opacity = '1';
              n.style.transform = '';
            });
            if (typeof onComplete === 'function') {
              onComplete(anim);
            }
          }
        };

        if (pasoEasing) {
          params.ease = resolverEasing(pasoEasing);
        }

        if (offset !== undefined) {
          tl.add(nodos, params, offset);
        } else {
          tl.add(nodos, params);
        }
        return wrapper;
      },
      revert() {
        try {
          tl.revert();
        } catch {
          // Ignorar si ya fue desmontado
        }
        nodosRegistrados.forEach((n) => {
          n.style.opacity = '';
          n.style.transform = '';
        });
      }
    };

    return wrapper;
  }
};

/**
 * Inicializa Lenis Smooth Scroll sincronizado con el ticker de GSAP y ScrollTrigger.
 * Respeta automáticamente `prefers-reduced-motion: reduce`.
 */
export function inicializarSmoothScrollLenis() {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return () => {};
  }

  let lenis = null;
  let tickerFn = null;

  try {
    lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4
    });

    lenisActivo = lenis;
    lenis.on('scroll', ScrollTrigger.update);

    tickerFn = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);
  } catch {
    return () => {};
  }

  return () => {
    if (tickerFn) gsap.ticker.remove(tickerFn);
    if (lenisActivo === lenis) lenisActivo = null;
    if (lenis) lenis.destroy();
  };
}

/**
 * Orquesta animaciones vinculadas al scroll (GSAP + ScrollTrigger) dentro de un contenedor.
 * Usa `once: true` para revelar una única vez sin revertirse al desplazarse hacia arriba.
 */
export function animarScrollRevealGSAP(scopeEl, grupos = []) {
  if (
    !scopeEl ||
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return () => {};
  }

  const ctx = gsap.context(() => {
    grupos.forEach(({ selector, y = 20, staggerDelay = 0.06 }) => {
      const elementos = obtenerNodos(selector, scopeEl);
      if (elementos.length === 0) return;

      gsap.fromTo(
        elementos,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.48,
          stagger: staggerDelay,
          ease: 'power2.out',
          overwrite: 'auto',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: elementos[0],
            start: 'top 90%',
            once: true,
            toggleActions: 'play none none none'
          }
        }
      );
    });
  }, scopeEl);

  return () => ctx.revert();
}

/**
 * Efecto parallax suave con GSAP ScrollTrigger sobre el Watermark de Flor de Loto.
 */
export function animarParallaxLotusGSAP(watermarkEl) {
  if (
    !watermarkEl ||
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return () => {};
  }

  const ctx = gsap.context(() => {
    const svg = watermarkEl.querySelector('.lotus-watermark-svg');
    if (!svg) return;

    gsap.to(svg, {
      yPercent: -10,
      rotation: 8,
      scale: 1.05,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2
      }
    });
  }, watermarkEl);

  return () => ctx.revert();
}

/**
 * El estado hover de `.card-proyecto` se delega a CSS nativo (`translate: 0 -6px`)
 * y al Spotlight interactivo (`--mouse-x`, `--mouse-y`) en `src/App.css`.
 */
export function animarHoverTarjeta() {
  // Manejado mediante `.card-proyecto:hover` y `.card-proyecto::after` en App.css
}

export { gsap, ScrollTrigger };
