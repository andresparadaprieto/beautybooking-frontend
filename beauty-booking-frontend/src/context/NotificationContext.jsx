import React, { createContext, useState, useContext, useCallback } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

/**
 * NotificationContext
 *
 * Sistema global de notificaciones tipo toast
 * Permite mostrar notificaciones desde cualquier parte de la app
 * Sin necesidad de manejar estado local en cada componente
 */

const NotificationContext = createContext(null);

// Hook para usar las notificaciones
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification debe usarse dentro de NotificationProvider"
    );
  }
  return context;
};

// Provider de notificaciones
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  /**
   * Mostrar notificación
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo: success, error, warning, info
   * @param {number} duration - Duración en ms (0 = permanente)
   */
  const showNotification = useCallback(
    (message, type = "info", duration = 5000) => {
      const id = Date.now(); // ID único basado en timestamp

      const notification = {
        id,
        message,
        type,
        duration,
      };

      // Añadir notificación
      setNotifications((prev) => [...prev, notification]);

      // Auto-eliminar después de la duración (si no es permanente)
      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      return id; // Devolver ID por si se quiere eliminar manualmente
    },
    []
  );

  // Eliminar notificación específica
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Métodos de conveniencia
  const success = useCallback(
    (message, duration) => {
      return showNotification(message, "success", duration);
    },
    [showNotification]
  );

  const error = useCallback(
    (message, duration) => {
      return showNotification(message, "error", duration);
    },
    [showNotification]
  );

  const warning = useCallback(
    (message, duration) => {
      return showNotification(message, "warning", duration);
    },
    [showNotification]
  );

  const info = useCallback(
    (message, duration) => {
      return showNotification(message, "info", duration);
    },
    [showNotification]
  );

  // Limpiar todas las notificaciones
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    showNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </NotificationContext.Provider>
  );
};

/**
 * Contenedor de notificaciones
 * Renderiza todas las notificaciones activas
 */
const NotificationContainer = ({ notifications, onRemove }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onRemove={() => onRemove(notification.id)}
        />
      ))}
    </div>
  );
};

/**
 * Componente de notificación individual
 */
const Notification = ({ notification, onRemove }) => {
  const { message, type } = notification;

  // Configuración según tipo
  const configs = {
    success: {
      icon: CheckCircle,
      bgColor: "bg-green-500",
      textColor: "text-white",
    },
    error: {
      icon: XCircle,
      bgColor: "bg-red-500",
      textColor: "text-white",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-500",
      textColor: "text-white",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-500",
      textColor: "text-white",
    },
  };

  const config = configs[type] || configs.info;
  const Icon = config.icon;

  return (
    <div
      className={`
      ${config.bgColor} ${config.textColor}
      px-4 py-3 rounded-lg shadow-lg
      flex items-start gap-3
      animate-slide-in-right
      min-w-[300px]
    `}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button
        onClick={onRemove}
        className="flex-shrink-0 hover:opacity-80 transition-opacity"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
export default NotificationContext;
