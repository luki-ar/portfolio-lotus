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

/**
 * Convierte una definición de easing avanzada (como 'spring(1, 80, 10, 0)' o
 * 'cubicBezier(0.22, 1, 0.36, 1)') en la función nativa de Anime.js v4.
 */
export function resolverEasing(easingInput) {
  if (!easingInput) {
    return spring({ mass: 1, stiffness: 80, damping: 10, velocity: 0 });
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
      easing = 'spring(1, 80, 10, 0)',
      duration = 1000,
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
      duration: 1.12,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4
    });

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
    if (lenis) lenis.destroy();
  };
}

/**
 * Orquesta animaciones vinculadas al scroll (GSAP + ScrollTrigger) dentro de un contenedor.
 * Usa `gsap.context()` para revertir limpiamente al desmontar en React 19.
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
    grupos.forEach(({ selector, y = 24, staggerDelay = 0.08 }) => {
      const elementos = obtenerNodos(selector, scopeEl);
      if (elementos.length === 0) return;

      gsap.fromTo(
        elementos,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: staggerDelay,
          ease: 'power2.out',
          overwrite: 'auto',
          scrollTrigger: {
            trigger: elementos[0],
            start: 'top 90%',
            toggleActions: 'play none none reverse'
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
