import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  Euro,
  TrendingUp,
  Clock,
  ChevronRight,
  AlertCircle,
  Activity,
  Plus,
  FileText,
  BarChart,
} from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import adminService from "../../services/adminService";
import bookingService from "../../services/bookingService";
import { useProtectedRoute, useLoading, useError } from "../../hooks";
import Loading from "../../components/common/Loading";
import { InlineAlert } from "../../components/common/Alert";

/**
 * Admin Dashboard
 *
 * Panel principal del administrador con:
 * - Estadísticas generales
 * - Reservas del día
 * - Accesos rápidos
 * - Servicios más populares
 * - Alertas y notificaciones
 */

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useProtectedRoute("ADMIN"); // Solo admin
  const { isLoading, setIsLoading } = useLoading(true);
  const { error, setError } = useError();

  // Estados para las estadísticas
  const [stats, setStats] = useState({
    reservasTotales: 0,
    reservasHoy: 0,
    reservasPendientes: 0,
    ingresosMes: 0,
    clientesActivos: 0,
    serviciosActivos: 0,
  });

  // Estados para datos adicionales
  const [reservasHoy, setReservasHoy] = useState([]);
  const [serviciosPopulares, setServiciosPopulares] = useState([]);
  const [alertas, setAlertas] = useState([]);

  /**
   * Cargar todos los datos al montar
   */
  useEffect(() => {
    loadDashboardData();
  }, []);

  /**
   * Cargar datos del dashboard
   */
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Cargar estadísticas generales
      const [statsData, reservasHoyData, servicios] = await Promise.all([
        adminService.getEstadisticas(),
        adminService.getReservasHoy(),
        adminService.getAllServicios(),
      ]);

      setStats(statsData);
      setReservasHoy(reservasHoyData);

      // Calcular servicios más populares
      const popularServices = calcularServiciosPopulares(servicios);
      setServiciosPopulares(popularServices);

      // Generar alertas
      const alertasGeneradas = generarAlertas(statsData, reservasHoyData);
      setAlertas(alertasGeneradas);

      console.log("✅ Dashboard cargado");
    } catch (err) {
      console.error("Error cargando dashboard:", err);
      setError("Error al cargar el dashboard. Por favor, actualiza la página.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Calcular servicios más populares
   */
  const calcularServiciosPopulares = (servicios) => {
    // Simulamos datos de popularidad
    // En un caso real, esto vendría del backend
    return servicios
      .slice(0, 4)
      .map((servicio, index) => ({
        ...servicio,
        totalReservas: Math.floor(Math.random() * 50) + 10,
      }))
      .sort((a, b) => b.totalReservas - a.totalReservas);
  };

  /**
   * Generar alertas basadas en los datos
   */
  const generarAlertas = (stats, reservasHoy) => {
    const alertas = [];

    // Alerta de reservas pendientes de confirmar
    if (stats.reservasPendientes > 5) {
      alertas.push({
        type: "warning",
        message: `${stats.reservasPendientes} reservas pendientes de confirmar`,
        action: "/admin/reservas",
      });
    }

    // Alerta de servicio sin franjas
    if (reservasHoy.length === 0) {
      alertas.push({
        type: "info",
        message: "No hay reservas para hoy",
        action: "/admin/reservas",
      });
    }

    // Alerta de clientes sin email verificado (simulado)
    alertas.push({
      type: "info",
      message: "3 clientes sin email verificado",
      action: "/admin/usuarios",
    });

    return alertas;
  };

  /**
   * Manejar acción de confirmar reserva
   */
  const handleConfirmarReserva = async (reservaId) => {
    try {
      await adminService.confirmarReserva(reservaId);
      // Recargar reservas del día
      const nuevasReservas = await adminService.getReservasHoy();
      setReservasHoy(nuevasReservas);
    } catch (err) {
      console.error("Error confirmando reserva:", err);
      setError("Error al confirmar la reserva");
    }
  };

  // Mostrar loading
  if (isLoading) {
    return <Loading fullScreen message="Cargando dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar activePage="dashboard" />

      {/* Contenido principal */}
      <div className="lg:pl-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard General
            </h1>
            <p className="text-gray-600 mt-1">
              Visión general del sistema • Última actualización: Hoy{" "}
              {format(new Date(), "HH:mm")}
            </p>
          </div>

          {/* Mensajes de error */}
          {error && (
            <InlineAlert type="error" message={error} className="mb-6" />
          )}

          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Reservas totales */}
            <StatCard
              title="RESERVAS TOTALES"
              value={stats.reservasTotales}
              trend="+10% vs mes anterior"
              icon={Calendar}
              color="green"
            />

            {/* Reservas hoy */}
            <StatCard
              title="RESERVAS HOY"
              value={stats.reservasHoy}
              subtext={`${stats.reservasPendientes} pendientes`}
              icon={Clock}
              color="blue"
            />

            {/* Ingresos del mes */}
            <StatCard
              title="INGRESOS MES"
              value={`${stats.ingresosMes.toFixed(2)}€`}
              trend="+5% vs mes anterior"
              icon={Euro}
              color="yellow"
            />

            {/* Clientes activos */}
            <StatCard
              title="CLIENTES ACTIVOS"
              value={stats.clientesActivos}
              subtext="12 nuevos este mes"
              icon={Users}
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna principal - Reservas de hoy */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Reservas de Hoy</h2>
                  <Link
                    to="/admin/reservas"
                    className="text-sm text-beauty-600 hover:text-beauty-700 flex items-center gap-1"
                  >
                    VER TODAS
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {reservasHoy.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No hay reservas programadas para hoy
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 text-sm font-medium text-gray-600">
                            Hora
                          </th>
                          <th className="text-left py-2 text-sm font-medium text-gray-600">
                            Cliente
                          </th>
                          <th className="text-left py-2 text-sm font-medium text-gray-600">
                            Servicio
                          </th>
                          <th className="text-left py-2 text-sm font-medium text-gray-600">
                            Estado
                          </th>
                          <th className="text-right py-2 text-sm font-medium text-gray-600">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservasHoy.slice(0, 5).map((reserva) => (
                          <tr
                            key={reserva.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="py-3">
                              <span className="font-medium">
                                {bookingService.formatearHora(
                                  reserva.horaReserva
                                )}
                              </span>
                            </td>
                            <td className="py-3">
                              {reserva.nombreCliente || "Cliente"}
                            </td>
                            <td className="py-3">
                              {reserva.nombreServicio || "Servicio"}
                            </td>
                            <td className="py-3">
                              <span
                                className={`badge ${bookingService.getEstadoColor(
                                  reserva.estado
                                )}`}
                              >
                                {bookingService.getEstadoEspanol(
                                  reserva.estado
                                )}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() =>
                                  navigate(`/admin/reservas/${reserva.id}`)
                                }
                                className="text-sm text-gray-600 hover:text-gray-900"
                              >
                                Ver
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Columna lateral */}
            <div className="space-y-6">
              {/* Accesos rápidos */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">
                  ⚡ Accesos Rápidos
                </h2>
                <div className="space-y-3">
                  <Link
                    to="/admin/reservas?action=new"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-beauty-600" />
                    <span className="font-medium">NUEVA RESERVA MANUAL</span>
                  </Link>

                  <Link
                    to="/admin/servicios?action=new"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-beauty-600" />
                    <span className="font-medium">NUEVO SERVICIO</span>
                  </Link>

                  <Link
                    to="/admin/franjas"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Calendar className="w-5 h-5 text-beauty-600" />
                    <span className="font-medium">GESTIONAR FRANJAS</span>
                  </Link>
                </div>
              </div>

              {/* Servicios más populares */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">🏆 Más Populares</h2>
                <div className="space-y-3">
                  {serviciosPopulares.map((servicio, index) => (
                    <div
                      key={servicio.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400">
                          {index + 1}.
                        </span>
                        <div>
                          <p className="font-medium text-sm">
                            {servicio.nombre}
                          </p>
                          <p className="text-xs text-gray-600">
                            {servicio.totalReservas} reservas
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {servicio.precio}€
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alertas */}
              {alertas.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    Alertas
                  </h2>
                  <div className="space-y-3">
                    {alertas.map((alerta, index) => (
                      <div
                        key={index}
                        className={`
                          p-3 rounded-lg text-sm flex items-start gap-2
                          ${
                            alerta.type === "warning"
                              ? "bg-yellow-50 text-yellow-800"
                              : "bg-blue-50 text-blue-800"
                          }
                        `}
                      >
                        <span className="flex-1">{alerta.message}</span>
                        {alerta.action && (
                          <Link
                            to={alerta.action}
                            className="text-xs underline"
                          >
                            Ver
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente de tarjeta de estadística
 */
const StatCard = ({ title, value, trend, subtext, icon: Icon, color }) => {
  const colors = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    yellow: "bg-yellow-100 text-yellow-600",
    purple: "bg-purple-100 text-purple-600",
  };

  const trendColors = {
    green: "text-green-600",
    blue: "text-blue-600",
    yellow: "text-yellow-600",
    purple: "text-purple-600",
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trendColors[color]}`}>
              <TrendingUp className="w-3 h-3 inline mr-1" />
              {trend}
            </p>
          )}
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

/**
 * Componente de sidebar para administración
 */
export const AdminSidebar = ({ activePage }) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart,
      path: "/admin",
    },
    {
      id: "reservas",
      label: "Reservas",
      icon: Calendar,
      path: "/admin/reservas",
    },
    {
      id: "servicios",
      label: "Servicios",
      icon: FileText,
      path: "/admin/servicios",
    },
    {
      id: "franjas",
      label: "Franjas Horarias",
      icon: Clock,
      path: "/admin/franjas",
    },
    {
      id: "usuarios",
      label: "Usuarios",
      icon: Users,
      path: "/admin/usuarios",
    },
    {
      id: "reportes",
      label: "Reportes",
      icon: Activity,
      path: "/admin/reportes",
    },
  ];

  return (
    <aside className="fixed left-0 top-16 w-64 h-full bg-gray-900 text-white hidden lg:block">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6">PANEL ADMIN</h2>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-colors text-left
                  ${
                    isActive
                      ? "bg-beauty-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Dashboard;
