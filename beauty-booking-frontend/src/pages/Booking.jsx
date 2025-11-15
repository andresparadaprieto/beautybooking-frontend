import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  Users,
} from "lucide-react";
import {
  format,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  isToday,
  getDay,
} from "date-fns";
import { es } from "date-fns/locale";
import bookingService from "../services/bookingService";
import { useAuth } from "../context/AuthContext";
import { useLoading, useError, useProtectedRoute } from "../hooks";
import Loading from "../components/common/Loading";
import { InlineAlert } from "../components/common/Alert";

/**
 * Booking Page
 *
 * Flujo de reserva paso a paso:
 * 1. Muestra información del servicio seleccionado
 * 2. Calendario para seleccionar fecha
 * 3. Franjas horarias disponibles para esa fecha
 * 4. Botón para continuar con la confirmación
 */

const Booking = () => {
  const { servicioId } = useParams();
  const navigate = useNavigate();
  const { user } = useProtectedRoute(); // Requiere autenticación
  const { isLoading, setIsLoading, executeWithLoading } = useLoading(true);
  const { error, setError, clearError } = useError();

  // Estados principales
  const [servicio, setServicio] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [franjas, setFranjas] = useState([]);
  const [selectedFranja, setSelectedFranja] = useState(null);
  const [loadingFranjas, setLoadingFranjas] = useState(false);

  // Estado del calendario
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [diasConDisponibilidad, setDiasConDisponibilidad] = useState(new Set());

  /**
   * Cargar información del servicio al montar
   */
  useEffect(() => {
    loadServicio();
  }, [servicioId]);

  /**
   * Cargar franjas cuando se selecciona una fecha
   */
  useEffect(() => {
    if (selectedDate) {
      loadFranjas(selectedDate);
    }
  }, [selectedDate]);

  /**
   * Cargar información del servicio
   */
  const loadServicio = async () => {
    try {
      const data = await executeWithLoading(async () => {
        return await bookingService.getServicioById(servicioId);
      });
      setServicio(data);
      console.log("✅ Servicio cargado:", data.nombre);

      // Cargar días con disponibilidad para el mes actual
      await loadDiasDisponibles(currentMonth);
    } catch (err) {
      console.error("Error cargando servicio:", err);
      setError("Error al cargar el servicio. Por favor, intenta de nuevo.");
    }
  };

  /**
   * Cargar días con franjas disponibles para un mes
   * Esto es para marcar en verde los días con disponibilidad
   */
  const loadDiasDisponibles = async (month) => {
    try {
      const dias = new Set();

      // Simulacion disponibilidad en días laborables futuros
      const start = startOfMonth(month);
      const end = endOfMonth(month);
      const allDays = eachDayOfInterval({ start, end });

      allDays.forEach((day) => {
        const dayOfWeek = getDay(day);
        // Lunes a Sábado (1-6), no domingos (0)
        if (dayOfWeek !== 0 && !isBefore(day, new Date())) {
          dias.add(format(day, "yyyy-MM-dd"));
        }
      });

      setDiasConDisponibilidad(dias);
    } catch (err) {
      console.error("Error cargando días disponibles:", err);
    }
  };

  /**
   * Cargar franjas horarias para una fecha específica
   */
  const loadFranjas = async (date) => {
    try {
      setLoadingFranjas(true);
      clearError();

      const fechaFormateada = format(date, "yyyy-MM-dd");
      const data = await bookingService.getFranjasDisponibles(
        servicioId,
        fechaFormateada
      );

      // Agrupar franjas por periodo (mañana/tarde)
      const franjasAgrupadas = bookingService.agruparFranjasPorPeriodo(data);
      setFranjas(franjasAgrupadas);

      // Reset selección previa
      setSelectedFranja(null);

      if (data.length === 0) {
        setError(
          "No hay horarios disponibles para esta fecha. Por favor, selecciona otro día."
        );
      }
    } catch (err) {
      console.error("Error cargando franjas:", err);
      setError("Error al cargar los horarios disponibles.");
      setFranjas({ manana: [], tarde: [] });
    } finally {
      setLoadingFranjas(false);
    }
  };

  /**
   * Manejar selección de fecha
   */
  const handleDateSelect = (date) => {
    // Validar que la fecha es válida
    if (!bookingService.esFechaValida(date)) {
      setError("Esta fecha no está disponible para reservas");
      return;
    }

    setSelectedDate(date);
    clearError();
  };

  /**
   * Manejar selección de franja horaria
   */
  const handleFranjaSelect = (franja) => {
    if (franja.plazasDisponibles > 0) {
      setSelectedFranja(franja);
      clearError();
    }
  };

  /**
   * Continuar con la reserva
   */
  const handleContinuar = () => {
    if (!selectedFranja) {
      setError("Por favor, selecciona un horario");
      return;
    }

    // Navegar a la página de confirmación con los datos
    navigate("/booking/confirm", {
      state: {
        servicio,
        fecha: format(selectedDate, "yyyy-MM-dd"),
        franja: selectedFranja,
      },
    });
  };

  /**
   * Cambiar mes del calendario
   */
  const changeMonth = (increment) => {
    const newMonth =
      increment > 0
        ? addDays(endOfMonth(currentMonth), 1)
        : addDays(startOfMonth(currentMonth), -1);

    setCurrentMonth(newMonth);
    loadDiasDisponibles(newMonth);
  };

  // Loading inicial
  if (isLoading) {
    return (
      <Loading fullScreen message="Cargando información del servicio..." />
    );
  }

  // Si no se encuentra el servicio
  if (!servicio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Servicio no encontrado</h2>
          <button
            onClick={() => navigate("/servicios")}
            className="btn-primary"
          >
            Volver a servicios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Botón volver */}
        <button
          onClick={() => navigate("/servicios")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al catálogo
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Info del servicio y calendario */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del servicio */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {servicio.nombre}
              </h1>
              <p className="text-gray-600 mb-4">{servicio.descripcion}</p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{servicio.duracionMinutos} minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-beauty-600">
                    {servicio.precio} €
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>Aforo máximo: {servicio.aforoMaximo} persona(s)</span>
                </div>
              </div>
            </div>

            {/* Calendario */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Selecciona una fecha
              </h2>

              <CalendarComponent
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                diasConDisponibilidad={diasConDisponibilidad}
                onDateSelect={handleDateSelect}
                onMonthChange={changeMonth}
              />
            </div>
          </div>

          {/* Columna derecha - Horarios y resumen */}
          <div className="space-y-6">
            {/* Horarios disponibles */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">
                Horarios disponibles
              </h2>

              {!selectedDate ? (
                <p className="text-gray-500 text-center py-8">
                  Selecciona una fecha para ver los horarios disponibles
                </p>
              ) : loadingFranjas ? (
                <div className="py-8">
                  <Loading message="Cargando horarios..." />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Fecha seleccionada */}
                  <div className="text-sm text-gray-600 pb-2 border-b">
                    {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", {
                      locale: es,
                    })}
                  </div>

                  {/* Mensajes de error */}
                  {error && <InlineAlert type="error" message={error} />}

                  {/* Franjas de la mañana */}
                  {franjas.manana && franjas.manana.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        🌅 Mañana
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {franjas.manana.map((franja) => (
                          <TimeSlot
                            key={franja.id}
                            franja={franja}
                            servicio={servicio}
                            selected={selectedFranja?.id === franja.id}
                            onSelect={() => handleFranjaSelect(franja)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Franjas de la tarde */}
                  {franjas.tarde && franjas.tarde.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        🌆 Tarde
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {franjas.tarde.map((franja) => (
                          <TimeSlot
                            key={franja.id}
                            franja={franja}
                            servicio={servicio}
                            selected={selectedFranja?.id === franja.id}
                            onSelect={() => handleFranjaSelect(franja)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Botón continuar */}
            {selectedFranja && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <button
                  onClick={handleContinuar}
                  className="btn-primary w-full text-lg py-3"
                >
                  CONTINUAR CON HORARIO SELECCIONADO →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente del calendario
 */
const CalendarComponent = ({
  currentMonth,
  selectedDate,
  diasConDisponibilidad,
  onDateSelect,
  onMonthChange,
}) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Obtener el primer día de la semana (padding)
  const startPadding = getDay(monthStart);
  const paddingDays = Array(startPadding).fill(null);

  const today = new Date();

  return (
    <div>
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onMonthChange(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg"
          disabled={isSameDay(monthStart, startOfMonth(today))}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h3>

        <button
          onClick={() => onMonthChange(1)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 mb-2">
        {["L", "M", "X", "J", "V", "S", "D"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-1">
        {/* Padding inicial */}
        {paddingDays.map((_, index) => (
          <div key={`pad-${index}`} />
        ))}

        {/* Días reales */}
        {monthDays.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isSelectable = !isBefore(day, today) && getDay(day) !== 0;
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const hasAvailability = diasConDisponibilidad.has(dateStr);
          const isCurrentDay = isToday(day);

          return (
            <button
              key={dateStr}
              onClick={() => isSelectable && onDateSelect(day)}
              disabled={!isSelectable}
              className={`
                p-2 rounded-lg text-sm font-medium transition-all
                ${
                  isSelected
                    ? "bg-beauty-500 text-white"
                    : isSelectable
                    ? hasAvailability
                      ? "bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer"
                      : "bg-white hover:bg-gray-50 cursor-pointer"
                    : "text-gray-300 cursor-not-allowed"
                }
                ${isCurrentDay && !isSelected ? "ring-2 ring-beauty-300" : ""}
              `}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <span>Sin citas</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-beauty-500 rounded"></div>
          <span>Seleccionado</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente de slot de tiempo
 */
const TimeSlot = ({ franja, servicio, selected, onSelect }) => {
  const horaInicio = bookingService.formatearHora(franja.horaInicio);
  const horaFin = bookingService.calcularHoraFin(
    franja.horaInicio,
    servicio.duracionMinutos
  );

  const isAvailable = franja.plazasDisponibles > 0;
  const isLimited = franja.plazasDisponibles === 1;
  const isFull = franja.plazasDisponibles === 0;

  return (
    <button
      onClick={onSelect}
      disabled={isFull}
      className={`
        p-3 rounded-lg text-sm font-medium transition-all
        ${
          selected
            ? "bg-beauty-500 text-white border-2 border-beauty-600"
            : isFull
            ? "bg-red-50 text-red-400 cursor-not-allowed border border-red-200"
            : isLimited
            ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-300"
            : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-300"
        }
      `}
    >
      <div className="text-xs">{horaInicio}</div>
      {servicio.aforoMaximo > 1 && (
        <div className="text-xs mt-1 opacity-75">
          {franja.plazasDisponibles} plaza
          {franja.plazasDisponibles !== 1 && "s"}
        </div>
      )}
    </button>
  );
};

export default Booking;
