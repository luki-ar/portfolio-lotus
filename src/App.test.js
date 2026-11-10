import React from 'react';
import { render, screen } from '@testing-library/react';
import { GlassmorphismPortfolioBlock } from './components/ReactBitsEffects';
import {
  proyectoSchema,
  demoSchema,
  servicioSchema,
  respuestaContactoSchema,
  validarConEsquema
} from './utils/validaciones';

describe('LOTUS Portfolio — GlassmorphismPortfolioBlock & Validaciones CRUD', () => {
  test('renderiza el bloque GlassmorphismPortfolioBlock (SKILL1.md) con información del equipo LOTUS', () => {
    render(<GlassmorphismPortfolioBlock />);

    expect(
      screen.getByText(/LOTUS Studio — Ingeniería Full-Stack/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/LOTUS\. Engineering Team/i)).toBeInTheDocument();
    expect(screen.getByText(/Explorar Casos & Demos/i)).toBeInTheDocument();
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
