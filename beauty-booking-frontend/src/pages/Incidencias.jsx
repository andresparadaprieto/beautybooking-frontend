import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Upload,
  X,
  CheckCircle,
  ArrowLeft,
  User,
  FileText,
} from "lucide-react";
import { useForm } from "../hooks";

/**
 * Página de Incidencias
 *
 * Formulario para reportar problemas y bugs de la aplicación.
 *
 */

const Incidencias = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  // Formulario con custom hook
  const form = useForm({
    // Datos del reportante
    nombre: "",
    email: "",
    telefono: "",
    rol: "cliente",

    // Información de la incidencia
    prioridad: "",
    tipo: "",
    fecha: new Date().toISOString().slice(0, 16),
    navegador: "",
    descripcion: "",
    pasos: "",
    esperado: "",
  });

  /**
   * Detectar navegador y sistema operativo automáticamente
   */
  useEffect(() => {
    const userAgent = navigator.userAgent;
    let browser = "Desconocido";
    let os = "Desconocido";

    // Detectar navegador
    if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Safari")) browser = "Safari";
    else if (userAgent.includes("Edge")) browser = "Edge";

    // Detectar OS
    if (userAgent.includes("Windows")) os = "Windows";
    else if (userAgent.includes("Mac")) os = "macOS";
    else if (userAgent.includes("Linux")) os = "Linux";
    else if (userAgent.includes("Android")) os = "Android";
    else if (userAgent.includes("iOS")) os = "iOS";

    form.setFieldValue("navegador", `${browser} / ${os}`);
  }, []);

  /**
   * Manejar cambio de archivos
   */
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  /**
   * Eliminar archivo seleccionado
   */
  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  /**
   * Enviar formulario
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar campos requeridos
    if (
      !form.values.nombre ||
      !form.values.email ||
      !form.values.prioridad ||
      !form.values.tipo ||
      !form.values.descripcion
    ) {
      alert("Por favor, completa todos los campos obligatorios marcados con *");
      return;
    }

    // Generar ID de ticket
    const id =
      "INC-" +
      new Date().toISOString().slice(0, 10).replace(/-/g, "") +
      "-" +
      Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");

    setTicketId(id);
    setSubmitted(true);

    // Simular logging
    console.log("📋 Incidencia reportada:", {
      ...form.values,
      archivos: files.length,
      ticketId: id,
    });
  };

  // Vista de éxito después de enviar
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Icono de éxito */}
            <div className="mb-6 flex justify-center">
              <div className="bg-green-100 rounded-full p-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
            </div>

            {/* Mensaje */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              ¡Incidencia Enviada!
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Tu reporte ha sido recibido correctamente.
            </p>

            {/* Ticket ID */}
            <div className="bg-beauty-50 rounded-lg p-4 mb-6 border border-beauty-200">
              <p className="text-sm text-gray-600 mb-1 text-center">
                ID de Ticket:
              </p>
              <p className="text-xl font-mono font-bold text-beauty-600 text-center">
                {ticketId}
              </p>
            </div>

            {/* Información */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                📧 Recibirás un email de confirmación en{" "}
                <strong>{form.values.email}</strong> en los próximos minutos.
              </p>
            </div>

            {/* Tiempo de respuesta */}
            <div className="text-xs text-gray-600 mb-6 bg-gray-50 rounded-lg p-4">
              <p className="font-semibold mb-2 text-center">
                Tiempo de respuesta estimado:
              </p>
              <div className="space-y-1">
                <p>
                  🔴 <strong>Crítica:</strong> &lt; 4 horas
                </p>
                <p>
                  🟠 <strong>Alta:</strong> &lt; 24 horas
                </p>
                <p>
                  🟡 <strong>Media:</strong> &lt; 72 horas
                </p>
                <p>
                  🟢 <strong>Baja:</strong> &lt; 1 semana
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFiles([]);
                  form.reset();
                }}
                className="btn-primary w-full"
              >
                Reportar Otra Incidencia
              </button>
              <button
                onClick={() => navigate("/servicios")}
                className="btn-secondary w-full"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulario principal
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Botón volver */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6
                     transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reportar Incidencia
          </h1>
          <p className="text-gray-600">
            ¿Encontraste algún problema? Ayúdanos a mejorar reportándolo aquí.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* SECCIÓN 1: Datos del Reportante */}
            <div>
              <h2
                className="text-lg font-semibold text-gray-900 mb-4 pb-2
                           border-b border-gray-200 flex items-center gap-2"
              >
                <User className="w-5 h-5 text-beauty-500" />
                Datos del Reportante
              </h2>

              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="nombre" className="form-label">
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={form.values.nombre}
                    onChange={form.handleChange}
                    placeholder="Ej: María García López"
                    className="form-input"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={form.values.email}
                      onChange={form.handleChange}
                      placeholder="email@ejemplo.com"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="telefono" className="form-label">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={form.values.telefono}
                      onChange={form.handleChange}
                      placeholder="+34 600 000 000"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Rol <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rol"
                        value="cliente"
                        checked={form.values.rol === "cliente"}
                        onChange={form.handleChange}
                        className="w-4 h-4 text-beauty-500 focus:ring-beauty-500"
                      />
                      <span className="text-sm text-gray-700">Cliente</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rol"
                        value="tecnico"
                        checked={form.values.rol === "tecnico"}
                        onChange={form.handleChange}
                        className="w-4 h-4 text-beauty-500 focus:ring-beauty-500"
                      />
                      <span className="text-sm text-gray-700">Técnico</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rol"
                        value="comercial"
                        checked={form.values.rol === "comercial"}
                        onChange={form.handleChange}
                        className="w-4 h-4 text-beauty-500 focus:ring-beauty-500"
                      />
                      <span className="text-sm text-gray-700">Comercial</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: Información de la Incidencia */}
            <div>
              <h2
                className="text-lg font-semibold text-gray-900 mb-4 pb-2
                           border-b border-gray-200 flex items-center gap-2"
              >
                <AlertCircle className="w-5 h-5 text-beauty-500" />
                Información de la Incidencia
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="prioridad" className="form-label">
                      Prioridad <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="prioridad"
                      name="prioridad"
                      value={form.values.prioridad}
                      onChange={form.handleChange}
                      className="form-input"
                      required
                    >
                      <option value="">Seleccione...</option>
                      <option value="critica">🔴 Crítica</option>
                      <option value="alta">🟠 Alta</option>
                      <option value="media">🟡 Media</option>
                      <option value="baja">🟢 Baja</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="tipo" className="form-label">
                      Tipo de Incidencia <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="tipo"
                      name="tipo"
                      value={form.values.tipo}
                      onChange={form.handleChange}
                      className="form-input"
                      required
                    >
                      <option value="">Seleccione...</option>
                      <option value="error_funcional">Error Funcional</option>
                      <option value="error_visual">Error Visual</option>
                      <option value="rendimiento">
                        Problema de Rendimiento
                      </option>
                      <option value="seguridad">Seguridad</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="fecha" className="form-label">
                      Fecha y Hora del Incidente{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="fecha"
                      name="fecha"
                      value={form.values.fecha}
                      onChange={form.handleChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="navegador" className="form-label">
                      Navegador/Dispositivo
                    </label>
                    <input
                      type="text"
                      id="navegador"
                      name="navegador"
                      value={form.values.navegador}
                      onChange={form.handleChange}
                      className="form-input"
                      placeholder="Ej: Chrome 122 / Windows 11"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="descripcion" className="form-label">
                    Descripción del Problema{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={form.values.descripcion}
                    onChange={form.handleChange}
                    rows={4}
                    className="form-input"
                    placeholder="Describe detalladamente qué ocurrió..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="pasos" className="form-label">
                    Pasos para Reproducir el Error
                  </label>
                  <textarea
                    id="pasos"
                    name="pasos"
                    value={form.values.pasos}
                    onChange={form.handleChange}
                    rows={4}
                    className="form-input"
                    placeholder="1. Entrar en la aplicación&#10;2. Hacer clic en...&#10;3. Observar que..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="esperado" className="form-label">
                    Comportamiento Esperado
                  </label>
                  <textarea
                    id="esperado"
                    name="esperado"
                    value={form.values.esperado}
                    onChange={form.handleChange}
                    rows={3}
                    className="form-input"
                    placeholder="¿Qué esperabas que sucediera?"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: Capturas de Pantalla */}
            <div>
              <h2
                className="text-lg font-semibold text-gray-900 mb-4 pb-2
                           border-b border-gray-200 flex items-center gap-2"
              >
                <FileText className="w-5 h-5 text-beauty-500" />
                Capturas de Pantalla
              </h2>

              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="archivos" className="form-label">
                    Adjuntar Imágenes (opcional)
                  </label>

                  {/* Área de upload */}
                  <label
                    htmlFor="archivos"
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8
                             text-center cursor-pointer hover:border-beauty-400
                             hover:bg-beauty-50 transition-all block"
                  >
                    <Upload className="w-12 h-12 text-beauty-500 mx-auto mb-3" />
                    <div className="text-gray-700">
                      <strong>Haz clic para seleccionar archivos</strong>
                      <br />
                      o arrastra y suelta aquí
                      <br />
                      <small className="text-gray-500">
                        PNG, JPG, PDF - Máx. 10MB
                      </small>
                    </div>
                  </label>
                  <input
                    type="file"
                    id="archivos"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Lista de archivos seleccionados */}
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-green-50
                                   border border-green-200 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm text-gray-700">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary px-6"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary px-6">
                Enviar Incidencia
              </button>
            </div>
          </form>

          {/* Footer info */}
          <div
            className="bg-gray-50 border-t border-gray-200 p-6 text-center text-sm
                        text-gray-600"
          >
            <p className="mb-2">
              📧 <strong className="text-gray-900">Email:</strong>{" "}
              incidencias@beautybooking.com
              {" | "}
              📞 <strong className="text-gray-900">Teléfono:</strong> +34 900
              123 456
            </p>
            <p className="text-xs text-gray-500">
              Recibirás un email de confirmación con tu ID de ticket en los
              próximos minutos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Incidencias;
