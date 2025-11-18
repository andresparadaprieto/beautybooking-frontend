// Import axios para hacer peticiones HTTP
import axios from "axios";

// URL base del backend
const API_URL = "http://localhost:8080";

// Creamos una instancia personalizada de axios
// Esto nos permite configurar opciones por defecto para todas las peticiones
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json", // Indicamos que enviamos JSON
  },
  timeout: 10000, // 10 segundos de timeout
});

// INTERCEPTOR DE REQUEST (antes de enviar la petición)
// Se ejecuta automáticamente antes de cada petición
api.interceptors.request.use(
  (config) => {
    // Obtenemos el token del localStorage (si existe)
    const token = localStorage.getItem("token");

    // Si hay token, lo añadimos al header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(
      `📤 ${config.method.toUpperCase()} ${config.url}`,
      config.data || ""
    );

    return config;
  },
  (error) => {
    // Si hay error antes de enviar la petición
    console.error("❌ Error en request:", error);
    return Promise.reject(error);
  }
);

// INTERCEPTOR DE RESPONSE (después de recibir la respuesta)
// Se ejecuta automáticamente después de cada respuesta
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa (status 2xx)
    console.log(`📥 Response de ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    // Si hay error en la respuesta
    console.error(
      "❌ Error en response:",
      error.response?.data || error.message
    );

    // Manejo especial para errores de autenticación
    if (error.response?.status === 401) {
      // Token expirado o inválido
      console.log("🔒 No autorizado - redirigiendo a login");

      // Limpiamos el localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirigimos a login (si no estamos ya ahí)
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // Si el servidor devuelve un mensaje de error
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Error al procesar la solicitud";

    // Creamos un error más legible
    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.data = error.response?.data;

    return Promise.reject(customError);
  }
);

// Funciones helper para métodos HTTP comunes

export const apiGet = (url, config = {}) => api.get(url, config);
export const apiPost = (url, data, config = {}) => api.post(url, data, config);
export const apiPut = (url, data, config = {}) => api.put(url, data, config);
export const apiPatch = (url, data, config = {}) =>
  api.patch(url, data, config);
export const apiDelete = (url, config = {}) => api.delete(url, config);

export default api;
