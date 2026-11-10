import {
  animate,
  createTimeline,
  stagger,
  spring,
  cubicBezier
} from 'animejs';

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
 * Adaptador unificado de Anime.js que respeta la sintaxis de `skill.md`:
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

  animate: ( { targets, easing, root, ...rest } ) => {
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
 * El estado hover de `.card-proyecto` se delega a CSS nativo (`translate: 0 -6px`)
 * en `src/App.css` para que componga de forma independiente a `transform` y nunca
 * interrumpa ni desfase la línea de tiempo (`anime.timeline`) de entrada.
 */
export function animarHoverTarjeta() {
  // Manejado de forma 100% estable mediante `.card-proyecto:hover` en App.css
}
