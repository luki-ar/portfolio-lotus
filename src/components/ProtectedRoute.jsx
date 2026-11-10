import React, { createContext, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ModuloAuth } from './SeccionesPublicas';

// Contexto global de Autenticación y Rol (Administrador vs Cliente)
export const AuthContext = createContext({
  usuarioActual: null,
  esAdmin: false,
  iniciarSesion: () => {},
  cerrarSesion: () => {}
});

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Determina si un usuario posee el rol de Operador / Administrador.
 * Acepta tanto 'Administrador' como 'admin' (sin distinguir mayúsculas).
 */
export function verificarEsAdmin(usuario) {
  if (!usuario || !usuario.rol) return false;
  const rolNormalizado = String(usuario.rol).trim().toLowerCase();
  return rolNormalizado === 'administrador' || rolNormalizado === 'admin';
}

/**
 * Componente de Ruta Protegida por Autenticación y Rol (RBAC):
 * - Si el visitante NO inició sesión -> Muestra el módulo de Login / Registro.
 * - Si la ruta requiere rol Administrador (`requiereAdmin = true`) y el usuario
 *   logueado es Cliente -> Bloquea el acceso y muestra pantalla 403 (Acceso Restringido).
 * - Si cumple los permisos -> Renderiza la vista solicitada (`children`).
 */
export default function ProtectedRoute({
  children,
  requiereAdmin = false,
  pedirAPI,
  tituloLogin
}) {
  const { usuarioActual, esAdmin, iniciarSesion, cerrarSesion } = useAuth();

  // 1) Visitante sin sesión iniciada: se solicita Login o Registro
  if (!usuarioActual) {
    return (
      <ModuloAuth
        pedirAPI={pedirAPI}
        onAutenticado={iniciarSesion}
        tituloPersonalizado={
          tituloLogin ||
          (requiereAdmin
            ? 'Acceso Restringido: Operador / Administrador'
            : 'Iniciá Sesión para ver Proyectos y Demos')
        }
      />
    );
  }

  // 2) Ruta exclusiva de Administrador, pero el usuario logueado tiene rol Cliente
  if (requiereAdmin && !esAdmin) {
    return (
      <div className="animar-entrada max-w-xl mx-auto px-5 py-16">
        <div className="card-proyecto text-center">
          <div
            className="icon-badge mx-auto"
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              borderColor: 'rgba(239, 68, 68, 0.35)',
              color: '#f87171'
            }}
            aria-hidden="true"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <rect x="9" y="10" width="6" height="5" rx="1" />
              <path d="M10 10V8a2 2 0 1 1 4 0v2" />
            </svg>
          </div>
          <span
            className="tag-tecnologia"
            style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.35)', background: 'rgba(239, 68, 68, 0.1)' }}
          >
            <span className="status-dot" style={{ background: '#ef4444' }} />
            Código 403 • Acceso Denegado por Rol
          </span>
          <h2 className="text-2xl font-bold mt-2 mb-3 tracking-tight text-white">
            Sección Exclusiva para Administradores
          </h2>
          <p className="text-sm text-gray-300 mb-6 leading-relaxed">
            Has iniciado sesión como <strong className="text-white">{usuarioActual.nombre}</strong> con el rol{' '}
            <strong style={{ color: '#38bdf8' }}>{usuarioActual.rol}</strong>. Tu cuenta tiene
            permiso para explorar el catálogo de <strong className="text-white">Proyectos y Demos</strong>, pero no
            para acceder al Panel de Gestión CRUD ni al Dashboard de Métricas.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/repositorios" className="btn-primario">
              Ir a Proyectos y Demos
            </Link>
            <button
              type="button"
              onClick={cerrarSesion}
              className="btn-secundario-outline"
              style={{ padding: '12px 22px', fontSize: '0.9rem' }}
            >
              Cambiar a Cuenta Administrador
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3) Usuario autenticado con permisos suficientes
  return children;
}
