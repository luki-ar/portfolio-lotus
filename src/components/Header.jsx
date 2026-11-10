import React from 'react';

export default function Header({ titulo, subtitulo }) {
  return (
    <header className="animar-entrada" style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }}>
      <h1 style={{ color: '#38bdf8', fontSize: '2rem', marginBottom: '8px' }}>
        {titulo}
      </h1>
      {subtitulo && (
        <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
          {subtitulo}
        </p>
      )}
    </header>
  );
}