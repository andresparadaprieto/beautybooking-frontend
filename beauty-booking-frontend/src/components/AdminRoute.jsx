import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "./common/Loading";

/**
 * AdminRoute Component
 *
 * Protege rutas que requieren rol de administrador
 * Si el usuario no es admin, redirige con mensaje de error
 * Solo usuarios con rol ADMIN pueden acceder
 */
const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return <Loading fullScreen message="Verificando permisos..." />;
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si está autenticado pero no es admin, mostrar mensaje de acceso denegado
  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full p-4 inline-block mb-4">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 mb-6">
            No tienes permisos para acceder a esta sección.
            <br />
            Esta área es exclusiva para administradores.
          </p>
          <a href="/servicios" className="btn-primary inline-block">
            Volver a servicios
          </a>
        </div>
      </div>
    );
  }

  // Si es admin, renderizar las rutas hijas
  return <Outlet />;
};

export default AdminRoute;
