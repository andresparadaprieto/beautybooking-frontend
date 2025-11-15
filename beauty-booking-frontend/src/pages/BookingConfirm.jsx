import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  AlertTriangle,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import bookingService from "../services/bookingService";
import { useAuth } from "../context/AuthContext";
import { useProtectedRoute, useForm } from "../hooks";
import { LoadingButton } from "../components/common/Loading";
import { InlineAlert, Toast } from "../components/common/Alert";

/**
 * BookingConfirm Page
 *
 * Última página del flujo de reserva:
 * - Muestra resumen de la reserva
 * - Permite añadir notas/comentarios
 * - Confirma los datos del cliente
 * - Procesa la reserva
 * - Muestra confirmación de éxito
 */

const BookingConfirm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useProtectedRoute(); // Requiere autenticación

  // Estados
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [reservaCreada, setReservaCreada] = useState(null);
  const [showToast, setShowToast] = useState(false);

  // Obtener datos de la navegación
  const { servicio, fecha, franja } = location.state || {};

  // Formulario para notas adicionales
  const form = useForm({
    notas: "",
    aceptaCondiciones: false,
    recibirNotificaciones: true,
  });

  useEffect(() => {
    if (!servicio || !fecha || !franja) {
      console.error("Faltan datos para la confirmación");
      navigate("/servicios");
    }
  }, [servicio, fecha, franja, navigate]);

  /**
   * Calcular hora de fin
   */
  const calcularHoraFin = () => {
    if (!franja || !servicio) return "";
    return bookingService.calcularHoraFin(
      franja.horaInicio,
      servicio.duracionMinutos
    );
  };

  /**
   * Formatear fecha para mostrar
   */
  const formatearFecha = () => {
    if (!fecha) return "";
    const dateObj = new Date(fecha + "T00:00:00");
    return format(dateObj, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  };

  /**
   * Procesar la reserva
   */
  const handleConfirmarReserva = async () => {
    // Validar aceptación de condiciones
    if (!form.values.aceptaCondiciones) {
      setError(
        "Debes aceptar las condiciones de uso y política de cancelación"
      );
      return;
    }

    // Limpiar errores
    setError("");
    form.setIsSubmitting(true);

    try {
      // Preparar datos de la reserva
      const reservaData = {
        franjaHorariaId: franja.id,
        notas: form.values.notas.trim(),
      };

      console.log("📤 Creando reserva:", reservaData);

      // Crear la reserva
      const nuevaReserva = await bookingService.crearReserva(reservaData);

      console.log("✅ Reserva creada:", nuevaReserva);

      // Guardar la reserva creada
      setReservaCreada(nuevaReserva);
      setSuccess(true);

      // Mostrar toast de éxito
      setShowToast(true);

      // Esperar un poco y redirigir a mis reservas
      setTimeout(() => {
        navigate("/mis-reservas", {
          state: {
            nuevaReserva: true,
            reservaId: nuevaReserva.id,
          },
        });
      }, 3000);
    } catch (err) {
      console.error("❌ Error creando reserva:", err);

      // Manejar errores específicos
      if (err.message.includes("plazas")) {
        setError(
          "Lo sentimos, ya no hay plazas disponibles para este horario."
        );
      } else if (err.message.includes("duplicada")) {
        setError("Ya tienes una reserva para este servicio en esta fecha.");
      } else {
        setError(
          err.message ||
            "Error al procesar la reserva. Por favor, intenta de nuevo."
        );
      }

      form.setIsSubmitting(false);
    }
  };

  // Si no hay datos, no renderizar nada
  if (!servicio || !fecha || !franja) {
    return null;
  }

  // Vista de éxito después de confirmar
  if (success && reservaCreada) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Icono de éxito */}
            <div className="mb-6 flex justify-center">
              <div className="bg-green-100 rounded-full p-4">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>

            {/* Mensaje de éxito */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Reserva Confirmada!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu reserva ha sido procesada exitosamente. Recibirás un email de
              confirmación en breve.
            </p>

            {/* Código de reserva */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Código de reserva:</p>
              <p className="text-xl font-mono font-bold text-beauty-600">
                #BK{String(reservaCreada.id).padStart(5, "0")}
              </p>
            </div>

            {/* Resumen */}
            <div className="text-left space-y-2 mb-6">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="text-sm">
                  <span className="font-medium">Fecha:</span> {formatearFecha()}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="text-sm">
                  <span className="font-medium">Hora:</span>{" "}
                  {bookingService.formatearHora(franja.horaInicio)} -{" "}
                  {calcularHoraFin()}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="text-sm">
                  <span className="font-medium">Servicio:</span>{" "}
                  {servicio.nombre}
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                📧 Te hemos enviado todos los detalles a{" "}
                <span className="font-medium">{user.email}</span>
              </p>
            </div>

            {/* Botones */}
            <div className="space-y-3">
              <button
                onClick={() => navigate("/mis-reservas")}
                className="btn-primary w-full"
              >
                Ver mis reservas
              </button>
              <button
                onClick={() => navigate("/servicios")}
                className="btn-secondary w-full"
              >
                Hacer otra reserva
              </button>
            </div>
          </div>
        </div>

        {/* Toast de confirmación */}
        {showToast && (
          <Toast
            type="success"
            message="¡Reserva confirmada con éxito!"
            duration={3000}
            onClose={() => setShowToast(false)}
          />
        )}
      </div>
    );
  }

  // Vista normal del formulario de confirmación
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Botón volver */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver atrás
        </button>

        <div className="bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Confirma tu Reserva
            </h1>
            <p className="text-gray-600 mt-1">
              Revisa los detalles y confirma tu cita
            </p>
          </div>

          {/* Contenido */}
          <div className="p-6 space-y-6">
            {/* Alerta de errores */}
            {error && <InlineAlert type="error" message={error} />}

            {/* Resumen de la reserva */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Detalles de la Reserva
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Servicio */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Servicio:</p>
                  <p className="font-medium">{servicio.nombre}</p>
                </div>

                {/* Fecha */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Fecha:</p>
                  <p className="font-medium capitalize">{formatearFecha()}</p>
                </div>

                {/* Hora inicio */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Hora de inicio:</p>
                  <p className="font-medium">
                    {bookingService.formatearHora(franja.horaInicio)}
                  </p>
                </div>

                {/* Hora fin */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Hora de fin:</p>
                  <p className="font-medium">{calcularHoraFin()}</p>
                </div>

                {/* Duración */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Duración:</p>
                  <p className="font-medium">
                    {servicio.duracionMinutos} minutos
                  </p>
                </div>

                {/* Precio */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Precio Total:</p>
                  <p className="text-xl font-bold text-beauty-600">
                    {servicio.precio} €
                  </p>
                </div>
              </div>
            </div>

            {/* Datos del cliente */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Datos del Cliente
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cliente:</p>
                  <p className="font-medium">{user.nombre}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Email:</p>
                  <p className="font-medium flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                </div>

                {user.telefono && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Teléfono:</p>
                    <p className="font-medium flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {user.telefono}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Notas adicionales */}
            <div>
              <label htmlFor="notas" className="form-label">
                Notas adicionales (opcional)
              </label>
              <textarea
                id="notas"
                name="notas"
                rows={3}
                value={form.values.notas}
                onChange={form.handleChange}
                placeholder="¿Necesitas decirnos algo especial? Primera vez, alergias, preferencias..."
                className="form-input"
              />
            </div>

            {/* Información importante */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Información importante:
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>Por favor, llega 5 minutos antes de tu cita</li>
                <li>Si necesitas cancelar, hazlo con 24 horas de antelación</li>
                <li>
                  Recibirás un email de confirmación con todos los detalles
                </li>
                <li>En caso de retraso, llama al 91 123 45 67</li>
              </ul>
            </div>

            {/* Checkboxes de confirmación */}
            <div className="space-y-3">
              <div className="flex items-start">
                <input
                  id="aceptaCondiciones"
                  name="aceptaCondiciones"
                  type="checkbox"
                  checked={form.values.aceptaCondiciones}
                  onChange={form.handleChange}
                  className="h-4 w-4 mt-0.5 text-beauty-500 focus:ring-beauty-500 
                           border-gray-300 rounded"
                />
                <label
                  htmlFor="aceptaCondiciones"
                  className="ml-2 text-sm text-gray-700"
                >
                  Al confirmar esta reserva, aceptas nuestras{" "}
                  <a href="/terms" className="text-beauty-500 hover:underline">
                    condiciones de uso
                  </a>{" "}
                  y{" "}
                  <a
                    href="/cancel-policy"
                    className="text-beauty-500 hover:underline"
                  >
                    política de cancelación
                  </a>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  id="recibirNotificaciones"
                  name="recibirNotificaciones"
                  type="checkbox"
                  checked={form.values.recibirNotificaciones}
                  onChange={form.handleChange}
                  className="h-4 w-4 mt-0.5 text-beauty-500 focus:ring-beauty-500 
                           border-gray-300 rounded"
                />
                <label
                  htmlFor="recibirNotificaciones"
                  className="ml-2 text-sm text-gray-700"
                >
                  Deseo recibir recordatorios y notificaciones sobre mi reserva
                </label>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => navigate(-1)}
                className="btn-secondary flex-1"
                disabled={form.isSubmitting}
              >
                ← Volver atrás
              </button>

              <LoadingButton
                onClick={handleConfirmarReserva}
                loading={form.isSubmitting}
                disabled={!form.values.aceptaCondiciones}
                className="flex-1"
              >
                ✓ CONFIRMAR RESERVA
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirm;
