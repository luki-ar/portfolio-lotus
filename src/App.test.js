import React from 'react';
import { render, screen } from '@testing-library/react';
import { BlurText, GlassmorphismPortfolioBlock } from './components/ReactBitsEffects';
import {
  yaFueAnimada,
  marcarComoAnimada,
  reiniciarHistorialAnimaciones,
  scrollAlInicioInmediato
} from './utils/animaciones';
import {
  proyectoSchema,
  demoSchema,
  servicioSchema,
  respuestaContactoSchema,
  validarConEsquema
} from './utils/validaciones';

jest.mock('animejs', () => ({
  animate: () => null,
  createTimeline: () => ({ add: () => null, revert: () => null }),
  stagger: () => 0,
  spring: () => 'easeOutExpo',
  cubicBezier: () => 'easeOutExpo'
}));

jest.mock('gsap', () => ({
  __esModule: true,
  default: {
    registerPlugin: () => {},
    ticker: { add: () => {}, remove: () => {}, lagSmoothing: () => {} },
    context: (fn) => {
      fn();
      return { revert: () => {} };
    },
    fromTo: () => {},
    to: () => {}
  }
}));

jest.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    update: () => {},
    refresh: () => {}
  }
}));

jest.mock('lenis', () => ({
  __esModule: true,
  default: class MockLenis {
    on() {}
    raf() {}
    scrollTo() {}
    destroy() {}
  }
}));

describe('LOTUS Portfolio — GlassmorphismPortfolioBlock, Navegación y Validaciones CRUD', () => {
  beforeEach(() => {
    reiniciarHistorialAnimaciones();
  });

  test('renderiza el bloque GlassmorphismPortfolioBlock (SKILL1.md) con información del equipo LOTUS', () => {
    render(<GlassmorphismPortfolioBlock />);

    expect(
      screen.getByText(/LOTUS\. — Ingeniería Full-Stack/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/LOTUS\. Engineering Team/i)).toBeInTheDocument();
    expect(screen.getByText(/Casos & Demos/i)).toBeInTheDocument();
  });

  test('controla que las animaciones de entrada y BlurText corran una sola vez por vista y restablece el scroll arriba', () => {
    expect(yaFueAnimada('vista-inicio')).toBe(false);
    marcarComoAnimada('vista-inicio');
    expect(yaFueAnimada('vista-inicio')).toBe(true);

    const { container } = render(
      <BlurText text="Experiencias digitales" animado={false} />
    );
    expect(container.querySelectorAll('.rb-blur-word')).toHaveLength(0);
    expect(screen.getByText('Experiencias digitales')).toBeInTheDocument();

    const scrollSpy = jest.fn();
    window.scrollTo = scrollSpy;
    scrollAlInicioInmediato();
    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
  });

  test('valida correctamente los esquemas de edición CRUD y respuesta de contacto por email', () => {
    const valProy = validarConEsquema(proyectoSchema, {
      titulo: 'Plataforma LOTUS v2',
      tecnologias: 'React, GSAP, PostgreSQL',
      estado: 'Deployado'
    });
    expect(valProy.ok).toBe(true);

    const valDemo = validarConEsquema(demoSchema, {
      titulo: 'Demo Interactiva LOTUS',
      url_demo: 'https://portfolio-lotus.vercel.app',
      descripcion: 'Despliegue en vivo en Vercel'
    });
    expect(valDemo.ok).toBe(true);

    const valSrv = validarConEsquema(servicioSchema, {
      nombre: 'Arquitectura Cloud & APIs',
      categoria: 'Backend & APIs',
      precio_desde: 450,
      descripcion: 'Diseño e implementación de APIs RESTful con PostgreSQL.'
    });
    expect(valSrv.ok).toBe(true);

    const valRespCorta = validarConEsquema(respuestaContactoSchema, {
      respuesta: 'Corto'
    });
    expect(valRespCorta.ok).toBe(false);

    const valRespOk = validarConEsquema(respuestaContactoSchema, {
      respuesta: 'Hola, gracias por comunicarte con el equipo LOTUS. Te enviamos la cotización.'
    });
    expect(valRespOk.ok).toBe(true);
  });
});
