import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "./common/Loading";

/**
 * PrivateRoute Component
 *
 * Protege rutas que requieren autenticación
 * Si el usuario no está autenticado, redirige a login
 * Guarda la ubicación actual para volver después del login
 */

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return <Loading fullScreen message="Verificando sesión..." />;
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated()) {
    // Guardar la ubicación actual para redirigir después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si está autenticado, renderizar las rutas hijas
  return <Outlet />;
};

export default PrivateRoute;
