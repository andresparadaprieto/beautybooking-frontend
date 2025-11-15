import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Users, Euro, Search, Filter, Image } from "lucide-react";
import bookingService from "../services/bookingService";
import { useAuth } from "../context/AuthContext";
import { useLoading, useError, useDebounce } from "../hooks";
import Loading, { LoadingCard } from "../components/common/Loading";
import { InlineAlert } from "../components/common/Alert";

/**
 * Services Page
 *
 * Página que muestra el catálogo de servicios con:
 * - Grid de servicios disponibles
 * - Búsqueda y filtros
 * - Información de cada servicio
 * - Botón para reservar
 */

const Services = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isLoading, executeWithLoading } = useLoading(true);
  const { error, setError, clearError } = useError();

  // Estados para servicios y filtros
  const [servicios, setServicios] = useState([]);
  const [serviciosFiltrados, setServiciosFiltrados] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    precioMin: "",
    precioMax: "",
    duracionMax: "",
    aforo: "todos", // todos, individual, grupal
  });

  // Debounce para búsqueda (evita buscar en cada tecla)
  const debouncedSearch = useDebounce(searchTerm, 300);

  /**
   * Cargar servicios al montar el componente
   */
  useEffect(() => {
    loadServicios();
  }, []);

  /**
   * Aplicar filtros cuando cambian los criterios
   */
  useEffect(() => {
    applyFilters();
  }, [debouncedSearch, filters, servicios]);

  /**
   * Cargar servicios desde el backend
   */
  const loadServicios = async () => {
    try {
      const data = await executeWithLoading(async () => {
        return await bookingService.getServicios();
      });

      // Solo mostrar servicios activos
      const serviciosActivos = data.filter((s) => s.activo !== false);
      setServicios(serviciosActivos);
      setServiciosFiltrados(serviciosActivos);

      console.log(`✅ ${serviciosActivos.length} servicios cargados`);
    } catch (err) {
      console.error("Error cargando servicios:", err);
      setError("Error al cargar los servicios. Por favor, intenta de nuevo.");
    }
  };

  /**
   * Aplicar filtros y búsqueda
   */
  const applyFilters = () => {
    let filtered = [...servicios];

    // Filtro por búsqueda
    if (debouncedSearch) {
      filtered = filtered.filter(
        (servicio) =>
          servicio.nombre
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase()) ||
          servicio.descripcion
            ?.toLowerCase()
            .includes(debouncedSearch.toLowerCase())
      );
    }

    // Filtro por precio mínimo
    if (filters.precioMin) {
      filtered = filtered.filter(
        (s) => s.precio >= parseFloat(filters.precioMin)
      );
    }

    // Filtro por precio máximo
    if (filters.precioMax) {
      filtered = filtered.filter(
        (s) => s.precio <= parseFloat(filters.precioMax)
      );
    }

    // Filtro por duración máxima
    if (filters.duracionMax) {
      filtered = filtered.filter(
        (s) => s.duracionMinutos <= parseInt(filters.duracionMax)
      );
    }

    // Filtro por tipo de aforo
    if (filters.aforo === "individual") {
      filtered = filtered.filter((s) => s.aforoMaximo === 1);
    } else if (filters.aforo === "grupal") {
      filtered = filtered.filter((s) => s.aforoMaximo > 1);
    }

    setServiciosFiltrados(filtered);
  };

  /**
   * Manejar click en reservar
   */
  const handleReservar = (servicioId) => {
    if (!isAuthenticated()) {
      // Guardar la intención de reserva y redirigir a login
      navigate("/login", {
        state: { from: { pathname: `/booking/${servicioId}` } },
      });
    } else {
      // Ir directamente a la página de reserva
      navigate(`/booking/${servicioId}`);
    }
  };

  /**
   * Resetear filtros
   */
  const resetFilters = () => {
    setFilters({
      precioMin: "",
      precioMax: "",
      duracionMax: "",
      aforo: "todos",
    });
    setSearchTerm("");
    setFilterOpen(false);
  };

  /**
   * Formatear duración en formato legible
   */
  const formatDuracion = (minutos) => {
    if (minutos < 60) {
      return `${minutos} min`;
    }
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
  };

  // Mostrar loading inicial
  if (isLoading) {
    return <Loading fullScreen message="Cargando servicios..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nuestros Servicios
          </h1>
          <p className="text-gray-600">
            Descubre nuestra gama completa de tratamientos de belleza
          </p>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 
                                 text-gray-400 w-5 h-5"
                />
                <input
                  type="text"
                  placeholder="Buscar servicios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10 w-full"
                />
              </div>
            </div>

            {/* Botón de filtros */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="btn-secondary flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filtros
              {(filters.precioMin ||
                filters.precioMax ||
                filters.duracionMax ||
                filters.aforo !== "todos") && (
                <span className="ml-1 px-2 py-1 bg-beauty-500 text-white text-xs rounded-full">
                  Activos
                </span>
              )}
            </button>
          </div>

          {/* Panel de filtros expandible */}
          {filterOpen && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Precio mínimo */}
                <div>
                  <label className="form-label">Precio mínimo (€)</label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={filters.precioMin}
                    onChange={(e) =>
                      setFilters({ ...filters, precioMin: e.target.value })
                    }
                    className="form-input"
                    placeholder="0"
                  />
                </div>

                {/* Precio máximo */}
                <div>
                  <label className="form-label">Precio máximo (€)</label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={filters.precioMax}
                    onChange={(e) =>
                      setFilters({ ...filters, precioMax: e.target.value })
                    }
                    className="form-input"
                    placeholder="100"
                  />
                </div>

                {/* Duración máxima */}
                <div>
                  <label className="form-label">Duración máx. (min)</label>
                  <input
                    type="number"
                    min="0"
                    step="15"
                    value={filters.duracionMax}
                    onChange={(e) =>
                      setFilters({ ...filters, duracionMax: e.target.value })
                    }
                    className="form-input"
                    placeholder="120"
                  />
                </div>

                {/* Tipo de servicio */}
                <div>
                  <label className="form-label">Tipo de servicio</label>
                  <select
                    value={filters.aforo}
                    onChange={(e) =>
                      setFilters({ ...filters, aforo: e.target.value })
                    }
                    className="form-input"
                  >
                    <option value="todos">Todos</option>
                    <option value="individual">Individual</option>
                    <option value="grupal">Grupal</option>
                  </select>
                </div>
              </div>

              {/* Botón limpiar filtros */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mensajes de error */}
        {error && <InlineAlert type="error" message={error} className="mb-6" />}

        {/* Resultados */}
        {serviciosFiltrados.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron servicios
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filters.precioMin || filters.precioMax
                ? "Intenta ajustar los filtros de búsqueda"
                : "No hay servicios disponibles en este momento"}
            </p>
            {(searchTerm || filters.precioMin || filters.precioMax) && (
              <button onClick={resetFilters} className="btn-secondary">
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Contador de resultados */}
            <div className="mb-4 text-sm text-gray-600">
              {serviciosFiltrados.length === servicios.length
                ? `Mostrando ${serviciosFiltrados.length} servicios`
                : `Mostrando ${serviciosFiltrados.length} de ${servicios.length} servicios`}
            </div>

            {/* Grid de servicios */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviciosFiltrados.map((servicio) => (
                <ServiceCard
                  key={servicio.id}
                  servicio={servicio}
                  onReservar={handleReservar}
                  formatDuracion={formatDuracion}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Componente de tarjeta de servicio
 */
const ServiceCard = ({ servicio, onReservar, formatDuracion }) => {
  //
  const getServiceImage = (nombre) => {
    // Por hacer luego: Imagen placeholder según el servicio
    // Mediante un mapeo de imágenes reales
    const images = {
      corte: "💇‍♀️",
      manicura: "💅",
      facial: "✨",
      pedicura: "👣",
      coloración: "🎨",
      masaje: "💆‍♀️",
      maquillaje: "💄",
      depilación: "🌿",
    };

    // Buscar coincidencia en el nombre
    const key = Object.keys(images).find((k) =>
      nombre.toLowerCase().includes(k)
    );

    return images[key] || "💆‍♀️";
  };

  return (
    <div
      className="card hover:shadow-xl transition-all duration-300 
                    border border-gray-100 overflow-hidden group"
    >
      {/* Imagen/Icono del servicio */}
      <div
        className="h-32 bg-gradient-to-br from-beauty-100 to-beauty-200 
                      flex items-center justify-center text-5xl
                      group-hover:scale-110 transition-transform duration-300"
      >
        {getServiceImage(servicio.nombre)}
      </div>

      {/* Información del servicio */}
      <div className="p-6">
        {/* Nombre */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {servicio.nombre}
        </h3>

        {/* Descripción */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {servicio.descripcion || "Servicio profesional de alta calidad"}
        </p>

        {/* Detalles */}
        <div className="space-y-2 mb-4">
          {/* Duración */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Duración: {formatDuracion(servicio.duracionMinutos)}</span>
          </div>

          {/* Aforo */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>
              Aforo:{" "}
              {servicio.aforoMaximo === 1
                ? "1 persona"
                : `${servicio.aforoMaximo} personas`}
            </span>
          </div>
        </div>

        {/* Precio y botón */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-beauty-600">
            {servicio.precio} €
          </div>
          <button
            onClick={() => onReservar(servicio.id)}
            className="btn-primary"
          >
            RESERVAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default Services;
