import { apiGet, apiPost, apiPut, apiDelete } from "./api";
import authService from "./authService";

/**
 * bookingService - Servicio para gestionar reservas y servicios
 *
 * Maneja:
 * - Consulta de servicios disponibles
 * - Franjas horarias disponibles
 * - Creación de reservas
 * - Consulta y cancelación de reservas del usuario
 */

class BookingService {
  // ========== SERVICIOS ==========

  /**
   * Obtiene todos los servicios activos (endpoint público)
   * @returns {Promise<Array>} Lista de servicios
   */
  async getServicios() {
    try {
      const response = await apiGet("/servicios");
      console.log(`📋 Servicios obtenidos: ${response.data.length} servicios`);
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo servicios:", error);
      throw error;
    }
  }

  /**
   * Obtiene un servicio por su ID
   * @param {number} id - ID del servicio
   * @returns {Promise<Object>} Datos del servicio
   */
  async getServicioById(id) {
    try {
      const response = await apiGet(`/servicios/${id}`);
      console.log(`📋 Servicio obtenido:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error obteniendo servicio ${id}:`, error);
      throw error;
    }
  }

  // ========== FRANJAS HORARIAS ==========

  /**
   * Obtiene las franjas horarias disponibles para un servicio en una fecha
   * @param {number} servicioId - ID del servicio
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @returns {Promise<Array>} Lista de franjas horarias disponibles
   */
  async getFranjasDisponibles(servicioId, fecha) {
    try {
      // Validación de formato de fecha
      if (!fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
        throw new Error("Formato de fecha inválido. Use YYYY-MM-DD");
      }

      const response = await apiGet("/franjas/disponibles", {
        params: { servicioId, fecha },
      });

      console.log(
        `📅 Franjas disponibles para servicio ${servicioId} en ${fecha}:`,
        response.data.length
      );

      // Procesamos las franjas para añadir información útil
      const franjasConInfo = response.data.map((franja) => ({
        ...franja,
        // Añadimos propiedades útiles para el frontend
        horaFormateada: this.formatearHora(franja.horaInicio),
        disponible: franja.plazasDisponibles > 0,
        pocasPlazas: franja.plazasDisponibles === 1,
        completo: franja.plazasDisponibles === 0,
      }));

      return franjasConInfo;
    } catch (error) {
      console.error("❌ Error obteniendo franjas:", error);
      throw error;
    }
  }

  // ========== RESERVAS ==========

  /**
   * Crea una nueva reserva
   * @param {Object} reservaData - Datos de la reserva {franjaHorariaId, notas}
   * @returns {Promise<Object>} Reserva creada
   */
  async crearReserva(reservaData) {
    try {
      // Verificar que el usuario esté autenticado
      const user = authService.getUser();
      if (!user) {
        throw new Error("Debes iniciar sesión para hacer una reserva");
      }

      // El backend obtiene el usuario del TOKEN JWT
      // Solo enviamos franjaHorariaId y notas
      const dataToSend = {
        franjaId: reservaData.franjaHorariaId,
        notas: reservaData.notas || "", // Notas opcionales
      };

      console.log("📦 Datos enviados al backend:", dataToSend);

      const response = await apiPost("/reservas", dataToSend);
      console.log("✅ Reserva creada:", response.data);

      return response.data;
    } catch (error) {
      console.error("❌ Error creando reserva:", error);
      console.error("❌ Detalles del error:", error.response?.data);
      throw error;
    }
  }

  /**
   * Obtiene las reservas del usuario actual
   * @returns {Promise<Array>} Lista de reservas del usuario
   */
  async getMisReservas() {
    try {
      const user = authService.getUser();
      if (!user) {
        throw new Error("Debes iniciar sesión para ver tus reservas");
      }

      const response = await apiGet("/reservas/mis");
      console.log(`📋 Mis reservas: ${response.data.length} reservas`);

      // Ordenamos por fecha más reciente primero
      const reservasOrdenadas = response.data.sort(
        (a, b) => new Date(b.creadoEn) - new Date(a.creadoEn)
      );

      return reservasOrdenadas;
    } catch (error) {
      console.error("❌ Error obteniendo mis reservas:", error);
      throw error;
    }
  }

  /**
   * Cancela una reserva
   * @param {number} reservaId - ID de la reserva a cancelar
   * @returns {Promise<Object>} Respuesta de cancelación
   */
  async cancelarReserva(reservaId) {
    try {
      const response = await apiDelete(`/reservas/${reservaId}`);
      console.log("✅ Reserva cancelada:", response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error cancelando reserva ${reservaId}:`, error);
      throw error;
    }
  }

  // ========== UTILIDADES ==========

  /**
   * Formatea una hora de HH:MM:SS a formato legible
   * @param {string} hora - Hora en formato HH:MM:SS
   * @returns {string} Hora formateada
   */
  formatearHora(hora) {
    if (!hora) return "";
    // Convertir "10:00:00" a "10:00"
    return hora.substring(0, 5);
  }

  /**
   * Calcula la hora de fin basándose en la hora de inicio y duración
   * @param {string} horaInicio - Hora de inicio (HH:MM:SS)
   * @param {number} duracionMinutos - Duración en minutos
   * @returns {string} Hora de fin formateada
   */
  calcularHoraFin(horaInicio, duracionMinutos) {
    // Parseamos la hora
    const [horas, minutos] = horaInicio.split(":").map(Number);

    // Creamos una fecha temporal
    const fecha = new Date();
    fecha.setHours(horas, minutos, 0);

    // Añadimos los minutos
    fecha.setMinutes(fecha.getMinutes() + duracionMinutos);

    // Formateamos de vuelta
    const horasFin = fecha.getHours().toString().padStart(2, "0");
    const minutosFin = fecha.getMinutes().toString().padStart(2, "0");

    return `${horasFin}:${minutosFin}`;
  }

  /**
   * Agrupa las franjas horarias por periodo (mañana/tarde)
   * @param {Array} franjas - Lista de franjas horarias
   * @returns {Object} Franjas agrupadas por periodo
   */
  agruparFranjasPorPeriodo(franjas) {
    const grupos = {
      manana: [], // 07:00 - 13:59
      tarde: [], // 14:00 - 22:00
    };

    franjas.forEach((franja) => {
      const hora = parseInt(franja.horaInicio.split(":")[0]);
      if (hora < 14) {
        grupos.manana.push(franja);
      } else {
        grupos.tarde.push(franja);
      }
    });

    return grupos;
  }

  /**
   * Valida si una fecha es válida para reservar
   * @param {Date} fecha - Fecha a validar
   * @returns {boolean} true si es válida
   */
  esFechaValida(fecha) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // No permitir fechas pasadas
    if (fecha < hoy) return false;

    // No permitir reservas con más de 30 días de antelación
    const maxFecha = new Date();
    maxFecha.setDate(maxFecha.getDate() + 30);
    if (fecha > maxFecha) return false;

    return true;
  }

  /**
   * Obtiene el estado de una reserva
   * @param {string} estado
   * @returns {string}
   */
  getEstadoEspanol(estado) {
    const estados = {
      PENDIENTE: "Pendiente",
      CONFIRMADA: "Confirmada",
      COMPLETADA: "Completada",
      CANCELADA: "Cancelada",
    };
    return estados[estado] || estado;
  }

  /**
   * Obtiene el color del badge según el estado
   * @param {string} estado - Estado de la reserva
   * @returns {string} Clase CSS para el badge
   */
  getEstadoColor(estado) {
    const colores = {
      PENDIENTE: "badge-warning",
      CONFIRMADA: "badge-success",
      COMPLETADA: "badge-info",
      CANCELADA: "badge-danger",
    };
    return colores[estado] || "badge";
  }
}

// Exportamos una instancia única
export default new BookingService();
