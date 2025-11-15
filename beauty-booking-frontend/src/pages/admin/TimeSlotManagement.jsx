import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
} from "lucide-react";
import { format, addDays, subDays, isToday, isTomorrow } from "date-fns";
import { es } from "date-fns/locale";
import adminService from "../../services/adminService";
import { useProtectedRoute, useLoading, useError } from "../../hooks";
import Loading from "../../components/common/Loading";
import { InlineAlert, ConfirmDialog } from "../../components/common/Alert";
import { AdminSidebar } from "./Dashboard";

/**
 * Time Slot Management
 *
 * Página de administración de franjas horarias con:
 * - Vista por día (navegación día a día)
 * - Filtro por servicio
 * - Creación/edición/eliminación de franjas
 * - Navegación rápida: Hoy, Mañana, Anterior, Siguiente
 */

const TimeSlotManagement = () => {
  const { user } = useProtectedRoute("ADMIN");
  const { isLoading, setIsLoading } = useLoading(true);
  const { error, setError, clearError } = useError();

  // Estados principales
  const [franjas, setFranjas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [selectedServicio, setSelectedServicio] = useState("todos");
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedFranja, setSelectedFranja] = useState(null);

  /**
   * Cargar datos iniciales
   */
  useEffect(() => {
    loadServicios();
  }, []);

  /**
   * Cargar franjas cuando cambia la fecha
   */
  useEffect(() => {
    if (servicios.length > 0) {
      loadFranjas();
    }
  }, [selectedDate, servicios]);

  /**
   * Carga servicios para el filtro
   */
  const loadServicios = async () => {
    try {
      setIsLoading(true);
      const serviciosData = await adminService.getAllServicios();
      setServicios(serviciosData);
    } catch (err) {
      console.error("Error cargando servicios:", err);
      setError("Error al cargar los servicios");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Carga franjas del día seleccionado
   */
  const loadFranjas = async () => {
    try {
      setIsLoading(true);
      const fechaStr = format(selectedDate, "yyyy-MM-dd");

      // Cargar franjas del día (usamos el rango de un solo día)
      const franjasData = await adminService.getFranjasPorRango(
        fechaStr,
        fechaStr
      );
      setFranjas(franjasData);
    } catch (err) {
      console.error("Error cargando franjas:", err);
      setError("Error al cargar las franjas horarias");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Filtrar franjas por servicio seleccionado
   */
  const franjasFiltradas =
    selectedServicio === "todos"
      ? franjas
      : franjas.filter((f) => f.servicioId === parseInt(selectedServicio));

  /**
   * Navegación de fechas
   */
  const goToPreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const goToNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const goToTomorrow = () => {
    setSelectedDate(addDays(new Date(), 1));
  };

  /**
   * Eliminar franja
   */
  const handleDelete = async () => {
    if (!selectedFranja) return;

    try {
      await adminService.eliminarFranja(selectedFranja.id);
      setShowDeleteDialog(false);
      setSelectedFranja(null);
      loadFranjas();
    } catch (err) {
      setError(err.message || "Error al eliminar la franja");
    }
  };

  /**
   * Obtener etiqueta del día
   */
  const getDayLabel = () => {
    if (isToday(selectedDate)) return "Hoy";
    if (isTomorrow(selectedDate)) return "Mañana";
    return format(selectedDate, "EEEE, d 'de' MMMM yyyy", { locale: es });
  };

  if (isLoading && servicios.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar activePage="franjas" />
        <div className="lg:ml-64 flex items-center justify-center min-h-screen">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar activePage="franjas" />

      <div className="lg:ml-64 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Gestión de Franjas Horarias
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Administra las franjas horarias
          </p>
        </div>

        {/* Alertas */}
        {error && (
          <InlineAlert
            type="error"
            message={error}
            onClose={clearError}
            className="mb-6"
          />
        )}

        {/* Navegación de días */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          {/* Botones de navegación rápida */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={goToToday}
              disabled={isToday(selectedDate)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isToday(selectedDate)
                  ? "bg-beauty-100 text-beauty-700 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Hoy
            </button>
            <button
              onClick={goToTomorrow}
              disabled={isTomorrow(selectedDate)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isTomorrow(selectedDate)
                  ? "bg-beauty-100 text-beauty-700 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Mañana
            </button>

            {/* Date picker para seleccionar fecha específica */}
            <div className="relative flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <Calendar className="w-4 h-4 text-gray-600" />
              <input
                type="date"
                value={format(selectedDate, "yyyy-MM-dd")}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="text-sm font-medium text-gray-700 bg-transparent border-none outline-none cursor-pointer"
                title="Seleccionar fecha específica"
              />
            </div>
          </div>

          {/* Navegación día anterior/siguiente */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={goToPreviousDay}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Día anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Calendar className="w-5 h-5 text-beauty-600" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 capitalize">
                  {getDayLabel()}
                </h2>
              </div>
              <p className="text-sm text-gray-600">
                {format(selectedDate, "dd/MM/yyyy")}
              </p>
            </div>

            <button
              onClick={goToNextDay}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Día siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filtro y acciones */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* Filtro por servicio */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por servicio:
              </label>
              <select
                value={selectedServicio}
                onChange={(e) => setSelectedServicio(e.target.value)}
                className="form-input w-full"
              >
                <option value="todos">Todos los servicios</option>
                {servicios.map((servicio) => (
                  <option key={servicio.id} value={servicio.id}>
                    {servicio.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón crear franja */}
            <div className="sm:self-end">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Nueva Franja</span>
              </button>
            </div>
          </div>

          {/* Resumen */}
          {franjasFiltradas.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span className="text-gray-600">
                    Total:{" "}
                    <span className="font-semibold text-gray-900">
                      {franjasFiltradas.length}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">
                    Disponibles:{" "}
                    <span className="font-semibold text-green-700">
                      {franjasFiltradas.filter((f) => f.disponible).length}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-600">
                    Completas:{" "}
                    <span className="font-semibold text-red-700">
                      {franjasFiltradas.filter((f) => !f.disponible).length}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lista de franjas */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Loading />
          </div>
        ) : franjasFiltradas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              No hay franjas horarias para este día
            </p>
            <p className="text-gray-400 text-sm mb-4">
              {selectedServicio !== "todos"
                ? 'Prueba seleccionando "Todos los servicios" o cambia de día'
                : "Crea la primera franja para este día"}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Crear Franja
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {franjasFiltradas
              .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
              .map((franja) => (
                <TimeSlotCard
                  key={franja.id}
                  franja={franja}
                  onEdit={(franja) => {
                    setSelectedFranja(franja);
                    setShowEditModal(true);
                  }}
                  onDelete={(franja) => {
                    setSelectedFranja(franja);
                    setShowDeleteDialog(true);
                  }}
                />
              ))}
          </div>
        )}
      </div>

      {/* Modales */}
      {showCreateModal && (
        <CreateTimeSlotModal
          servicios={servicios}
          initialDate={format(selectedDate, "yyyy-MM-dd")}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadFranjas();
          }}
          onError={setError}
        />
      )}

      {showEditModal && selectedFranja && (
        <EditTimeSlotModal
          franja={selectedFranja}
          servicios={servicios}
          onClose={() => {
            setShowEditModal(false);
            setSelectedFranja(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedFranja(null);
            loadFranjas();
          }}
          onError={setError}
        />
      )}

      {showDeleteDialog && (
        <ConfirmDialog
          isOpen={showDeleteDialog}
          title="Eliminar franja horaria"
          message={`¿Estás seguro de eliminar esta franja? Esta acción no se puede deshacer.`}
          onConfirm={handleDelete}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedFranja(null);
          }}
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
        />
      )}
    </div>
  );
};

/**
 * Tarjeta de franja horaria individual
 */
const TimeSlotCard = ({ franja, onEdit, onDelete }) => {
  const disponibilidadColor = franja.disponible
    ? "bg-green-100 text-green-800 border-green-200"
    : "bg-red-100 text-red-800 border-red-200";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Información de la franja */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="text-lg font-bold text-gray-900">
                {franja.horaInicio} - {franja.horaFin}
              </span>
            </div>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${disponibilidadColor}`}
            >
              {franja.disponible ? "Disponible" : "Completo"}
            </span>
          </div>

          <p className="text-sm font-medium text-gray-700 mb-1">
            {franja.servicioNombre}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              Plazas:{" "}
              <span className="font-semibold text-gray-900">
                {franja.plazasDisponibles} / {franja.plazasTotales}
              </span>
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 sm:flex-col sm:gap-2">
          <button
            onClick={() => onEdit(franja)}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Editar</span>
          </button>
          <button
            onClick={() => onDelete(franja)}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal para crear franja
 */
const CreateTimeSlotModal = ({
  servicios,
  initialDate,
  onClose,
  onSuccess,
  onError,
}) => {
  const [formData, setFormData] = useState({
    servicioId: "",
    fecha: initialDate,
    horaInicio: "",
    plazasDisponibles: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = {
        servicioId: parseInt(formData.servicioId),
        fecha: formData.fecha,
        horaInicio: formData.horaInicio + ":00",
        plazasDisponibles: parseInt(formData.plazasDisponibles),
      };

      await adminService.crearFranja(data);
      onSuccess();
    } catch (err) {
      onError(err.message || "Error al crear la franja");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Nueva Franja Horaria
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Servicio */}
          <div>
            <label className="form-label">Servicio *</label>
            <select
              value={formData.servicioId}
              onChange={(e) =>
                setFormData({ ...formData, servicioId: e.target.value })
              }
              className="form-input"
              required
            >
              <option value="">Seleccionar servicio...</option>
              {servicios
                .filter((s) => s.activo)
                .map((servicio) => (
                  <option key={servicio.id} value={servicio.id}>
                    {servicio.nombre} ({servicio.duracionMinutos} min)
                  </option>
                ))}
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className="form-label">Fecha *</label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) =>
                setFormData({ ...formData, fecha: e.target.value })
              }
              min={format(new Date(), "yyyy-MM-dd")}
              className="form-input"
              required
            />
          </div>

          {/* Hora */}
          <div>
            <label className="form-label">Hora de inicio *</label>
            <input
              type="time"
              value={formData.horaInicio}
              onChange={(e) =>
                setFormData({ ...formData, horaInicio: e.target.value })
              }
              min="07:00"
              max="22:00"
              className="form-input"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Horario permitido: 07:00 - 22:00
            </p>
          </div>

          {/* Plazas */}
          <div>
            <label className="form-label">Plazas disponibles *</label>
            <input
              type="number"
              value={formData.plazasDisponibles}
              onChange={(e) =>
                setFormData({ ...formData, plazasDisponibles: e.target.value })
              }
              min="1"
              className="form-input"
              required
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creando..." : "Crear Franja"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Modal para editar franja
 */
const EditTimeSlotModal = ({
  franja,
  servicios,
  onClose,
  onSuccess,
  onError,
}) => {
  const [formData, setFormData] = useState({
    servicioId: franja.servicioId,
    fecha: franja.fecha,
    horaInicio: franja.horaInicio.substring(0, 5),
    plazasDisponibles: franja.plazasDisponibles,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tieneReservas = franja.plazasDisponibles < franja.plazasTotales;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = {
        servicioId: parseInt(formData.servicioId),
        fecha: formData.fecha,
        horaInicio: formData.horaInicio + ":00",
        plazasDisponibles: parseInt(formData.plazasDisponibles),
      };

      await adminService.actualizarFranja(franja.id, data);
      onSuccess();
    } catch (err) {
      onError(err.message || "Error al actualizar la franja");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Editar Franja Horaria
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        {tieneReservas && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Esta franja tiene reservas activas</p>
              <p className="mt-1">
                Solo puedes modificar las plazas disponibles
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Servicio</label>
            <select
              value={formData.servicioId}
              onChange={(e) =>
                setFormData({ ...formData, servicioId: e.target.value })
              }
              className="form-input"
              disabled={tieneReservas}
              required
            >
              {servicios.map((servicio) => (
                <option key={servicio.id} value={servicio.id}>
                  {servicio.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Fecha</label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) =>
                setFormData({ ...formData, fecha: e.target.value })
              }
              className="form-input"
              disabled={tieneReservas}
              required
            />
          </div>

          <div>
            <label className="form-label">Hora de inicio</label>
            <input
              type="time"
              value={formData.horaInicio}
              onChange={(e) =>
                setFormData({ ...formData, horaInicio: e.target.value })
              }
              min="07:00"
              max="22:00"
              className="form-input"
              disabled={tieneReservas}
              required
            />
          </div>

          <div>
            <label className="form-label">Plazas disponibles</label>
            <input
              type="number"
              value={formData.plazasDisponibles}
              onChange={(e) =>
                setFormData({ ...formData, plazasDisponibles: e.target.value })
              }
              min={
                tieneReservas
                  ? franja.plazasTotales - franja.plazasDisponibles
                  : 1
              }
              className="form-input"
              required
            />
            {tieneReservas && (
              <p className="text-xs text-gray-500 mt-1">
                Mínimo: {franja.plazasTotales - franja.plazasDisponibles}{" "}
                (reservas activas)
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeSlotManagement;
