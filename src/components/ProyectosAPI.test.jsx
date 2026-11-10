import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProyectosAPI from './ProyectosAPI';

jest.mock('../utils/animaciones', () => ({
  anime: {
    stagger: () => 0,
    timeline: () => ({
      add() {
        return this;
      },
      revert() {}
    })
  },
  animarHoverTarjeta: () => {},
  yaFueAnimada: () => false,
  marcarComoAnimada: () => {}
}));

describe('ProyectosAPI', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('muestra respaldo verificado sin banner rojo de error cuando GitHub API devuelve 403 rate limit', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      headers: {
        get: (name) => (name === 'X-RateLimit-Reset' ? '1794338044' : null)
      },
      json: async () => ({
        message: 'API rate limit exceeded'
      })
    });

    render(<ProyectosAPI />);

    await waitFor(
      () => {
        expect(screen.getByText('portfolio-lotus')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.queryByText(/No se pudo conectar con la API/i)).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/límite temporal de 60 consultas\/hora por IP/i);
    expect(screen.getByRole('button', { name: /Reintentar en vivo/i })).toBeInTheDocument();
  });

  test('guarda respuesta en vivo en cache local y evita refetch innecesario al re-montar', async () => {
    const mockRepos = [
      {
        id: 999,
        name: 'repo-en-vivo-github',
        description: 'Repositorio obtenido en vivo desde GitHub API.',
        language: 'JavaScript',
        default_branch: 'main',
        html_url: 'https://github.com/luki-ar/repo-en-vivo-github'
      }
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => mockRepos
    });

    const { unmount } = render(<ProyectosAPI />);

    await waitFor(() => {
      expect(screen.getByText('repo-en-vivo-github')).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);

    unmount();

    // Al volver a montar dentro del TTL, debe usar la caché sin volver a llamar a fetch
    render(<ProyectosAPI />);

    await waitFor(() => {
      expect(screen.getByText('repo-en-vivo-github')).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Al pulsar "Sincronizar ahora" fuerza un nuevo fetch
    fireEvent.click(screen.getByRole('button', { name: /Sincronizar ahora/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
