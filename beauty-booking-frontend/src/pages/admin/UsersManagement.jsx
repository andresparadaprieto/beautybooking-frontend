import React, { useState, useEffect } from "react";
import { Search, User, Mail, Calendar, Shield, Filter } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import adminService from "../../services/adminService";
import {
  useProtectedRoute,
  useLoading,
  useError,
  useDebounce,
} from "../../hooks";
import Loading from "../../components/common/Loading";
import { InlineAlert } from "../../components/common/Alert";
import { AdminSidebar } from "./Dashboard";

/**
 * Users Management - Gestión de usuarios
 *
 * Página de administración de usuarios con:
 * - Lista de todos los usuarios
 * - Búsqueda por nombre, email
 * - Filtros por rol
 * - Vista de información detallada
 */

const UsersManagement = () => {
  const { user } = useProtectedRoute("ADMIN");
  const { isLoading, setIsLoading } = useLoading(true);
  const { error, setError } = useError();

  // Estados principales
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRol, setFilterRol] = useState("todos"); // todos, ADMIN, CLIENTE

  // Debounce para búsqueda
  const debouncedSearch = useDebounce(searchTerm, 300);

  /**
   * Cargar usuarios al montar
   */
  useEffect(() => {
    loadUsuarios();
  }, []);

  /**
   * Aplicar filtros cuando cambian
   */
  useEffect(() => {
    applyFilters();
  }, [debouncedSearch, filterRol, usuarios]);

  /**
   * Cargar todos los usuarios
   */
  const loadUsuarios = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAllUsuarios();

      // Ordenar por fecha de creación (más recientes primero)
      const usuariosOrdenados = data.sort(
        (a, b) => new Date(b.creadoEn) - new Date(a.creadoEn)
      );

      setUsuarios(usuariosOrdenados);
      setUsuariosFiltrados(usuariosOrdenados);

      console.log(`✅ ${usuariosOrdenados.length} usuarios cargados`);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      setError("Error al cargar los usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Aplicar filtros y búsqueda
   */
  const applyFilters = () => {
    let filtered = [...usuarios];

    // Filtro por búsqueda
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.nombre?.toLowerCase().includes(search) ||
          u.email?.toLowerCase().includes(search) ||
          u.id.toString().includes(search)
      );
    }

    // Filtro por rol
    if (filterRol !== "todos") {
      filtered = filtered.filter((u) => u.rol === filterRol);
    }

    setUsuariosFiltrados(filtered);
  };

  /**
   * Obtener badge de rol
   */
  const getRolBadge = (rol) => {
    if (rol === "ADMIN") {
      return "bg-purple-100 text-purple-800 border-purple-200";
    }
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  /**
   * Formatear fecha
   */
  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    try {
      return format(parseISO(fecha), "dd/MM/yyyy HH:mm", { locale: es });
    } catch {
      return fecha;
    }
  };

  // Mostrar loading
  if (isLoading) {
    return <Loading fullScreen message="Cargando usuarios..." />;
  }

  // Calcular estadísticas
  const totalUsuarios = usuarios.length;
  const totalAdmins = usuarios.filter((u) => u.rol === "ADMIN").length;
  const totalClientes = usuarios.filter((u) => u.rol === "CLIENTE").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar activePage="usuarios" />

      {/* Contenido principal */}
      <div className="lg:pl-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600 mt-1">
              Administra todos los usuarios del sistema
            </p>
          </div>

          {/* Mensajes de error */}
          {error && (
            <InlineAlert type="error" message={error} className="mb-6" />
          )}

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Usuarios</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {totalUsuarios}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Administradores</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">
                    {totalAdmins}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Clientes</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {totalClientes}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Búsqueda */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beauty-500 focus:border-transparent"
                />
              </div>

              {/* Filtro por rol */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <select
                  value={filterRol}
                  onChange={(e) => setFilterRol(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beauty-500 focus:border-transparent"
                >
                  <option value="todos">Todos los roles</option>
                  <option value="ADMIN">Administradores</option>
                  <option value="CLIENTE">Clientes</option>
                </select>
              </div>
            </div>

            {/* Contador de resultados */}
            <div className="mt-4 text-sm text-gray-600">
              Mostrando {usuariosFiltrados.length} de {totalUsuarios} usuarios
            </div>
          </div>

          {/* Tabla de usuarios */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {usuariosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron usuarios</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                        ID
                      </th>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                        Usuario
                      </th>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                        Rol
                      </th>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                        Fecha Registro
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {usuariosFiltrados.map((usuario) => (
                      <tr
                        key={usuario.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <span className="text-sm font-medium text-gray-900">
                            #{usuario.id}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-beauty-400 to-beauty-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {usuario.nombre?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {usuario.nombre}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm">{usuario.email}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getRolBadge(
                              usuario.rol
                            )}`}
                          >
                            {usuario.rol === "ADMIN" ? (
                              <Shield className="w-3 h-3" />
                            ) : (
                              <User className="w-3 h-3" />
                            )}
                            {usuario.rol}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">
                              {formatearFecha(usuario.creadoEn)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;
