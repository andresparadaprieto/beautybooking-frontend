import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Euro,
  Search,
  Filter,
  Eye,
  Mail,
  X,
  Plus,
  AlertCircle,
} from "lucide-react";
import { format, parseISO, isPast, isToday, isFuture } from "date-fns";
import { es } from "date-fns/locale";
import bookingService from "../services/bookingService";
import { useProtectedRoute, useLoading, useError, useDebounce } from "../hooks";
import Loading, { LoadingCard } from "../components/common/Loading";
import { InlineAlert, ConfirmDialog, Toast } from "../components/common/Alert";

/**
 * MyReservations Page
 *
 * Página donde los clientes pueden:
 * - Ver todas sus reservas (próximas, completadas, canceladas)
 * - Filtrar y buscar reservas
 * - Ver detalles de cada reserva
 * - Cancelar reservas próximas
 * - Reenviar email de confirmación
 */

const MyReservations = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useProtectedRoute("CLIENTE"); // Solo clientes
  const { isLoading, executeWithLoading } = useLoading(true);
  const { error, setError, clearError } = useError();

  // Estados principales
  const [reservas, setReservas] = useState([]);
  const [reservasFiltradas, setReservasFiltradas] = useState([]);
  const [activeTab, setActiveTab] = useState("proximas"); // proximas, completadas, canceladas
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [reservaToCancel, setReservaToCancel] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Debounce para búsqueda
  const debouncedSearch = useDebounce(searchTerm, 300);

  /**
   * Cargar reservas al montar
   */
  useEffect(() => {
    loadReservas();

    // Verificar si venimos de crear una nueva reserva
    if (location.state?.nuevaReserva) {
      setToastMessage("¡Nueva reserva creada con éxito!");
      setShowToast(true);
      // Limpiar el state
      window.history.replaceState({}, document.title);
    }
  }, []);

  /**
   * Filtrar reservas cuando cambia el tab o búsqueda
   */
  useEffect(() => {
    filterReservas();
  }, [activeTab, debouncedSearch, reservas]);

  /**
   * Cargar reservas del usuario
   */
  const loadReservas = async () => {
    try {
      const data = await executeWithLoading(async () => {
        return await bookingService.getMisReservas();
      });

      // Enriquecer reservas con información adicional
      const reservasEnriquecidas = data.map((reserva) => ({
        ...reserva,
        fechaObj: parseISO(reserva.fecha || reserva.creadoEn),
        isPast: isPast(parseISO(reserva.fecha || reserva.creadoEn)),
        isToday: isToday(parseISO(reserva.fecha || reserva.creadoEn)),
        isFuture: isFuture(parseISO(reserva.fecha || reserva.creadoEn)),
      }));

      setReservas(reservasEnriquecidas);
      console.log(`✅ ${reservasEnriquecidas.length} reservas cargadas`);
    } catch (err) {
      console.error("Error cargando reservas:", err);
      setError("Error al cargar tus reservas. Por favor, intenta de nuevo.");
    }
  };

  /**
   * Filtrar reservas según tab activo y búsqueda
   */
  const filterReservas = () => {
    let filtered = [...reservas];

    // Filtrar por estado según el tab
    switch (activeTab) {
      case "proximas":
        filtered = filtered.filter(
          (r) =>
            (r.estado === "PENDIENTE" || r.estado === "CONFIRMADA") && !r.isPast
        );
        break;
      case "completadas":
        filtered = filtered.filter((r) => r.estado === "COMPLETADA");
        break;
      case "canceladas":
        filtered = filtered.filter((r) => r.estado === "CANCELADA");
        break;
    }

    // Aplicar búsqueda si hay término
    if (debouncedSearch) {
      filtered = filtered.filter((r) => {
        const searchLower = debouncedSearch.toLowerCase();
        // Buscar en nombre del servicio, código de reserva, notas
        return (
          r.servicioNombre?.toLowerCase().includes(searchLower) ||
          r.id.toString().includes(searchLower) ||
          r.notas?.toLowerCase().includes(searchLower)
        );
      });
    }

    setReservasFiltradas(filtered);
  };

  /**
   * Manejar cancelación de reserva
   */
  const handleCancelReserva = async () => {
    if (!reservaToCancel) return;

    try {
      await bookingService.cancelarReserva(reservaToCancel.id);

      // Actualizar la lista local
      setReservas((prev) =>
        prev.map((r) =>
          r.id === reservaToCancel.id ? { ...r, estado: "CANCELADA" } : r
        )
      );

      setToastMessage("Reserva cancelada exitosamente");
      setShowToast(true);
      setShowCancelDialog(false);
      setReservaToCancel(null);

      // Si estábamos viendo los detalles, cerrar
      if (selectedReserva?.id === reservaToCancel.id) {
        setSelectedReserva(null);
      }
    } catch (err) {
      console.error("Error cancelando reserva:", err);
      setError("Error al cancelar la reserva. Por favor, intenta de nuevo.");
    }
  };

  /**
   * Reenviar email de confirmación
   */
  const handleResendEmail = async (reserva) => {
    try {
      setToastMessage("Email de confirmación reenviado");
      setShowToast(true);
    } catch (err) {
      console.error("Error reenviando email:", err);
      setError("Error al reenviar el email. Por favor, intenta de nuevo.");
    }
  };

  /**
   * Obtener el total de reservas por estado
   */
  const getCountByStatus = (status) => {
    switch (status) {
      case "proximas":
        return reservas.filter(
          (r) =>
            (r.estado === "PENDIENTE" || r.estado === "CONFIRMADA") && !r.isPast
        ).length;
      case "completadas":
        return reservas.filter((r) => r.estado === "COMPLETADA").length;
      case "canceladas":
        return reservas.filter((r) => r.estado === "CANCELADA").length;
      default:
        return 0;
    }
  };

  // Mostrar loading inicial
  if (isLoading) {
    return <Loading fullScreen message="Cargando tus reservas..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Reservas</h1>
            <p className="text-gray-600 mt-1">
              Gestiona y consulta el historial de tus citas
            </p>
          </div>

          {/* Botón nueva reserva */}
          <button
            onClick={() => navigate("/servicios")}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            NUEVA RESERVA
          </button>
        </div>

        {/* Tabs de estado */}
        <div className="bg-white rounded-lg shadow-sm p-1 mb-6">
          <div className="flex flex-col sm:flex-row">
            <TabButton
              active={activeTab === "proximas"}
              onClick={() => setActiveTab("proximas")}
              count={getCountByStatus("proximas")}
              label="Próximas"
              color="green"
            />
            <TabButton
              active={activeTab === "completadas"}
              onClick={() => setActiveTab("completadas")}
              count={getCountByStatus("completadas")}
              label="Completadas"
              color="blue"
            />
            <TabButton
              active={activeTab === "canceladas"}
              onClick={() => setActiveTab("canceladas")}
              count={getCountByStatus("canceladas")}
              label="Canceladas"
              color="red"
            />
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 
                             text-gray-400 w-5 h-5"
            />
            <input
              type="text"
              placeholder="Buscar por servicio, código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
        </div>

        {/* Mensajes de error */}
        {error && <InlineAlert type="error" message={error} className="mb-6" />}

        {/* Lista de reservas o mensaje vacío */}
        {reservasFiltradas.length === 0 ? (
          <EmptyState
            activeTab={activeTab}
            hasSearch={!!searchTerm}
            onClearSearch={() => setSearchTerm("")}
            onNewReservation={() => navigate("/servicios")}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reservasFiltradas.map((reserva) => (
              <ReservationCard
                key={reserva.id}
                reserva={reserva}
                onViewDetails={() => setSelectedReserva(reserva)}
                onCancel={() => {
                  setReservaToCancel(reserva);
                  setShowCancelDialog(true);
                }}
                onResendEmail={() => handleResendEmail(reserva)}
              />
            ))}
          </div>
        )}

        {/* Paginación si hay muchas reservas */}
        {reservasFiltradas.length > 6 && (
          <div className="mt-8 text-center text-sm text-gray-600">
            Mostrando {reservasFiltradas.length} reservas
          </div>
        )}
      </div>

      {/* Modal de detalles de reserva */}
      {selectedReserva && (
        <ReservationDetailsModal
          reserva={selectedReserva}
          onClose={() => setSelectedReserva(null)}
          onCancel={() => {
            setReservaToCancel(selectedReserva);
            setShowCancelDialog(true);
            setSelectedReserva(null);
          }}
          onResendEmail={() => handleResendEmail(selectedReserva)}
        />
      )}

      {/* Dialog de confirmación de cancelación */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => {
          setShowCancelDialog(false);
          setReservaToCancel(null);
        }}
        onConfirm={handleCancelReserva}
        title="¿Cancelar reserva?"
        message={`¿Estás seguro de que quieres cancelar tu reserva del ${
          reservaToCancel
            ? format(parseISO(reservaToCancel.fecha), "d/MM/yyyy")
            : ""
        }? Esta acción no se puede deshacer.`}
        confirmText="Sí, cancelar"
        cancelText="No, mantener"
        type="danger"
      />

      {/* Toast notifications */}
      {showToast && (
        <Toast
          type="success"
          message={toastMessage}
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

/**
 * Componente de botón de tab
 */
const TabButton = ({ active, onClick, count, label, color }) => {
  const colors = {
    green: "text-green-600 bg-green-50",
    blue: "text-blue-600 bg-blue-50",
    red: "text-red-600 bg-red-50",
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex-1 px-4 py-3 rounded-lg font-medium transition-all
        flex items-center justify-center gap-2
        ${
          active
            ? "bg-gray-900 text-white"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }
      `}
    >
      <span>{label}</span>
      <span
        className={`
        px-2 py-1 rounded-full text-xs font-bold
        ${active ? "bg-white text-gray-900" : colors[color]}
      `}
      >
        {count}
      </span>
    </button>
  );
};

/**
 * Componente de tarjeta de reserva
 */
const ReservationCard = ({
  reserva,
  onViewDetails,
  onCancel,
  onResendEmail,
}) => {
  const estadoColor = bookingService.getEstadoColor(reserva.estado);
  const estadoTexto = bookingService.getEstadoEspanol(reserva.estado);
  const canCancel =
    (reserva.estado === "PENDIENTE" || reserva.estado === "CONFIRMADA") &&
    !reserva.isPast;

  return (
    <div className="card border border-gray-200">
      {/* Header con estado */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {reserva.servicioNombre || "Servicio"}
          </h3>
          <p className="text-sm text-gray-600">
            Código: #BK{String(reserva.id).padStart(5, "0")}
          </p>
        </div>
        <span className={`badge ${estadoColor}`}>{estadoTexto}</span>
      </div>

      {/* Información de la reserva */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>
            {format(parseISO(reserva.fecha), "d 'de' MMMM, yyyy", {
              locale: es,
            })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>
            {bookingService.formatearHora(reserva.horaInicio)} -
            {bookingService.calcularHoraFin(
              reserva.horaInicio,
              reserva.duracionServicio || 30
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Euro className="w-4 h-4" />
          <span>{reserva.precioFinal || 0} €</span>
        </div>

        {reserva.notas && (
          <div className="text-sm text-gray-600 italic">"{reserva.notas}"</div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2">
        <button
          onClick={onViewDetails}
          className="flex-1 btn-secondary flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          VER DETALLES
        </button>

        {canCancel && (
          <button onClick={onCancel} className="flex-1 btn-danger">
            CANCELAR
          </button>
        )}

        {reserva.estado === "CONFIRMADA" && !reserva.isPast && (
          <button
            onClick={onResendEmail}
            className="p-2 text-gray-600 hover:text-gray-800"
            title="Reenviar email"
          >
            <Mail className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Componente de estado vacío
 */
const EmptyState = ({
  activeTab,
  hasSearch,
  onClearSearch,
  onNewReservation,
}) => {
  const messages = {
    proximas: {
      title: "No tienes reservas próximas",
      description: hasSearch
        ? "No se encontraron reservas que coincidan con tu búsqueda"
        : "No tienes ninguna cita programada",
      action: !hasSearch,
    },
    completadas: {
      title: "No hay reservas completadas",
      description: hasSearch
        ? "No se encontraron reservas completadas con ese criterio"
        : "Aún no has completado ninguna reserva",
      action: false,
    },
    canceladas: {
      title: "No hay reservas canceladas",
      description: hasSearch
        ? "No se encontraron reservas canceladas con ese criterio"
        : "No has cancelado ninguna reserva",
      action: false,
    },
  };

  const config = messages[activeTab];

  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <Calendar className="w-16 h-16 mx-auto" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{config.title}</h3>
      <p className="text-gray-600 mb-4">{config.description}</p>
      <div className="flex justify-center gap-4">
        {hasSearch && (
          <button onClick={onClearSearch} className="btn-secondary">
            Limpiar búsqueda
          </button>
        )}
        {config.action && (
          <button onClick={onNewReservation} className="btn-primary">
            + RESERVAR UN SERVICIO
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Modal de detalles de reserva
 */
const ReservationDetailsModal = ({
  reserva,
  onClose,
  onCancel,
  onResendEmail,
}) => {
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="border-b p-6 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Detalles de la Reserva
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Código: #BK{String(reserva.id).padStart(5, "0")}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenido */}
          <div className="p-6 space-y-6">
            {/* Estado */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Estado actual</p>
              <span
                className={`badge ${bookingService.getEstadoColor(
                  reserva.estado
                )}`}
              >
                {bookingService.getEstadoEspanol(reserva.estado)}
              </span>
            </div>

            {/* Información del servicio */}
            <div>
              <h3 className="font-semibold mb-3">Información del Servicio</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Servicio</p>
                  <p className="font-medium">{reserva.servicioNombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Precio</p>
                  <p className="font-medium">{reserva.precioFinal} €</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duración</p>
                  <p className="font-medium">
                    {reserva.duracionServicio || 30} minutos
                  </p>
                </div>
              </div>
            </div>

            {/* Fecha y hora */}
            <div>
              <h3 className="font-semibold mb-3">Fecha y Hora</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Fecha</p>
                  <p className="font-medium">
                    {format(parseISO(reserva.fecha), "dd/MM/yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hora</p>
                  <p className="font-medium">
                    {bookingService.formatearHora(reserva.horaInicio)}
                  </p>
                </div>
              </div>
            </div>

            {/* Notas */}
            {reserva.notas && (
              <div>
                <h3 className="font-semibold mb-2">Notas</h3>
                <p className="text-gray-600">{reserva.notas}</p>
              </div>
            )}

            {/* Información de contacto */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>¿Necesitas ayuda?</strong>
                <br />
                📞 Teléfono: 900 123 456
                <br />
                📧 Email: info@beautybooking.com
                <br />
                📍 C/ Calle Belleza 123 28001, Madrid
              </p>
            </div>
          </div>

          {/* Footer con acciones */}
          <div className="border-t p-6 flex justify-end gap-3">
            {(reserva.estado === "PENDIENTE" ||
              reserva.estado === "CONFIRMADA") &&
              !reserva.isPast && (
                <>
                  <button
                    onClick={onResendEmail}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    REENVIAR EMAIL
                  </button>
                  <button onClick={onCancel} className="btn-danger">
                    CANCELAR RESERVA
                  </button>
                </>
              )}
            <button onClick={onClose} className="btn-primary">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyReservations;
