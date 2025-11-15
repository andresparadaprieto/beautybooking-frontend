import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Filter,
  Calendar,
  Download,
  Check,
  X,
  Eye,
  Edit,
  Printer,
  RefreshCw,
  Plus,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format, parseISO, startOfWeek, endOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import adminService from "../../services/adminService";
import bookingService from "../../services/bookingService";
import {
  useProtectedRoute,
  useLoading,
  useError,
  useDebounce,
  useToggle,
} from "../../hooks";
import Loading from "../../components/common/Loading";
import {
  InlineAlert,
  ConfirmDialog,
  Toast,
} from "../../components/common/Alert";
import { AdminSidebar } from "./Dashboard";

/**
 * Reservations Management
 *
 * Página de administración de reservas con:
 * - Vista de tabla completa de reservas
 * - Filtros avanzados (fecha, estado, servicio, cliente)
 * - Acciones masivas (confirmar, exportar)
 * - Cambio de estado individual
 * - Creación manual de reservas
 * - Exportación a CSV
 * - Envío de recordatorios
 */

const ReservationsManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useProtectedRoute("ADMIN");
  const { isLoading, setIsLoading } = useLoading(true);
  const { error, setError, clearError } = useError();
  const { value: filterOpen, toggle: toggleFilter } = useToggle(false);

  // Estados principales
  const [reservas, setReservas] = useState([]);
  const [reservasFiltradas, setReservasFiltradas] = useState([]);
  const [selectedReservas, setSelectedReservas] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState(null); // confirm, complete, cancel
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showNewReservationModal, setShowNewReservationModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);

  // Filtros
  const [filters, setFilters] = useState({
    fecha: "",
    estado: "todos",
    servicio: "todos",
    cliente: "",
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Debounce para búsqueda
  const debouncedSearch = useDebounce(searchTerm, 300);

  /**
   * Cargar reservas al montar
   */
  useEffect(() => {
    loadReservas();
  }, []);

  /**
   * Detectar query parameter para abrir modal automáticamente
   */
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const action = searchParams.get("action");

    if (action === "new") {
      setShowNewReservationModal(true);
      // Limpiar el query parameter de la URL
      navigate("/admin/reservas", { replace: true });
    }
  }, [location.search]);

  /**
   * Aplicar filtros cuando cambian
   */
  useEffect(() => {
    applyFilters();
  }, [debouncedSearch, filters, reservas]);

  /**
   * Cargar todas las reservas
   */
  const loadReservas = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAllReservas();

      // Ordenar por fecha más reciente
      const reservasOrdenadas = data.sort(
        (a, b) =>
          new Date(b.fecha || b.creadoEn) - new Date(a.fecha || a.creadoEn)
      );

      setReservas(reservasOrdenadas);
      setReservasFiltradas(reservasOrdenadas);

      console.log(`✅ ${reservasOrdenadas.length} reservas cargadas`);
    } catch (err) {
      console.error("Error cargando reservas:", err);
      setError("Error al cargar las reservas");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Aplicar filtros y búsqueda
   */
  const applyFilters = () => {
    let filtered = [...reservas];

    // Filtro por búsqueda
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.usuarioNombre?.toLowerCase().includes(search) ||
          r.usuarioEmail?.toLowerCase().includes(search) ||
          r.servicioNombre?.toLowerCase().includes(search) ||
          r.id.toString().includes(search)
      );
    }

    // Filtro por fecha
    if (filters.fecha) {
      filtered = filtered.filter((r) => r.fecha === filters.fecha);
    }

    // Filtro por estado
    if (filters.estado !== "todos") {
      filtered = filtered.filter((r) => r.estado === filters.estado);
    }

    // Filtro por servicio
    if (filters.servicio !== "todos") {
      filtered = filtered.filter(
        (r) => r.servicioId === parseInt(filters.servicio)
      );
    }

    // Filtro por cliente
    if (filters.cliente) {
      const clienteSearch = filters.cliente.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.usuarioNombre?.toLowerCase().includes(clienteSearch) ||
          r.usuarioEmail?.toLowerCase().includes(clienteSearch)
      );
    }

    setReservasFiltradas(filtered);
    setCurrentPage(1); // Reset página al filtrar
  };

  /**
   * Manejar selección de reservas
   */
  const handleSelectReserva = (reservaId) => {
    const newSelected = new Set(selectedReservas);
    if (newSelected.has(reservaId)) {
      newSelected.delete(reservaId);
    } else {
      newSelected.add(reservaId);
    }
    setSelectedReservas(newSelected);
  };

  /**
   * Seleccionar/deseleccionar todas
   */
  const handleSelectAll = () => {
    if (selectedReservas.size === paginatedReservas.length) {
      setSelectedReservas(new Set());
    } else {
      const allIds = paginatedReservas.map((r) => r.id);
      setSelectedReservas(new Set(allIds));
    }
  };

  /**
   * Confirmar acción masiva
   */
  const handleBulkAction = (action) => {
    if (selectedReservas.size === 0) {
      setError("Selecciona al menos una reserva");
      return;
    }

    setActionType(action);
    setShowConfirmDialog(true);
  };

  /**
   * Ejecutar acción masiva
   */
  const executeBulkAction = async () => {
    try {
      setShowConfirmDialog(false);
      const promises = [];

      selectedReservas.forEach((reservaId) => {
        switch (actionType) {
          case "confirm":
            promises.push(adminService.confirmarReserva(reservaId));
            break;
          case "complete":
            promises.push(adminService.completarReserva(reservaId));
            break;
          case "cancel":
            promises.push(adminService.cancelarReservaAdmin(reservaId));
            break;
        }
      });

      await Promise.all(promises);

      // Recargar reservas
      await loadReservas();

      // Limpiar selección
      setSelectedReservas(new Set());

      // Mostrar mensaje de éxito
      setToastMessage(`${selectedReservas.size} reserva(s) actualizadas`);
      setShowToast(true);
    } catch (err) {
      console.error("Error ejecutando acción masiva:", err);
      setError("Error al procesar las reservas seleccionadas");
    }
  };

  /**
   * Cambiar estado individual
   */
  const handleChangeStatus = async (reservaId, newStatus) => {
    try {
      switch (newStatus) {
        case "CONFIRMADA":
          await adminService.confirmarReserva(reservaId);
          break;
        case "COMPLETADA":
          await adminService.completarReserva(reservaId);
          break;
        case "CANCELADA":
          await adminService.cancelarReservaAdmin(reservaId);
          break;
      }

      // Actualizar localmente
      setReservas((prev) =>
        prev.map((r) => (r.id === reservaId ? { ...r, estado: newStatus } : r))
      );

      setToastMessage("Estado actualizado");
      setShowToast(true);
    } catch (err) {
      console.error("Error cambiando estado:", err);
      setError("Error al cambiar el estado de la reserva");
    }
  };

  /**
   * Abrir modal en modo edición
   */
  const handleEditReservation = (reserva) => {
    setEditingReservation(reserva);
    setShowNewReservationModal(true);
  };

  /**
   * Exportar a CSV
   */
  const handleExportCSV = () => {
    const dataToExport =
      selectedReservas.size > 0
        ? reservas.filter((r) => selectedReservas.has(r.id))
        : reservasFiltradas;

    const csv = adminService.exportarReservasCSV(dataToExport);
    const filename = `reservas_${format(new Date(), "yyyy-MM-dd_HH-mm")}.csv`;
    adminService.descargarCSV(csv, filename);

    setToastMessage(`${dataToExport.length} reservas exportadas`);
    setShowToast(true);
  };

  // Calcular paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedReservas = reservasFiltradas.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(reservasFiltradas.length / itemsPerPage);

  // Loading inicial
  if (isLoading) {
    return <Loading fullScreen message="Cargando reservas..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar activePage="reservas" />

      {/* Contenido principal */}
      <div className="lg:pl-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Reservas
            </h1>
            <p className="text-gray-600 mt-1">
              Administración completa de todas las reservas del sistema
            </p>
          </div>

          {/* Errores */}
          {error && (
            <InlineAlert type="error" message={error} className="mb-6" />
          )}

          {/* Barra de herramientas */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Búsqueda */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar cliente, email, código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2">
                <button
                  onClick={toggleFilter}
                  className={`btn-secondary flex items-center gap-2 ${
                    filterOpen ? "bg-gray-200" : ""
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  FILTRAR
                </button>

                <button
                  onClick={() => setShowNewReservationModal(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  NUEVA RESERVA MANUAL
                </button>
              </div>
            </div>

            {/* Panel de filtros expandible */}
            {filterOpen && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Fecha */}
                  <div>
                    <label className="form-label">Fecha</label>
                    <input
                      type="date"
                      value={filters.fecha}
                      onChange={(e) =>
                        setFilters({ ...filters, fecha: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="form-label">Estado</label>
                    <select
                      value={filters.estado}
                      onChange={(e) =>
                        setFilters({ ...filters, estado: e.target.value })
                      }
                      className="form-input"
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="CONFIRMADA">Confirmada</option>
                      <option value="COMPLETADA">Completada</option>
                      <option value="CANCELADA">Cancelada</option>
                    </select>
                  </div>

                  {/* Servicio */}
                  <div>
                    <label className="form-label">Servicio</label>
                    <select
                      value={filters.servicio}
                      onChange={(e) =>
                        setFilters({ ...filters, servicio: e.target.value })
                      }
                      className="form-input"
                    >
                      <option value="todos">Todos los servicios</option>
                      {/* Aquí deberías cargar los servicios dinámicamente */}
                    </select>
                  </div>

                  {/* Cliente */}
                  <div>
                    <label className="form-label">Cliente</label>
                    <input
                      type="text"
                      placeholder="Nombre o email"
                      value={filters.cliente}
                      onChange={(e) =>
                        setFilters({ ...filters, cliente: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() =>
                      setFilters({
                        fecha: "",
                        estado: "todos",
                        servicio: "todos",
                        cliente: "",
                      })
                    }
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Acciones masivas */}
          {selectedReservas.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-800">
                  {selectedReservas.size} reserva(s) seleccionada(s)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction("confirm")}
                    className="text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => handleBulkAction("complete")}
                    className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Completar
                  </button>
                  <button
                    onClick={() => handleBulkAction("cancel")}
                    className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tabla de reservas */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Cabecera de tabla con acciones */}
            <div className="px-6 py-3 border-b flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {reservasFiltradas.length} reservas encontradas
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </button>
              </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedReservas.size === paginatedReservas.length &&
                          paginatedReservas.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-beauty-500 focus:ring-beauty-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Servicio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedReservas.map((reserva) => (
                    <ReservationRow
                      key={reserva.id}
                      reserva={reserva}
                      selected={selectedReservas.has(reserva.id)}
                      onSelect={() => handleSelectReserva(reserva.id)}
                      onChangeStatus={(status) =>
                        handleChangeStatus(reserva.id, status)
                      }
                      onEdit={() => handleEditReservation(reserva)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="px-6 py-3 border-t flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Mostrando {indexOfFirstItem + 1} a{" "}
                  {Math.min(indexOfLastItem, reservasFiltradas.length)} de{" "}
                  {reservasFiltradas.length} reservas
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === i + 1
                          ? "bg-beauty-500 text-white"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de nueva reserva manual */}
      {showNewReservationModal && (
        <NewReservationModal
          editingReservation={editingReservation}
          onClose={() => {
            setShowNewReservationModal(false);
            setEditingReservation(null);
          }}
          onSuccess={() => {
            setShowNewReservationModal(false);
            setEditingReservation(null);
            loadReservas();
            setToastMessage(
              editingReservation
                ? "Reserva actualizada exitosamente"
                : "Reserva creada exitosamente"
            );
            setShowToast(true);
          }}
          onError={setError}
        />
      )}

      {/* Dialog de confirmación */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={executeBulkAction}
        title={`¿${
          actionType === "confirm"
            ? "Confirmar"
            : actionType === "complete"
            ? "Completar"
            : "Cancelar"
        } ${selectedReservas.size} reserva(s)?`}
        message="Esta acción actualizará el estado de las reservas seleccionadas."
        confirmText="Sí, continuar"
        cancelText="No, cancelar"
        type={actionType === "cancel" ? "danger" : "warning"}
      />

      {/* Toast */}
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
 * Componente de fila de reserva
 */
const ReservationRow = ({
  reserva,
  selected,
  onSelect,
  onChangeStatus,
  onEdit,
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="rounded border-gray-300 text-beauty-500 focus:ring-beauty-500"
        />
      </td>
      <td className="px-6 py-4 text-sm font-medium text-gray-900">
        #BK{String(reserva.id).padStart(5, "0")}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {reserva.usuarioNombre || "Sin nombre"}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {reserva.usuarioEmail}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {reserva.servicioNombre || reserva.nombreServicio || "Servicio"}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {reserva.fecha ? format(parseISO(reserva.fecha), "dd/MM/yyyy") : "-"}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {bookingService.formatearHora(
          reserva.horaInicio || reserva.horaReserva
        )}
      </td>
      <td className="px-6 py-4 text-sm font-medium text-gray-900">
        {reserva.precioFinal || reserva.precio} €
      </td>
      <td className="px-6 py-4">
        <span
          className={`badge ${bookingService.getEstadoColor(reserva.estado)}`}
        >
          {bookingService.getEstadoEspanol(reserva.estado)}
        </span>
      </td>
      <td className="px-6 py-4 text-right relative">
        <div className="flex items-center justify-end gap-1">
          {/* Editar */}
          <button
            onClick={onEdit}
            className="p-1 hover:bg-gray-100 rounded"
            title="Editar"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>

          {/* Cambiar estado */}
          {reserva.estado === "PENDIENTE" && (
            <button
              onClick={() => onChangeStatus("CONFIRMADA")}
              className="p-1 hover:bg-gray-100 rounded"
              title="Confirmar"
            >
              <Check className="w-4 h-4 text-green-600" />
            </button>
          )}

          {reserva.estado !== "CANCELADA" && (
            <button
              onClick={() => onChangeStatus("CANCELADA")}
              className="p-1 hover:bg-gray-100 rounded"
              title="Cancelar"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

/**
 * Modal para crear/editar reserva manual
 * @param {Object} editingReservation - Reserva a editar (null para crear nueva)
 */
const NewReservationModal = ({
  onClose,
  onSuccess,
  onError,
  editingReservation = null,
}) => {
  const isEditMode = !!editingReservation;
  const [servicios, setServicios] = useState([]);
  const [franjas, setFranjas] = useState([]);
  const [isLoadingServicios, setIsLoadingServicios] = useState(true);
  const [isLoadingFranjas, setIsLoadingFranjas] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    servicioId: "",
    fecha: format(new Date(), "yyyy-MM-dd"),
    franjaId: "",
    usuarioEmail: "",
    usuarioNombre: "",
    notas: "",
  });

  // Cargar servicios al montar
  useEffect(() => {
    loadServicios();
  }, []);

  // Prellenar datos en modo edición
  useEffect(() => {
    if (isEditMode && editingReservation) {
      setFormData({
        servicioId: editingReservation.servicioId?.toString() || "",
        fecha: editingReservation.fecha || format(new Date(), "yyyy-MM-dd"),
        franjaId: editingReservation.franjaId?.toString() || "",
        usuarioEmail: editingReservation.usuarioEmail || "",
        usuarioNombre: editingReservation.usuarioNombre || "",
        notas: editingReservation.notas || "",
      });
    }
  }, [isEditMode, editingReservation]);

  // Cargar franjas cuando cambia servicio o fecha
  useEffect(() => {
    if (formData.servicioId && formData.fecha) {
      loadFranjas();
    }
  }, [formData.servicioId, formData.fecha]);

  const loadServicios = async () => {
    try {
      setIsLoadingServicios(true);
      const data = await adminService.getAllServicios();
      setServicios(data.filter((s) => s.activo));
    } catch (err) {
      onError("Error al cargar servicios");
    } finally {
      setIsLoadingServicios(false);
    }
  };

  const loadFranjas = async () => {
    try {
      setIsLoadingFranjas(true);
      // Cargar franjas del servicio y fecha seleccionados
      const data = await adminService.getFranjasPorRango(
        formData.fecha,
        formData.fecha
      );
      const franjasDelServicio = data.filter(
        (f) => f.servicioId === parseInt(formData.servicioId) && f.disponible
      );
      setFranjas(franjasDelServicio);
    } catch (err) {
      onError("Error al cargar franjas disponibles");
    } finally {
      setIsLoadingFranjas(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar que todos los campos estén llenos
      if (
        !formData.servicioId ||
        !formData.fecha ||
        !formData.franjaId ||
        !formData.usuarioEmail ||
        !formData.usuarioNombre
      ) {
        onError("Por favor completa todos los campos obligatorios");
        setIsSubmitting(false);
        return;
      }

      // Preparar datos de la reserva
      const reservaData = {
        franjaId: parseInt(formData.franjaId),
        usuarioEmail: formData.usuarioEmail,
        usuarioNombre: formData.usuarioNombre,
        notas: formData.notas || "",
      };

      // Crear o editar según el modo
      if (isEditMode) {
        await adminService.editarReserva(editingReservation.id, reservaData);
      } else {
        await adminService.crearReservaManual(reservaData);
      }

      onSuccess();
    } catch (err) {
      onError(
        err.message || `Error al ${isEditMode ? "editar" : "crear"} la reserva`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Editar Reserva" : "Nueva Reserva Manual"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sección: Servicio y Fecha */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              1. Servicio y Fecha
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Servicio */}
              <div>
                <label className="form-label">Servicio *</label>
                <select
                  value={formData.servicioId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      servicioId: e.target.value,
                      franjaId: "",
                    })
                  }
                  className="form-input"
                  disabled={isLoadingServicios}
                  required
                >
                  <option value="">Seleccionar servicio...</option>
                  {servicios.map((servicio) => (
                    <option key={servicio.id} value={servicio.id}>
                      {servicio.nombre} - {servicio.precio}€ (
                      {servicio.duracionMinutos} min)
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
                    setFormData({
                      ...formData,
                      fecha: e.target.value,
                      franjaId: "",
                    })
                  }
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Franja horaria */}
            <div>
              <label className="form-label">Franja Horaria *</label>
              {isLoadingFranjas ? (
                <div className="text-sm text-gray-500 py-2">
                  Cargando franjas disponibles...
                </div>
              ) : franjas.length === 0 &&
                formData.servicioId &&
                formData.fecha ? (
                <div className="text-sm text-red-600 py-2">
                  No hay franjas disponibles para este servicio en esta fecha
                </div>
              ) : (
                <select
                  value={formData.franjaId}
                  onChange={(e) =>
                    setFormData({ ...formData, franjaId: e.target.value })
                  }
                  className="form-input"
                  disabled={!formData.servicioId || !formData.fecha}
                  required
                >
                  <option value="">Seleccionar horario...</option>
                  {franjas.map((franja) => (
                    <option key={franja.id} value={franja.id}>
                      {franja.horaInicio} - {franja.horaFin} (
                      {franja.plazasDisponibles} plaza(s) disponible(s))
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Sección: Datos del Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              2. Datos del Cliente
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="form-label">Nombre completo *</label>
                <input
                  type="text"
                  value={formData.usuarioNombre}
                  onChange={(e) =>
                    setFormData({ ...formData, usuarioNombre: e.target.value })
                  }
                  className="form-input"
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  value={formData.usuarioEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, usuarioEmail: e.target.value })
                  }
                  className="form-input"
                  placeholder="ejemplo@email.com"
                  required
                />
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="form-label">Notas (opcional)</label>
              <textarea
                value={formData.notas}
                onChange={(e) =>
                  setFormData({ ...formData, notas: e.target.value })
                }
                className="form-input"
                rows="3"
                placeholder="Comentarios o instrucciones especiales..."
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t">
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
              disabled={isSubmitting || isLoadingServicios}
            >
              {isSubmitting
                ? isEditMode
                  ? "Guardando cambios..."
                  : "Creando reserva..."
                : isEditMode
                ? "Guardar Cambios"
                : "Crear Reserva"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationsManagement;
