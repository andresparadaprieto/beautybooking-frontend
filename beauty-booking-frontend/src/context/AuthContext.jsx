import React, { createContext, useState, useContext, useEffect } from "react";
import authService from "../services/authService";

/**
 * AuthContext - Contexto de autenticación
 *
 *
 * Este contexto maneja:
 * - Estado del usuario actual
 * - Estado de carga inicial
 * - Funciones de login/logout/registro
 * - Verificación de roles
 */

// Creamos el contexto
const AuthContext = createContext(null);

/**
 * Hook personalizado para usar el contexto de autenticación
 * Esto simplifica el uso en los componentes
 * @returns {Object} Contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  // Verificamos que el contexto esté disponible
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
};

/**
 * AuthProvider - Componente que provee el contexto
 * Envuelve toda la aplicación para proveer autenticación global
 */
export const AuthProvider = ({ children }) => {
  // Estado del usuario actual
  const [user, setUser] = useState(null);

  // Estado de carga inicial (mientras verificamos si hay sesión guardada)
  const [loading, setLoading] = useState(true);

  // Estado de error (para mostrar mensajes)
  const [error, setError] = useState(null);

  /**
   * useEffect - Se ejecuta al montar el componente
   * Verifica si hay una sesión guardada en localStorage
   */
  useEffect(() => {
    console.log("🔍 Verificando sesión existente...");
    checkAuth();
  }, []);

  /**
   * Verifica si hay un usuario autenticado al cargar la app
   */
  const checkAuth = () => {
    try {
      // Intentamos obtener el usuario del localStorage
      const savedUser = authService.getUser();
      const token = authService.getToken();

      if (savedUser && token) {
        console.log("✅ Sesión encontrada:", savedUser.email);
        setUser(savedUser);
      } else {
        console.log("❌ No hay sesión guardada");
      }
    } catch (error) {
      console.error("Error verificando autenticación:", error);
      setError("Error al verificar la sesión");
    } finally {
      // Terminamos la carga inicial
      setLoading(false);
    }
  };

  /**
   * Función de login
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} Usuario autenticado
   */
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      // Llamamos al servicio de autenticación
      const response = await authService.login(email, password);

      // El backend puede devolver: { usuario: {...} } o { id, email, nombre, rol }
      // Manejar ambas estructuras
      const usuario = response.usuario || {
        id: response.id,
        email: response.email,
        nombre: response.nombre,
        rol: response.rol,
      };

      // Actualizamos el estado con el usuario
      setUser(usuario);

      console.log("✅ Login exitoso en contexto, usuario:", usuario);
      return response;
    } catch (error) {
      // Manejamos el error
      const errorMessage = error.message || "Error al iniciar sesión";
      setError(errorMessage);
      console.error("❌ Error en login:", errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Función de registro
   * @param {Object} userData - Datos del nuevo usuario
   * @returns {Promise<Object>} Usuario creado
   */
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      // Llamamos al servicio de registro
      const response = await authService.register(userData);

      // El backend puede devolver: { usuario: {...} } o { id, email, nombre, rol }
      // Manejar ambas estructuras (igual que login)
      const usuario = response.usuario || {
        id: response.id,
        email: response.email,
        nombre: response.nombre,
        rol: response.rol || "CLIENTE",
      };

      // Actualizamos el estado con el usuario
      setUser(usuario);
      console.log("✅ Registro y login automático exitosos, usuario:", usuario);

      return response;
    } catch (error) {
      const errorMessage = error.message || "Error al registrar usuario";
      setError(errorMessage);
      console.error("❌ Error en registro:", errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Función de logout
   */
  const logout = () => {
    console.log("👋 Cerrando sesión...");

    // Limpiamos el estado
    setUser(null);
    setError(null);

    // Llamamos al servicio para limpiar localStorage
    authService.logout();
  };

  /**
   * Actualiza los datos del usuario en el contexto
   * Útil después de editar perfil
   * @param {Object} updatedData - Datos actualizados
   */
  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    authService.updateUser(updatedData);
    console.log("✅ Usuario actualizado en contexto");
  };

  /**
   * Verifica si el usuario está autenticado
   * @returns {boolean} true si hay usuario
   */
  const isAuthenticated = () => {
    return !!user;
  };

  /**
   * Verifica si el usuario es administrador
   * @returns {boolean} true si es admin
   */
  const isAdmin = () => {
    return user?.rol === "ADMIN";
  };

  /**
   * Verifica si el usuario es cliente
   * @returns {boolean} true si es cliente
   */
  const isCliente = () => {
    return user?.rol === "CLIENTE";
  };

  /**
   * Obtiene el nombre del usuario o un valor por defecto
   * @returns {string} Nombre del usuario
   */
  const getUserName = () => {
    return user?.nombre || "Usuario";
  };

  /**
   * Limpia el error actual
   */
  const clearError = () => {
    setError(null);
  };

  // Valor del contexto que compartimos con toda la app
  const contextValue = {
    // Estado
    user,
    loading,
    error,

    // Funciones de autenticación
    login,
    logout,
    register,
    checkAuth,
    updateUser,

    // Funciones de verificación
    isAuthenticated,
    isAdmin,
    isCliente,
    getUserName,

    // Utilidades
    clearError,
  };

  // Renderizamos el provider con el valor del contexto
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Exportamos el contexto por si alguien lo necesita directamente
export default AuthContext;
