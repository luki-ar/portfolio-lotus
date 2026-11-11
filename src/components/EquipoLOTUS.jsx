import React, { useState } from 'react';
import { animarHoverTarjeta } from '../utils/animaciones';

const PUBLIC_BASE = process.env.PUBLIC_URL || '';

export const EQUIPO_LOTUS = [
  {
    nombre: 'Lucas Colque',
    iniciales: 'LC',
    rol: 'QA & Testing',
    especialidad: 'Validación estricta Zod, auditoría de seguridad RBAC y pruebas en Jest y Postman.',
    foto: `${PUBLIC_BASE}/equipo/lucas.jpg`,
    habilidades: ['Postman', 'Git', 'Jest']
  },
  {
    nombre: 'Mauricio Navarro',
    iniciales: 'MN',
    rol: 'Backend Developer',
    especialidad: 'API REST en Node.js y Express (3 capas), CRUD completo y envíos con Nodemailer.',
    foto: `${PUBLIC_BASE}/equipo/mauricio.jpg`,
    habilidades: ['Node.js', 'Python', 'Express']
  },
  {
    nombre: 'Gabriel Vargas',
    iniciales: 'GV',
    rol: 'Database Admin',
    especialidad: 'Modelado relacional 3FN en PostgreSQL, transacciones ACID y despliegue en Supabase.',
    foto: `${PUBLIC_BASE}/equipo/gabriel.jpg`,
    habilidades: ['PostgreSQL', 'Supabase', 'SQL']
  },
  {
    nombre: 'Pilar Alvarado',
    iniciales: 'PA',
    rol: 'Frontend & UI/UX',
    especialidad: 'Diseño Obsidian Botanical Glassmorphism, componentes React y animaciones cinéticas.',
    foto: `${PUBLIC_BASE}/equipo/pilar.jpg`,
    habilidades: ['React', 'CSS', 'APIs']
  }
];

function TarjetaMiembroEquipo({ miembro }) {
  const [fotoActiva, setFotoActiva] = useState(false);
  const [errorImagen, setErrorImagen] = useState(false);

  return (
    <article
      className={`card-proyecto team-animada team-card ${fotoActiva ? 'team-card-foto-activa' : ''}`}
      style={{ willChange: 'transform, opacity' }}
      onMouseEnter={(e) => animarHoverTarjeta(e, true)}
      onMouseLeave={(e) => {
        animarHoverTarjeta(e, false);
        setFotoActiva(false);
      }}
    >
      <div className="team-card-inner">
        <div className="team-card-info">
          <div>
            <div className="flex items-center gap-3 mb-2.5">
              <div
                className="icon-badge team-initials-badge"
                style={{
                  marginBottom: 0,
                  width: '40px',
                  height: '40px',
                  borderRadius: '11px',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
                aria-hidden="true"
              >
                {miembro.iniciales}
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ marginBottom: '2px', fontSize: '1.15rem' }} className="text-white">
                  {miembro.nombre}
                </h3>
                <p
                  style={{
                    color: 'var(--accent-3)',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    marginBottom: 0
                  }}
                >
                  {miembro.rol}
                </p>
              </div>
            </div>

            <p className="team-card-desc">{miembro.especialidad}</p>
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-wrap gap-y-1">
            {miembro.habilidades.map((hab) => (
              <span key={hab} className="tag-tecnologia" style={{ marginBottom: 0 }}>
                {hab}
              </span>
            ))}
          </div>
        </div>

        <div className="team-photo-stage">
          <div className="team-photo-monogram" aria-hidden="true">
            <svg
              className="team-photo-lotus-lines"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M60 18C74 40 82 62 60 96C38 62 46 40 60 18Z"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path
                d="M60 96C36 78 24 54 30 32C46 44 55 64 60 96Z"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M60 96C84 78 96 54 90 32C74 44 65 64 60 96Z"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
            <span className="team-photo-monogram-initials">{miembro.iniciales}</span>
            <span className="team-photo-hint">Ver foto</span>
          </div>

          {!errorImagen && (
            <img
              src={miembro.foto}
              alt={`Retrato de ${miembro.nombre}, ${miembro.rol}`}
              className="team-photo-img"
              loading="eager"
              decoding="async"
              onError={() => setErrorImagen(true)}
            />
          )}

          <button
            type="button"
            className="team-photo-trigger"
            onClick={() => setFotoActiva((prev) => !prev)}
            aria-pressed={fotoActiva}
            aria-label={
              fotoActiva
                ? `Ocultar foto de ${miembro.nombre}`
                : `Ver foto de ${miembro.nombre}`
            }
          />
        </div>
      </div>
    </article>
  );
}

export default function EquipoTrabajoGrid() {
  return (
    <div className="grid-equipo">
      {EQUIPO_LOTUS.map((miembro) => (
        <TarjetaMiembroEquipo key={miembro.nombre} miembro={miembro} />
      ))}
    </div>
  );
}
