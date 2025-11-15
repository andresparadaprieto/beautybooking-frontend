import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Calendar,
  Euro,
  Users,
  FileText,
  Download,
  BarChart3,
  PieChart,
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import adminService from "../../services/adminService";
import { useProtectedRoute, useLoading, useError } from "../../hooks";
import Loading from "../../components/common/Loading";
import { InlineAlert } from "../../components/common/Alert";
import { AdminSidebar } from "./Dashboard";

/**
 * Reports
 *
 * Página de reportes con:
 * - Estadísticas generales
 * - Resumen de ingresos
 * - Servicios más populares
 * - Tendencias de reservas
 */

const Reports = () => {
  const { user } = useProtectedRoute("ADMIN");
  const { isLoading, setIsLoading } = useLoading(true);
  const { error, setError } = useError();

  // Estados
  const [reservas, setReservas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [stats, setStats] = useState({
    totalReservas: 0,
    reservasMes: 0,
    ingresosTotales: 0,
    ingresosMes: 0,
    totalClientes: 0,
    servicioMasPopular: null,
  });

  /**
   * Cargar datos al montar
   */
  useEffect(() => {
    loadReportData();
  }, []);

  /**
   * Cargar datos para reportes
   */
  const loadReportData = async () => {
    try {
      setIsLoading(true);

      // Cargar datos
      const [reservasData, serviciosData] = await Promise.all([
        adminService.getAllReservas(),
        adminService.getAllServicios(),
      ]);

      setReservas(reservasData);
      setServicios(serviciosData);

      // Calcular estadísticas
      calcularEstadisticas(reservasData, serviciosData);
    } catch (err) {
      console.error("Error cargando datos de reportes:", err);
      setError("Error al cargar los datos de reportes");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Calcular estadísticas
   */
  const calcularEstadisticas = (reservasData, serviciosData) => {
    // Fecha actual
    const hoy = new Date();
    const inicioMes = startOfMonth(hoy);
    const finMes = endOfMonth(hoy);

    // Reservas del mes actual
    const reservasMes = reservasData.filter((r) => {
      const fechaReserva = new Date(r.fecha);
      return fechaReserva >= inicioMes && fechaReserva <= finMes;
    });

    // Calcular ingresos totales (solo reservas completadas)
    const reservasCompletadas = reservasData.filter(
      (r) => r.estado === "COMPLETADA"
    );
    const ingresosTotales = reservasCompletadas.reduce(
      (sum, r) => sum + (r.precioFinal || 0),
      0
    );

    // Calcular ingresos del mes
    const reservasMesCompletadas = reservasMes.filter(
      (r) => r.estado === "COMPLETADA"
    );
    const ingresosMes = reservasMesCompletadas.reduce(
      (sum, r) => sum + (r.precioFinal || 0),
      0
    );

    // Clientes únicos
    const clientesUnicos = new Set(reservasData.map((r) => r.usuarioId)).size;

    // Servicio más popular
    const conteoServicios = {};
    reservasData.forEach((r) => {
      conteoServicios[r.servicioId] = (conteoServicios[r.servicioId] || 0) + 1;
    });

    const servicioMasPopularId = Object.entries(conteoServicios).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0];

    const servicioMasPopular = serviciosData.find(
      (s) => s.id === parseInt(servicioMasPopularId)
    );

    setStats({
      totalReservas: reservasData.length,
      reservasMes: reservasMes.length,
      ingresosTotales,
      ingresosMes,
      totalClientes: clientesUnicos,
      servicioMasPopular,
    });
  };

  /**
   * Calcular servicios populares
   */
  const getServiciosPopulares = () => {
    const conteoServicios = {};

    reservas.forEach((r) => {
      if (!conteoServicios[r.servicioId]) {
        conteoServicios[r.servicioId] = {
          servicioId: r.servicioId,
          nombre: r.servicioNombre,
          cantidad: 0,
          ingresos: 0,
        };
      }
      conteoServicios[r.servicioId].cantidad++;
      if (r.estado === "COMPLETADA") {
        conteoServicios[r.servicioId].ingresos += r.precioFinal || 0;
      }
    });

    return Object.values(conteoServicios)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  };

  /**
   * Calcular reservas por estado
   */
  const getReservasPorEstado = () => {
    const estados = {
      PENDIENTE: 0,
      CONFIRMADA: 0,
      COMPLETADA: 0,
      CANCELADA: 0,
    };

    reservas.forEach((r) => {
      estados[r.estado] = (estados[r.estado] || 0) + 1;
    });

    return estados;
  };

  // Mostrar loading
  if (isLoading) {
    return <Loading fullScreen message="Cargando reportes..." />;
  }

  const serviciosPopulares = getServiciosPopulares();
  const reservasPorEstado = getReservasPorEstado();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar activePage="reportes" />

      {/* Contenido principal */}
      <div className="lg:pl-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Reportes y Estadísticas
              </h1>
              <p className="text-gray-600 mt-1">
                Análisis de rendimiento del negocio
              </p>
            </div>
          </div>

          {/* Mensajes de error */}
          {error && (
            <InlineAlert type="error" message={error} className="mb-6" />
          )}

          {/* Tarjetas de estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Reservas Totales"
              value={stats.totalReservas}
              subtext={`${stats.reservasMes} este mes`}
              icon={Calendar}
              color="blue"
            />
            <StatCard
              title="Ingresos Totales"
              value={`€${stats.ingresosTotales.toFixed(2)}`}
              subtext={`€${stats.ingresosMes.toFixed(2)} este mes`}
              icon={Euro}
              color="green"
            />
            <StatCard
              title="Clientes Únicos"
              value={stats.totalClientes}
              icon={Users}
              color="purple"
            />
            <StatCard
              title="Servicio Top"
              value={stats.servicioMasPopular?.nombre || "N/A"}
              icon={TrendingUp}
              color="yellow"
            />
          </div>

          {/* Grid de reportes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Servicios más populares */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-beauty-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-beauty-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Top 5 Servicios
                </h2>
              </div>

              <div className="space-y-4">
                {serviciosPopulares.map((servicio, index) => (
                  <div
                    key={servicio.servicioId}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-400">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {servicio.nombre}
                        </p>
                        <p className="text-sm text-gray-600">
                          {servicio.cantidad} reservas
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        €{servicio.ingresos.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">Ingresos</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reservas por estado */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <PieChart className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Reservas por Estado
                </h2>
              </div>

              <div className="space-y-4">
                <EstadoBar
                  label="Pendientes"
                  value={reservasPorEstado.PENDIENTE}
                  total={stats.totalReservas}
                  color="yellow"
                />
                <EstadoBar
                  label="Confirmadas"
                  value={reservasPorEstado.CONFIRMADA}
                  total={stats.totalReservas}
                  color="blue"
                />
                <EstadoBar
                  label="Completadas"
                  value={reservasPorEstado.COMPLETADA}
                  total={stats.totalReservas}
                  color="green"
                />
                <EstadoBar
                  label="Canceladas"
                  value={reservasPorEstado.CANCELADA}
                  total={stats.totalReservas}
                  color="red"
                />
              </div>
            </div>

            {/* Resumen mensual */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Resumen del Mes
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Total Reservas</span>
                  <span className="font-semibold text-gray-900">
                    {stats.reservasMes}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Ingresos</span>
                  <span className="font-semibold text-green-600">
                    €{stats.ingresosMes.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Promedio por reserva</span>
                  <span className="font-semibold text-gray-900">
                    €
                    {stats.reservasMes > 0
                      ? (stats.ingresosMes / stats.reservasMes).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Mes</span>
                  <span className="font-semibold text-gray-900">
                    {format(new Date(), "MMMM yyyy", { locale: es })}
                  </span>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-gradient-to-br from-beauty-500 to-beauty-600 rounded-lg shadow-md p-6 text-white">
              <h2 className="text-xl font-semibold mb-4">💡 Insights</h2>
              <div className="space-y-3 text-sm">
                <p>
                  • Tu servicio más popular es{" "}
                  <span className="font-semibold">
                    {stats.servicioMasPopular?.nombre || "N/A"}
                  </span>
                </p>
                <p>
                  • Tienes{" "}
                  <span className="font-semibold">{stats.totalClientes}</span>{" "}
                  clientes únicos
                </p>
                <p>
                  • Has completado{" "}
                  <span className="font-semibold">
                    {reservasPorEstado.COMPLETADA}
                  </span>{" "}
                  reservas
                </p>
                <p>
                  • Tus ingresos totales son de{" "}
                  <span className="font-semibold">
                    €{stats.ingresosTotales.toFixed(2)}
                  </span>
                </p>
              </div>
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
const StatCard = ({ title, value, subtext, icon: Icon, color }) => {
  const colors = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    yellow: "bg-yellow-100 text-yellow-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
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
 * Barra de estado con porcentaje
 */
const EstadoBar = ({ label, value, total, color }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  const colors = {
    yellow: "bg-yellow-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-600">
          {value} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colors[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default Reports;
