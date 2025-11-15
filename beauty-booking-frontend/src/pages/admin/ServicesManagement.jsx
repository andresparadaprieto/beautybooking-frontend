import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Search,
  Clock,
  Users,
  Euro,
  Calendar,
  Image,
  Save,
  X,
  AlertCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import adminService from "../../services/adminService";
import {
  useProtectedRoute,
  useLoading,
  useError,
  useForm,
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
 * Services Management
 *
 * Página de administración de servicios con:
 * - CRUD completo de servicios
 * - Activar/desactivar servicios
 * - Gestión de franjas horarias
 * - Estadísticas por servicio
 * - Vista en cards con acciones
 */

const ServicesManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useProtectedRoute("ADMIN");
  const { isLoading, setIsLoading } = useLoading(true);
  const { error, setError, clearError } = useError();
  const {
    value: showForm,
    setTrue: openForm,
    setFalse: closeForm,
  } = useToggle(false);

  // Estados principales
  const [servicios, setServicios] = useState([]);
  const [serviciosFiltrados, setServiciosFiltrados] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTab, setFilterTab] = useState("todos"); // todos, activos, inactivos
  const [editingServicio, setEditingServicio] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [servicioToDelete, setServicioToDelete] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showFranjasModal, setShowFranjasModal] = useState(false);
  const [servicioForFranjas, setServicioForFranjas] = useState(null);

  /**
   * Cargar servicios al montar
   */
  useEffect(() => {
    loadServicios();
  }, []);

  /**
   * Detectar query parameter para abrir modal de nuevo servicio
   */
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const action = searchParams.get("action");

    if (action === "new") {
      setEditingServicio(null);
      openForm();
      // Limpiar el query parameter de la URL
      navigate("/admin/servicios", { replace: true });
    }
  }, [location.search]);

  /**
   * Filtrar servicios cuando cambian los filtros
   */
  useEffect(() => {
    filterServicios();
  }, [searchTerm, filterTab, servicios]);

  /**
   * Cargar todos los servicios
   */
  const loadServicios = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAllServicios();
      setServicios(data);
      console.log(`✅ ${data.length} servicios cargados`);
    } catch (err) {
      console.error("Error cargando servicios:", err);
      setError("Error al cargar los servicios");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Filtrar servicios
   */
  const filterServicios = () => {
    let filtered = [...servicios];

    // Filtro por búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.nombre.toLowerCase().includes(search) ||
          s.descripcion?.toLowerCase().includes(search)
      );
    }

    // Filtro por estado
    switch (filterTab) {
      case "activos":
        filtered = filtered.filter((s) => s.activo);
        break;
      case "inactivos":
        filtered = filtered.filter((s) => !s.activo);
        break;
    }

    setServiciosFiltrados(filtered);
  };

  /**
   * Abrir formulario para editar
   */
  const handleEdit = (servicio) => {
    setEditingServicio(servicio);
    openForm();
  };

  /**
   * Abrir formulario para crear nuevo
   */
  const handleNew = () => {
    setEditingServicio(null);
    openForm();
  };

  /**
   * Cerrar formulario
   */
  const handleCloseForm = () => {
    setEditingServicio(null);
    closeForm();
    clearError();
  };

  /**
   * Activar/desactivar servicio
   */
  const handleToggleActive = async (servicio) => {
    try {
      await adminService.toggleServicioActivo(servicio.id, !servicio.activo);

      // Actualizar localmente
      setServicios((prev) =>
        prev.map((s) =>
          s.id === servicio.id ? { ...s, activo: !s.activo } : s
        )
      );

      setToastMessage(
        `Servicio ${!servicio.activo ? "activado" : "desactivado"}`
      );
      setShowToast(true);
    } catch (err) {
      console.error("Error cambiando estado del servicio:", err);
      setError("Error al cambiar el estado del servicio");
    }
  };

  /**
   * Confirmar eliminación
   */
  const handleDelete = (servicio) => {
    setServicioToDelete(servicio);
    setShowDeleteDialog(true);
  };

  /**
   * Ejecutar eliminación
   */
  const executeDelete = async () => {
    if (!servicioToDelete) return;

    try {
      await adminService.eliminarServicio(servicioToDelete.id);

      // Actualizar lista local
      setServicios((prev) => prev.filter((s) => s.id !== servicioToDelete.id));

      setToastMessage("Servicio eliminado");
      setShowToast(true);
      setShowDeleteDialog(false);
      setServicioToDelete(null);
    } catch (err) {
      console.error("Error eliminando servicio:", err);
      setError(
        "Error al eliminar el servicio. Puede tener reservas asociadas."
      );
      setShowDeleteDialog(false);
    }
  };

  /**
   * Guardar servicio (crear o actualizar)
   */
  const handleSaveServicio = async (servicioData) => {
    try {
      let savedServicio;

      if (editingServicio) {
        // Actualizar
        savedServicio = await adminService.actualizarServicio(
          editingServicio.id,
          servicioData
        );

        // Actualizar en la lista
        setServicios((prev) =>
          prev.map((s) => (s.id === editingServicio.id ? savedServicio : s))
        );

        setToastMessage("Servicio actualizado");
      } else {
        // Crear nuevo
        savedServicio = await adminService.crearServicio(servicioData);

        // Añadir a la lista
        setServicios((prev) => [savedServicio, ...prev]);

        setToastMessage("Servicio creado");
      }

      setShowToast(true);
      handleCloseForm();
    } catch (err) {
      console.error("Error guardando servicio:", err);
      throw err; // Propagar error al formulario
    }
  };

  // Contar servicios por estado
  const countByStatus = {
    todos: servicios.length,
    activos: servicios.filter((s) => s.activo).length,
    inactivos: servicios.filter((s) => !s.activo).length,
  };

  // Loading inicial
  if (isLoading) {
    return <Loading fullScreen message="Cargando servicios..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar activePage="servicios" />

      {/* Contenido principal */}
      <div className="lg:pl-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestión de Servicios
              </h1>
              <p className="text-gray-600 mt-1">
                Catálogo completo de tratamientos y servicios del salón
              </p>
            </div>

            <button
              onClick={handleNew}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              CREAR NUEVO SERVICIO
            </button>
          </div>

          {/* Errores */}
          {error && (
            <InlineAlert type="error" message={error} className="mb-6" />
          )}

          {/* Tabs de filtro */}
          <div className="bg-white rounded-lg shadow-sm p-1 mb-6">
            <div className="flex">
              <TabButton
                active={filterTab === "todos"}
                onClick={() => setFilterTab("todos")}
                label={`Todos (${countByStatus.todos})`}
              />
              <TabButton
                active={filterTab === "activos"}
                onClick={() => setFilterTab("activos")}
                label={`Activos (${countByStatus.activos})`}
                color="green"
              />
              <TabButton
                active={filterTab === "inactivos"}
                onClick={() => setFilterTab("inactivos")}
                label={`Inactivos (${countByStatus.inactivos})`}
                color="red"
              />
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar servicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>

          {/* Grid de servicios */}
          {serviciosFiltrados.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <div className="text-gray-400 mb-4">
                <Calendar className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay servicios
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "No se encontraron servicios con ese criterio"
                  : "Comienza creando tu primer servicio"}
              </p>
              {!searchTerm && (
                <button onClick={handleNew} className="btn-primary">
                  Crear primer servicio
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {serviciosFiltrados.map((servicio) => (
                <ServiceCard
                  key={servicio.id}
                  servicio={servicio}
                  onEdit={() => handleEdit(servicio)}
                  onToggleActive={() => handleToggleActive(servicio)}
                  onDelete={() => handleDelete(servicio)}
                  onManageFranjas={() => {
                    setServicioForFranjas(servicio);
                    setShowFranjasModal(true);
                  }}
                  onViewStats={() => {
                    console.log("Estadísticas del servicio:", servicio.id);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <ServiceFormModal
          servicio={editingServicio}
          onSave={handleSaveServicio}
          onClose={handleCloseForm}
        />
      )}

      {/* Modal de gestión de franjas */}
      {showFranjasModal && servicioForFranjas && (
        <ServiceTimeSlotsModal
          servicio={servicioForFranjas}
          onClose={() => {
            setShowFranjasModal(false);
            setServicioForFranjas(null);
          }}
        />
      )}

      {/* Dialog de confirmación de eliminación */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setServicioToDelete(null);
        }}
        onConfirm={executeDelete}
        title="¿Eliminar servicio?"
        message={`¿Estás seguro de que quieres eliminar "${servicioToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        type="danger"
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
 * Componente de botón de tab
 */
const TabButton = ({ active, onClick, label, color = "gray" }) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 px-4 py-3 rounded-lg font-medium transition-all
        ${
          active
            ? "bg-gray-900 text-white"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }
      `}
    >
      {label}
    </button>
  );
};

/**
 * Componente de tarjeta de servicio
 */
const ServiceCard = ({
  servicio,
  onEdit,
  onToggleActive,
  onDelete,
  onManageFranjas,
  onViewStats,
}) => {
  // Simular estadísticas (en producción vendría del backend)
  const stats = {
    reservasEsteMes: Math.floor(Math.random() * 50),
    reservasTotal: Math.floor(Math.random() * 200) + 50,
  };

  return (
    <div
      className={`
      bg-white rounded-lg shadow-md overflow-hidden
      ${!servicio.activo ? "opacity-75" : ""}
    `}
    >
      {/* Header con imagen placeholder */}
      <div
        className="h-32 bg-gradient-to-br from-beauty-100 to-beauty-200 
                      flex items-center justify-center"
      >
        <Image className="w-12 h-12 text-beauty-400" />
      </div>

      {/* Estado activo/inactivo */}
      <div className="px-6 pt-4 flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {servicio.nombre}
          </h3>
          <span
            className={`
            inline-flex items-center gap-1 text-xs font-medium mt-1
            ${servicio.activo ? "text-green-600" : "text-red-600"}
          `}
          >
            {servicio.activo ? (
              <>
                <Power className="w-3 h-3" />
                ACTIVO
              </>
            ) : (
              <>
                <PowerOff className="w-3 h-3" />
                INACTIVO
              </>
            )}
          </span>
        </div>

        {/* Botón de editar */}
        <button
          onClick={onEdit}
          className="p-2 hover:bg-gray-100 rounded-lg"
          title="Editar servicio"
        >
          <Edit className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Descripción */}
      <div className="px-6 py-2">
        <p className="text-sm text-gray-600 line-clamp-2">
          {servicio.descripcion || "Sin descripción"}
        </p>
      </div>

      {/* Información del servicio */}
      <div className="px-6 py-4 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Duración:</span>
          <span className="font-medium">{servicio.duracionMinutos} min</span>
        </div>

        <div className="flex items-center gap-2">
          <Euro className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Precio:</span>
          <span className="font-medium">{servicio.precio} €</span>
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Aforo:</span>
          <span className="font-medium">{servicio.aforoMaximo} persona(s)</span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Reservas:</span>
          <span className="font-medium">{stats.reservasEsteMes} este mes</span>
        </div>
      </div>

      {/* Acciones */}
      <div className="px-6 py-4 border-t grid grid-cols-2 gap-2">
        <button
          onClick={onManageFranjas}
          className="btn-secondary text-sm flex items-center justify-center gap-1"
        >
          <Calendar className="w-4 h-4" />
          GESTIONAR FRANJAS
        </button>
        <button
          onClick={onToggleActive}
          className={`
            text-sm px-3 py-2 rounded-lg font-medium
            ${
              servicio.activo
                ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }
          `}
        >
          {servicio.activo ? "DESACTIVAR" : "ACTIVAR"}
        </button>

        <button
          onClick={onDelete}
          className="text-sm px-3 py-2 rounded-lg font-medium
                   bg-red-100 text-red-700 hover:bg-red-200"
        >
          <Trash2 className="w-4 h-4 inline mr-1" />
          ELIMINAR
        </button>
      </div>
    </div>
  );
};

/**
 * Modal de formulario de servicio
 */
const ServiceFormModal = ({ servicio, onSave, onClose }) => {
  const form = useForm(
    {
      nombre: servicio?.nombre || "",
      descripcion: servicio?.descripcion || "",
      duracionMinutos: servicio?.duracionMinutos || 30,
      precio: servicio?.precio || 0,
      aforoMaximo: servicio?.aforoMaximo || 1,
      activo: servicio?.activo !== false,
    },
    {
      nombre: { required: true, message: "El nombre es obligatorio" },
      duracionMinutos: {
        required: true,
        validate: (value) =>
          value > 0 ? null : "La duración debe ser mayor a 0",
      },
      precio: {
        required: true,
        validate: (value) =>
          value >= 0 ? null : "El precio no puede ser negativo",
      },
      aforoMaximo: {
        required: true,
        validate: (value) => (value > 0 ? null : "El aforo debe ser mayor a 0"),
      },
    }
  );

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.validate()) {
      setError("Por favor, corrige los errores en el formulario");
      return;
    }

    form.setIsSubmitting(true);
    setError("");

    try {
      await onSave(form.values);
    } catch (err) {
      setError(err.message || "Error al guardar el servicio");
      form.setIsSubmitting(false);
    }
  };

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
          <div className="border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              {servicio ? "Editar Servicio" : "Nuevo Servicio"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <InlineAlert type="error" message={error} />}

            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="form-label">
                Nombre del servicio *
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={form.values.nombre}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                className={`form-input ${
                  form.errors.nombre && form.touched.nombre
                    ? "border-red-500"
                    : ""
                }`}
                placeholder="Ej: Corte de pelo"
              />
              {form.errors.nombre && form.touched.nombre && (
                <p className="mt-1 text-sm text-red-600">
                  {form.errors.nombre}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="descripcion" className="form-label">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={3}
                value={form.values.descripcion}
                onChange={form.handleChange}
                className="form-input"
                placeholder="Describe el servicio..."
              />
            </div>

            {/* Duración y Precio */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="duracionMinutos" className="form-label">
                  Duración (minutos) *
                </label>
                <input
                  id="duracionMinutos"
                  name="duracionMinutos"
                  type="number"
                  min="0"
                  step="15"
                  value={form.values.duracionMinutos}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  className={`form-input ${
                    form.errors.duracionMinutos && form.touched.duracionMinutos
                      ? "border-red-500"
                      : ""
                  }`}
                />
                {form.errors.duracionMinutos &&
                  form.touched.duracionMinutos && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.errors.duracionMinutos}
                    </p>
                  )}
              </div>

              <div>
                <label htmlFor="precio" className="form-label">
                  Precio (€) *
                </label>
                <input
                  id="precio"
                  name="precio"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.values.precio}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  className={`form-input ${
                    form.errors.precio && form.touched.precio
                      ? "border-red-500"
                      : ""
                  }`}
                />
                {form.errors.precio && form.touched.precio && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.errors.precio}
                  </p>
                )}
              </div>
            </div>

            {/* Aforo y Estado */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="aforoMaximo" className="form-label">
                  Aforo máximo *
                </label>
                <input
                  id="aforoMaximo"
                  name="aforoMaximo"
                  type="number"
                  min="1"
                  value={form.values.aforoMaximo}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  className={`form-input ${
                    form.errors.aforoMaximo && form.touched.aforoMaximo
                      ? "border-red-500"
                      : ""
                  }`}
                />
                {form.errors.aforoMaximo && form.touched.aforoMaximo && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.errors.aforoMaximo}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label">Estado</label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="activo"
                      checked={form.values.activo}
                      onChange={() => form.setFieldValue("activo", true)}
                      className="mr-2"
                    />
                    <span className="text-sm">Activo</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="activo"
                      checked={!form.values.activo}
                      onChange={() => form.setFieldValue("activo", false)}
                      className="mr-2"
                    />
                    <span className="text-sm">Inactivo</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={form.isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center gap-2"
                disabled={form.isSubmitting}
              >
                {form.isSubmitting ? (
                  <>Guardando...</>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {servicio ? "Guardar Cambios" : "Crear Servicio"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

/**
 * Modal de gestión de franjas horarias de un servicio
 */
const ServiceTimeSlotsModal = ({ servicio, onClose }) => {
  const [franjas, setFranjas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedFranja, setSelectedFranja] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadFranjas();
  }, [servicio.id]);

  const loadFranjas = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getFranjasPorServicio(servicio.id);
      setFranjas(data);
    } catch (err) {
      setError("Error al cargar las franjas");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Franjas Horarias
            </h2>
            <p className="text-gray-600 mt-1">
              {servicio.nombre} ({servicio.duracionMinutos} minutos)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <InlineAlert
              type="error"
              message={error}
              onClose={() => setError(null)}
              className="mb-4"
            />
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loading />
            </div>
          ) : (
            <>
              {/* Botón crear */}
              <div className="mb-6">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Nueva Franja
                </button>
              </div>

              {/* Lista de franjas */}
              {franjas.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No hay franjas horarias para este servicio
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {franjas
                    .sort((a, b) => {
                      const dateCompare = a.fecha.localeCompare(b.fecha);
                      if (dateCompare !== 0) return dateCompare;
                      return a.horaInicio.localeCompare(b.horaInicio);
                    })
                    .map((franja) => (
                      <div
                        key={franja.id}
                        className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-beauty-100 rounded-lg p-3 text-center min-w-[80px]">
                            <div className="text-sm font-bold text-beauty-600">
                              {format(parseISO(franja.fecha), "dd/MM/yyyy")}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="font-semibold text-gray-900">
                                {franja.horaInicio} - {franja.horaFin}
                              </span>
                              <span
                                className={`ml-2 px-2 py-1 text-xs font-medium rounded ${
                                  franja.disponible
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {franja.disponible ? "Disponible" : "Completo"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {franja.plazasDisponibles} /{" "}
                              {franja.plazasTotales} plazas disponibles
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedFranja(franja);
                              setShowEditForm(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedFranja(franja);
                              setShowDeleteDialog(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button onClick={onClose} className="btn-secondary">
            Cerrar
          </button>
        </div>
      </div>

      {/* Modal crear franja */}
      {showCreateForm && (
        <TimeSlotForm
          servicioId={servicio.id}
          duracionMinutos={servicio.duracionMinutos}
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            loadFranjas();
          }}
          onError={setError}
        />
      )}

      {/* Modal editar franja */}
      {showEditForm && selectedFranja && (
        <TimeSlotForm
          franja={selectedFranja}
          servicioId={servicio.id}
          duracionMinutos={servicio.duracionMinutos}
          onClose={() => {
            setShowEditForm(false);
            setSelectedFranja(null);
          }}
          onSuccess={() => {
            setShowEditForm(false);
            setSelectedFranja(null);
            loadFranjas();
          }}
          onError={setError}
        />
      )}

      {/* Confirmación eliminar */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-[60]">
          <ConfirmDialog
            isOpen={showDeleteDialog}
            onClose={() => {
              setShowDeleteDialog(false);
              setSelectedFranja(null);
            }}
            onConfirm={handleDelete}
            title="Eliminar franja horaria"
            message="¿Estás seguro de eliminar esta franja? Esta acción no se puede deshacer."
            confirmText="Eliminar"
            cancelText="Cancelar"
            type="danger"
          />
        </div>
      )}
    </div>
  );
};

/**
 * Formulario para crear/editar franja
 */
const TimeSlotForm = ({
  franja,
  servicioId,
  duracionMinutos,
  onClose,
  onSuccess,
  onError,
}) => {
  const isEdit = !!franja;
  const tieneReservas = franja
    ? franja.plazasDisponibles < franja.plazasTotales
    : false;

  const [formData, setFormData] = useState({
    fecha: franja?.fecha || "",
    horaInicio: franja?.horaInicio.substring(0, 5) || "",
    plazasDisponibles: franja?.plazasDisponibles || 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = {
        servicioId,
        fecha: formData.fecha,
        horaInicio: formData.horaInicio + ":00",
        plazasDisponibles: parseInt(formData.plazasDisponibles),
      };

      if (isEdit) {
        await adminService.actualizarFranja(franja.id, data);
      } else {
        await adminService.crearFranja(data);
      }

      onSuccess();
    } catch (err) {
      onError(
        err.message || `Error al ${isEdit ? "actualizar" : "crear"} la franja`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {isEdit ? "Editar Franja" : "Nueva Franja"}
        </h3>

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
            <label className="form-label">Fecha *</label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) =>
                setFormData({ ...formData, fecha: e.target.value })
              }
              min={format(new Date(), "yyyy-MM-dd")}
              className="form-input"
              disabled={tieneReservas}
              required
            />
          </div>

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
              disabled={tieneReservas}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Horario: 07:00 - 22:00 | Duración: {duracionMinutos} min
            </p>
          </div>

          <div>
            <label className="form-label">Plazas disponibles *</label>
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
              {isSubmitting
                ? isEdit
                  ? "Guardando..."
                  : "Creando..."
                : isEdit
                ? "Guardar"
                : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServicesManagement;
