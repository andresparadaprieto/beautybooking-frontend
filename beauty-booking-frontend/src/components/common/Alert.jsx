// Alert Component - Sistema de notificaciones/alertas
import React, { useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

/**
 * Alert Component
 *
 * Sistema de alertas con diferentes tipos:
 * - success: Operación exitosa
 * - error: Error o problema
 * - warning: Advertencia
 * - info: Información
 *
 */

const Alert = ({
  type = "info",
  message,
  title,
  onClose,
  autoClose = false,
  autoCloseTime = 5000,
  className = "",
  position = "top", // top, bottom, inline
}) => {
  // Auto cerrar después del tiempo especificado
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseTime);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseTime, onClose]);

  // Configuración según el tipo
  const configs = {
    success: {
      icon: CheckCircle,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      iconColor: "text-green-400",
    },
    error: {
      icon: XCircle,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-800",
      iconColor: "text-red-400",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-800",
      iconColor: "text-yellow-400",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
      iconColor: "text-blue-400",
    },
  };

  const config = configs[type] || configs.info;
  const Icon = config.icon;

  // Clases de posición
  const positionClasses = {
    top: "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4",
    bottom:
      "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4",
    inline: "w-full",
  };

  return (
    <div className={`${positionClasses[position]} ${className}`}>
      <div
        className={`
        ${config.bgColor} 
        ${config.borderColor} 
        ${config.textColor}
        border rounded-lg p-4 shadow-lg
        animate-slide-up
      `}
      >
        <div className="flex">
          {/* Icono */}
          <div className="flex-shrink-0">
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          </div>

          {/* Contenido */}
          <div className="ml-3 flex-1">
            {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
            <div className="text-sm">{message}</div>
          </div>

          {/* Botón cerrar */}
          {onClose && (
            <div className="ml-auto pl-3">
              <button
                onClick={onClose}
                className={`
                  inline-flex rounded-md p-1.5
                  ${config.textColor} hover:bg-white hover:bg-opacity-20
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                `}
              >
                <span className="sr-only">Cerrar</span>
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * InlineAlert - Versión inline para formularios
 * Se muestra dentro del contenido, no flotante
 */
export const InlineAlert = ({ type, message, className = "" }) => {
  const configs = {
    success: "bg-green-50 text-green-700 border-green-200",
    error: "bg-red-50 text-red-700 border-red-200",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <div
      className={`
      ${configs[type] || configs.info}
      border rounded-md p-3 text-sm
      ${className}
    `}
    >
      {message}
    </div>
  );
};

/**
 * Toast - Notificación temporal estilo toast
 * Aparece brevemente y desaparece
 */
export const Toast = ({ message, type = "info", duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const configs = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div
        className={`
        ${configs[type] || configs.info}
        text-white px-4 py-3 rounded-lg shadow-lg
        flex items-center gap-2
        min-w-[200px] max-w-sm
      `}
      >
        {type === "success" && <CheckCircle className="w-5 h-5" />}
        {type === "error" && <XCircle className="w-5 h-5" />}
        {type === "warning" && <AlertTriangle className="w-5 h-5" />}
        {type === "info" && <Info className="w-5 h-5" />}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};

/**
 * ConfirmDialog - Diálogo de confirmación
 * Para acciones destructivas o importantes
 */
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "¿Estás seguro?",
  message = "Esta acción no se puede deshacer.",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "warning", // warning, danger
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    warning: {
      icon: AlertTriangle,
      iconColor: "text-yellow-500",
      buttonColor: "bg-yellow-500 hover:bg-yellow-600",
    },
    danger: {
      icon: XCircle,
      iconColor: "text-red-500",
      buttonColor: "bg-red-500 hover:bg-red-600",
    },
  };

  const style = typeStyles[type] || typeStyles.warning;
  const Icon = style.icon;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full shadow-xl animate-slide-up">
          {/* Header */}
          <div className="p-6">
            <div className="flex items-start gap-4">
              <Icon
                className={`w-6 h-6 ${style.iconColor} flex-shrink-0 mt-1`}
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {title}
                </h3>
                <p className="text-sm text-gray-600">{message}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 
                       bg-white border border-gray-300 rounded-lg
                       hover:bg-gray-50 focus:outline-none focus:ring-2 
                       focus:ring-offset-2 focus:ring-gray-500"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`
                px-4 py-2 text-sm font-medium text-white rounded-lg
                ${style.buttonColor}
                focus:outline-none focus:ring-2 focus:ring-offset-2
              `}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Alert;
