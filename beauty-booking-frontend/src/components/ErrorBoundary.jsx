import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

/**
 * ErrorBoundary
 *
 * Captura errores en toda la aplicación React
 * Muestra una página de error amigable en lugar de pantalla en blanco
 */

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  // Se llama cuando hay un error en cualquier componente hijo
  static getDerivedStateFromError(error) {
    // Actualiza el state para mostrar la UI de error
    return { hasError: true };
  }

  // Para logging del error
  componentDidCatch(error, errorInfo) {
    // Aquí puedes enviar el error a un servicio de logging
    console.error("Error capturado por ErrorBoundary:", error, errorInfo);

    // Guardar detalles del error en el state
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // En producción, enviarías esto a un servicio como Sentry
    // logErrorToService(error, errorInfo);
  }

  // Reiniciar el estado de error
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Recargar la página
    window.location.reload();
  };

  // Ir a inicio
  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      // UI de error personalizada
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              {/* Icono de error */}
              <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>

              {/* Mensaje principal */}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Ups! Algo salió mal
              </h1>
              <p className="text-gray-600 mb-6">
                Ha ocurrido un error inesperado. No te preocupes, nuestro equipo
                ha sido notificado y lo resolveremos pronto.
              </p>

              {/* Detalles del error (solo en desarrollo) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm font-mono text-red-600 mb-2">
                    {this.state.error.toString()}
                  </p>
                  <details className="text-xs text-gray-600">
                    <summary className="cursor-pointer hover:text-gray-800">
                      Ver detalles técnicos
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap">
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                </div>
              )}

              {/* Acciones */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.handleReset}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reintentar
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Ir al inicio
                </button>
              </div>

              {/* Información de contacto */}
              <p className="text-sm text-gray-500 mt-6">
                Si el problema persiste, contacta con soporte:
                <br />
                <a
                  href="mailto:soporte@beautybooking.com"
                  className="text-beauty-600 hover:underline"
                >
                  soporte@beautybooking.com
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Si no hay error, renderizar los componentes hijos normalmente
    return this.props.children;
  }
}

export default ErrorBoundary;
