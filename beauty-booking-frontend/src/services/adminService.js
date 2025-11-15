import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "./api";

/**
 * adminService - Servicio para funciones administrativas
 *
 * Todos estos endpoints requieren rol ADMIN
 * El backend verificará el token y rechazará si no es admin
 *
 * Maneja:
 * - CRUD completo de servicios
 * - Gestión de franjas horarias
 * - Gestión de todas las reservas
 * - Estadísticas y reportes
 */

class AdminService {
  // ========== GESTIÓN DE SERVICIOS ==========

  /**
   * Obtiene TODOS los servicios (activos e inactivos)
   * @returns {Promise<Array>} Lista completa de servicios
   */
  async getAllServicios() {
    try {
      const response = await apiGet("/admin/servicios");
      console.log(`👑 Admin: ${response.data.length} servicios totales`);
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo servicios (admin):", error);
      throw error;
    }
  }

  /**
   * Crea un nuevo servicio
   * @param {Object} servicioData - Datos del servicio
   * @returns {Promise<Object>} Servicio creado
   */
  async crearServicio(servicioData) {
    try {
      // Validaciones antes de enviar
      if (
        !servicioData.nombre ||
        !servicioData.duracionMinutos ||
        !servicioData.precio
      ) {
        throw new Error("Nombre, duración y precio son obligatorios");
      }

      // Preparamos los datos con valores por defecto
      const dataToSend = {
        nombre: servicioData.nombre,
        descripcion: servicioData.descripcion || "",
        duracionMinutos: parseInt(servicioData.duracionMinutos),
        precio: parseFloat(servicioData.precio),
        aforoMaximo: parseInt(servicioData.aforoMaximo) || 1,
        activo: servicioData.activo !== false, // Por defecto activo
      };

      const response = await apiPost("/admin/servicios", dataToSend);
      console.log("✅ Servicio creado:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error creando servicio:", error);
      throw error;
    }
  }

  /**
   * Actualiza un servicio existente
   * @param {number} id - ID del servicio
   * @param {Object} servicioData - Datos actualizados
   * @returns {Promise<Object>} Servicio actualizado
   */
  async actualizarServicio(id, servicioData) {
    try {
      const response = await apiPut(`/admin/servicios/${id}`, servicioData);
      console.log(`✅ Servicio ${id} actualizado:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error actualizando servicio ${id}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un servicio (eliminación lógica o física según backend)
   * @param {number} id - ID del servicio
   * @returns {Promise<void>}
   */
  async eliminarServicio(id) {
    try {
      await apiDelete(`/admin/servicios/${id}`);
      console.log(`✅ Servicio ${id} eliminado`);
    } catch (error) {
      console.error(`❌ Error eliminando servicio ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activa o desactiva un servicio
   * @param {number} id - ID del servicio
   * @param {boolean} activo - Estado deseado
   * @returns {Promise<Object>} Servicio actualizado
   */
  async toggleServicioActivo(id, activo) {
    try {
      const response = await apiPatch(`/admin/servicios/${id}/activo`, {
        activo,
      });
      console.log(`✅ Servicio ${id} ${activo ? "activado" : "desactivado"}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error cambiando estado del servicio ${id}:`, error);
      throw error;
    }
  }

  // ========== GESTIÓN DE FRANJAS HORARIAS ==========

  /**
   * Crea franjas horarias para un servicio
   * @param {Object} franjaData - Datos de la franja
   * @returns {Promise<Object>} Franja creada
   */
  async crearFranjaHoraria(franjaData) {
    try {
      // Validaciones
      if (
        !franjaData.servicioId ||
        !franjaData.fecha ||
        !franjaData.horaInicio
      ) {
        throw new Error("Servicio, fecha y hora son obligatorios");
      }

      // Validar formato de hora (HH:MM:SS)
      const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
      if (!horaRegex.test(franjaData.horaInicio)) {
        throw new Error("Formato de hora inválido. Use HH:MM:SS");
      }

      // Validar horario permitido (07:00 - 22:00)
      const hora = parseInt(franjaData.horaInicio.split(":")[0]);
      if (hora < 7 || hora >= 22) {
        throw new Error("El horario debe estar entre 07:00 y 22:00");
      }

      const response = await apiPost("/admin/franjas", franjaData);
      console.log("✅ Franja horaria creada:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error creando franja:", error);
      throw error;
    }
  }

  /**
   * Genera múltiples franjas horarias automáticamente
   * @param {Object} config - Configuración para generar franjas
   * @returns {Promise<Array>} Franjas creadas
   */
  async generarFranjasMultiples(config) {
    try {
      const {
        servicioId,
        fechaInicio,
        fechaFin,
        horaInicio,
        horaFin,
        intervaloMinutos,
        diasSemana = [1, 2, 3, 4, 5], // Lun-Vie por defecto
        plazasDisponibles,
      } = config;

      // Esta función generaría múltiples franjas
      // El backend debería tener un endpoint para esto
      // Por ahora, lo simulamos con múltiples llamadas

      const franjas = [];
      const fechaActual = new Date(fechaInicio);
      const fechaLimite = new Date(fechaFin);

      while (fechaActual <= fechaLimite) {
        // Verificar si es un día válido
        if (diasSemana.includes(fechaActual.getDay())) {
          // Generar franjas para este día
          let horaActual = horaInicio;
          while (horaActual < horaFin) {
            const franja = await this.crearFranjaHoraria({
              servicioId,
              fecha: fechaActual.toISOString().split("T")[0],
              horaInicio: `${horaActual}:00`,
              plazasDisponibles,
            });
            franjas.push(franja);

            // Siguiente franja
            const [h, m] = horaActual.split(":").map(Number);
            const nuevosMinutos = m + intervaloMinutos;
            horaActual = `${h + Math.floor(nuevosMinutos / 60)}:${(
              nuevosMinutos % 60
            )
              .toString()
              .padStart(2, "0")}`;
          }
        }

        // Siguiente día
        fechaActual.setDate(fechaActual.getDate() + 1);
      }

      console.log(`✅ ${franjas.length} franjas creadas`);
      return franjas;
    } catch (error) {
      console.error("❌ Error generando franjas múltiples:", error);
      throw error;
    }
  }

  // ========== GESTIÓN DE RESERVAS ==========

  /**
   * Obtiene TODAS las reservas del sistema
   * @returns {Promise<Array>} Lista completa de reservas
   */
  async getAllReservas() {
    try {
      const response = await apiGet("/admin/reservas");
      console.log(`👑 Admin: ${response.data.length} reservas totales`);
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo todas las reservas:", error);
      throw error;
    }
  }

  /**
   * Obtiene las reservas de una fecha específica
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @returns {Promise<Array>} Reservas del día
   */
  async getReservasPorFecha(fecha) {
    try {
      // El backend no tiene endpoint por fecha, obtenemos todas y filtramos
      const response = await apiGet("/admin/reservas");

      // Filtrar por fecha en el frontend
      const reservasFecha = response.data.filter((r) => {
        // La fecha puede venir como string "2025-10-21" o array [2025,10,21]
        if (Array.isArray(r.fecha)) {
          const [year, month, day] = r.fecha;
          const fechaStr = `${year}-${String(month).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`;
          return fechaStr === fecha;
        }
        return r.fecha === fecha;
      });

      console.log(`📅 ${reservasFecha.length} reservas para ${fecha}`);
      return reservasFecha;
    } catch (error) {
      console.error(`❌ Error obteniendo reservas de ${fecha}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene las reservas de hoy
   * @returns {Promise<Array>} Reservas de hoy
   */
  async getReservasHoy() {
    try {
      const response = await apiGet("/admin/reservas/hoy");
      console.log(`📅 ${response.data.length} reservas de hoy`);
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo reservas de hoy:", error);
      throw error;
    }
  }

  /**
   * Confirma una reserva pendiente
   * @param {number} reservaId - ID de la reserva
   * @returns {Promise<Object>} Reserva confirmada
   */
  async confirmarReserva(reservaId) {
    try {
      const response = await apiPatch(`/admin/reservas/${reservaId}/confirmar`);
      console.log(`✅ Reserva ${reservaId} confirmada`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error confirmando reserva ${reservaId}:`, error);
      throw error;
    }
  }

  /**
   * Marca una reserva como completada
   * @param {number} reservaId - ID de la reserva
   * @returns {Promise<Object>} Reserva completada
   */
  async completarReserva(reservaId) {
    try {
      const response = await apiPatch(`/admin/reservas/${reservaId}/completar`);
      console.log(`✅ Reserva ${reservaId} completada`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error completando reserva ${reservaId}:`, error);
      throw error;
    }
  }

  /**
   * Cancela una reserva (admin puede cancelar cualquier reserva)
   * @param {number} reservaId - ID de la reserva
   * @returns {Promise<Object>} Reserva cancelada
   */
  async cancelarReservaAdmin(reservaId) {
    try {
      const response = await apiDelete(`/admin/reservas/${reservaId}/cancelar`);
      console.log(`✅ Reserva ${reservaId} cancelada por admin`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error cancelando reserva ${reservaId}:`, error);
      throw error;
    }
  }

  /**
   * Crea una reserva manual desde el panel de administración
   * @param {Object} reservaData - Datos de la reserva
   * @param {number} reservaData.franjaId - ID de la franja horaria
   * @param {string} reservaData.usuarioEmail - Email del cliente
   * @param {string} reservaData.notas - Notas adicionales (opcional)
   * @returns {Promise<Object>} Reserva creada
   */
  async crearReservaManual(reservaData) {
    try {
      // Validaciones frontend
      if (!reservaData.franjaId) {
        throw new Error("La franja horaria es obligatoria");
      }

      if (!reservaData.usuarioEmail) {
        throw new Error("El email del cliente es obligatorio");
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(reservaData.usuarioEmail)) {
        throw new Error("El formato del email no es válido");
      }

      const response = await apiPost("/admin/reservas/manual", reservaData);
      console.log("✅ Reserva manual creada:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error creando reserva manual:", error);
      throw error;
    }
  }

  /**
   * Edita una reserva existente (admin)
   * @param {number} reservaId - ID de la reserva a editar
   * @param {Object} reservaData - Datos actualizados de la reserva
   * @param {number} reservaData.franjaId - ID de la nueva franja horaria
   * @param {string} reservaData.usuarioEmail - Email del cliente
   * @param {string} reservaData.usuarioNombre - Nombre del cliente
   * @param {string} reservaData.notas - Notas adicionales (opcional)
   * @returns {Promise<Object>} Reserva actualizada
   */
  async editarReserva(reservaId, reservaData) {
    try {
      // Validaciones frontend
      if (!reservaData.franjaId) {
        throw new Error("La franja horaria es obligatoria");
      }

      if (!reservaData.usuarioEmail) {
        throw new Error("El email del cliente es obligatorio");
      }

      if (!reservaData.usuarioNombre) {
        throw new Error("El nombre del cliente es obligatorio");
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(reservaData.usuarioEmail)) {
        throw new Error("El formato del email no es válido");
      }

      const response = await apiPut(
        `/admin/reservas/${reservaId}/editar`,
        reservaData
      );
      console.log(`✅ Reserva ${reservaId} editada:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error editando reserva ${reservaId}:`, error);
      throw error;
    }
  }

  // ========== ESTADÍSTICAS Y REPORTES ==========

  /**
   * Obtiene estadísticas generales del dashboard
   * @returns {Promise<Object>} Estadísticas
   */
  async getEstadisticas() {
    try {
      const [reservas, servicios] = await Promise.all([
        this.getAllReservas(),
        this.getAllServicios(),
      ]);

      const hoy = new Date().toISOString().split("T")[0];
      const reservasHoy = reservas.filter(
        (r) => r.fechaReserva === hoy || r.creadoEn?.startsWith(hoy)
      );

      // Calcular ingresos del mes
      const mesActual = new Date().getMonth();
      const anoActual = new Date().getFullYear();
      const reservasMes = reservas.filter((r) => {
        const fecha = new Date(r.fechaReserva || r.creadoEn);
        return (
          fecha.getMonth() === mesActual &&
          fecha.getFullYear() === anoActual &&
          r.estado === "COMPLETADA"
        );
      });

      const ingresosMes = reservasMes.reduce((total, r) => {
        return total + (r.precio || 25);
      }, 0);

      // Clientes únicos
      const clientesUnicos = new Set(reservas.map((r) => r.usuarioId)).size;

      // Servicio más popular
      const conteoServicios = {};
      reservas.forEach((r) => {
        conteoServicios[r.servicioId] =
          (conteoServicios[r.servicioId] || 0) + 1;
      });

      const stats = {
        reservasTotales: reservas.length,
        reservasHoy: reservasHoy.length,
        reservasPendientes: reservas.filter((r) => r.estado === "PENDIENTE")
          .length,
        ingresosMes: ingresosMes,
        clientesActivos: clientesUnicos,
        serviciosActivos: servicios.filter((s) => s.activo).length,
        servicioMasPopular:
          Object.entries(conteoServicios).sort(
            ([, a], [, b]) => b - a
          )[0]?.[0] || null,
      };

      console.log("📊 Estadísticas calculadas:", stats);
      return stats;
    } catch (error) {
      console.error("❌ Error obteniendo estadísticas:", error);
      throw error;
    }
  }

  /**
   * Exporta reservas a CSV
   * @param {Array} reservas - Reservas a exportar
   * @returns {string} Contenido CSV
   */
  exportarReservasCSV(reservas) {
    // Cabeceras CSV
    const headers = [
      "ID",
      "Cliente",
      "Email",
      "Servicio",
      "Fecha",
      "Hora",
      "Estado",
      "Precio",
      "Notas",
    ];

    // Convertir reservas a filas CSV
    const rows = reservas.map((r) => [
      r.id,
      r.usuarioNombre || "N/A",
      r.usuarioEmail || "N/A",
      r.servicioNombre || "N/A",
      r.fecha,
      r.horaInicio,
      r.estado,
      r.precioFinal || "0",
      r.notas || "",
    ]);

    // Construir CSV
    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    return csv;
  }

  /**
   * Descarga un archivo CSV
   * @param {string} csvContent - Contenido CSV
   * @param {string} filename - Nombre del archivo
   */
  descargarCSV(csvContent, filename = "reservas.csv") {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(`📥 CSV descargado: ${filename}`);
  }

  // ========== GESTIÓN DE FRANJAS HORARIAS ==========

  /**
   * Obtiene todas las franjas de un servicio específico
   * @param {number} servicioId - ID del servicio
   * @returns {Promise<Array>} Lista de franjas horarias
   */
  async getFranjasPorServicio(servicioId) {
    try {
      const response = await apiGet(`/admin/franjas/servicio/${servicioId}`);
      console.log(
        `🕐 ${response.data.length} franjas para servicio ${servicioId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `❌ Error obteniendo franjas del servicio ${servicioId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Obtiene franjas por rango de fechas (para vista calendario)
   * @param {string} desde - Fecha inicio (YYYY-MM-DD)
   * @param {string} hasta - Fecha fin (YYYY-MM-DD)
   * @returns {Promise<Array>} Lista de franjas en el rango
   */
  async getFranjasPorRango(desde, hasta) {
    try {
      const response = await apiGet(
        `/admin/franjas?desde=${desde}&hasta=${hasta}`
      );
      console.log(
        `📅 ${response.data.length} franjas entre ${desde} y ${hasta}`
      );
      return response.data;
    } catch (error) {
      console.error(`❌ Error obteniendo franjas por rango:`, error);
      throw error;
    }
  }

  /**
   * Obtiene el detalle de una franja específica
   * @param {number} franjaId - ID de la franja
   * @returns {Promise<Object>} Datos de la franja
   */
  async getFranja(franjaId) {
    try {
      const response = await apiGet(`/admin/franjas/${franjaId}`);
      console.log(`🕐 Franja ${franjaId} obtenida`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error obteniendo franja ${franjaId}:`, error);
      throw error;
    }
  }

  /**
   * Crea una nueva franja horaria
   * @param {Object} franjaData - Datos de la franja
   * @param {number} franjaData.servicioId - ID del servicio
   * @param {string} franjaData.fecha - Fecha (YYYY-MM-DD)
   * @param {string} franjaData.horaInicio - Hora inicio (HH:mm:ss)
   * @param {number} franjaData.plazasDisponibles - Número de plazas (opcional)
   * @returns {Promise<Object>} Franja creada
   */
  async crearFranja(franjaData) {
    try {
      if (
        !franjaData.servicioId ||
        !franjaData.fecha ||
        !franjaData.horaInicio
      ) {
        throw new Error("Servicio, fecha y hora de inicio son obligatorios");
      }

      // Validar horario (07:00 - 22:00)
      const [hours] = franjaData.horaInicio.split(":").map(Number);
      if (hours < 7 || hours > 22) {
        throw new Error("El horario debe estar entre las 07:00 y las 22:00");
      }

      // Validar fecha (no permitir fechas pasadas)
      const fechaFranja = new Date(franjaData.fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaFranja < hoy) {
        throw new Error("No se pueden crear franjas en fechas pasadas");
      }

      const response = await apiPost("/admin/franjas", franjaData);
      console.log("✅ Franja horaria creada:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error creando franja:", error);
      throw error;
    }
  }

  /**
   * Actualiza una franja existente
   * @param {number} franjaId - ID de la franja
   * @param {Object} franjaData - Datos actualizados
   * @returns {Promise<Object>} Franja actualizada
   */
  async actualizarFranja(franjaId, franjaData) {
    try {
      const response = await apiPut(`/admin/franjas/${franjaId}`, franjaData);
      console.log(`✅ Franja ${franjaId} actualizada`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error actualizando franja ${franjaId}:`, error);
      throw error;
    }
  }

  /**
   * Elimina una franja horaria
   * Solo permite eliminar franjas sin reservas activas
   * @param {number} franjaId - ID de la franja
   * @returns {Promise<Object>} Respuesta de confirmación
   */
  async eliminarFranja(franjaId) {
    try {
      const response = await apiDelete(`/admin/franjas/${franjaId}`);
      console.log(`✅ Franja ${franjaId} eliminada`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error eliminando franja ${franjaId}:`, error);
      throw error;
    }
  }

  // ========== GESTIÓN DE USUARIOS ==========

  /**
   * Obtiene todos los usuarios del sistema
   * @returns {Promise<Array>} Lista completa de usuarios
   */
  async getAllUsuarios() {
    try {
      const response = await apiGet("/admin/usuarios");
      console.log(`👥 ${response.data.length} usuarios totales`);
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo usuarios:", error);
      throw error;
    }
  }

  /**
   * Obtiene un usuario por ID
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<Object>} Datos del usuario
   */
  async getUsuarioById(usuarioId) {
    try {
      const response = await apiGet(`/admin/usuarios/${usuarioId}`);
      console.log(`👤 Usuario ${usuarioId} obtenido`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error obteniendo usuario ${usuarioId}:`, error);
      throw error;
    }
  }
}

export default new AdminService();
