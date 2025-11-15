import React from "react";

/**
 * Loading Component
 *
 * Muestra un spinner de carga centrado
 * Se puede usar en pantalla completa o dentro de un contenedor
 *
 * @param {boolean} fullScreen - Si debe ocupar toda la pantalla
 * @param {string} message - Mensaje opcional para mostrar
 * @param {string} size - Tamaño del spinner (small, medium, large)
 */

const Loading = ({
  fullScreen = false,
  message = "Cargando...",
  size = "medium",
}) => {
  // Clases para diferentes tamaños
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-10 h-10",
    large: "w-16 h-16",
  };

  // Contenedor base con condicional para pantalla completa
  const containerClasses = fullScreen
    ? "fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className="text-center">
        {/* Spinner animado */}
        <div className="flex justify-center mb-4">
          <div
            className={`
              ${sizeClasses[size]}
              border-4 border-beauty-200
              border-t-beauty-500
              rounded-full
              animate-spin
            `}
            role="status"
            aria-label="Cargando"
          />
        </div>

        {/* Mensaje de carga */}
        {message && (
          <p className="text-gray-600 text-sm animate-pulse">{message}</p>
        )}
      </div>
    </div>
  );
};

/**
 * LoadingSpinner - Versión simple solo spinner
 * Para usar inline en botones o textos
 */
export const LoadingSpinner = ({ size = "small", className = "" }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-6 h-6",
    large: "w-8 h-8",
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        border-2 border-gray-200
        border-t-beauty-500
        rounded-full
        animate-spin
        inline-block
        ${className}
      `}
      role="status"
      aria-label="Cargando"
    />
  );
};

/**
 * LoadingCard - Skeleton loader para tarjetas
 * Muestra una previsualización mientras carga el contenido real
 */
export const LoadingCard = () => {
  return (
    <div className="card animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 rounded w-20"></div>
        <div className="h-10 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );
};

/**
 * LoadingTable - Skeleton loader para tablas
 * Muestra filas vacías mientras carga
 */
export const LoadingTable = ({ rows = 5 }) => {
  return (
    <div className="w-full">
      {/* Header de la tabla */}
      <div className="bg-gray-100 p-4 rounded-t-lg animate-pulse">
        <div className="flex gap-4">
          <div className="h-4 bg-gray-300 rounded w-1/6"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          <div className="h-4 bg-gray-300 rounded w-1/6"></div>
        </div>
      </div>

      {/* Filas de la tabla */}
      {[...Array(rows)].map((_, index) => (
        <div key={index} className="border-b border-gray-200 p-4 animate-pulse">
          <div className="flex gap-4">
            <div className="h-3 bg-gray-200 rounded w-1/6"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/6"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * LoadingButton - Botón con estado de carga
 * Desactiva el botón y muestra spinner mientras carga
 */
export const LoadingButton = ({
  loading = false,
  children,
  className = "",
  ...props
}) => {
  return (
    <button
      className={`
        btn-primary
        flex items-center justify-center gap-2
        ${loading ? "opacity-75 cursor-not-allowed" : ""}
        ${className}
      `}
      disabled={loading}
      {...props}
    >
      {loading && <LoadingSpinner size="small" />}
      {children}
    </button>
  );
};

// Exportar componente principal como default
export default Loading;
