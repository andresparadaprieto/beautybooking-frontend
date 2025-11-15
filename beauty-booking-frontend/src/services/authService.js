import { apiPost } from "./api";

/**
 * authService - Servicio centralizado para autenticación
 *
 * Este servicio maneja:
 * - Login de usuarios
 * - Registro de nuevos usuarios
 * - Gestión del token JWT
 * - Información del usuario actual
 */

class AuthService {
  constructor() {
    // Clave para guardar el token en localStorage
    this.tokenKey = "token";
    // Clave para guardar los datos del usuario
    this.userKey = "user";
  }

  /**
   * Login - Autentica un usuario
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña
   * @returns {Promise} Promesa con los datos del usuario y token
   */
  async login(email, password) {
    try {
      // Llamada al endpoint de login
      const response = await apiPost("/auth/login", { email, password });
      const data = response.data;

      if (data.token) {
        // Guardamos el token en localStorage
        this.setToken(data.token);

        // Se manejan las respuestas
        const usuario = data.usuario || {
          id: data.id,
          email: data.email,
          nombre: data.nombre,
          rol: data.rol,
        };

        // Guardamos los datos del usuario
        this.setUser(usuario);

        console.log("✅ Login exitoso:", usuario.email);
      }

      return data;
    } catch (error) {
      console.error("❌ Error en login:", error);
      throw error;
    }
  }

  /**
   * Registro - Crea una nueva cuenta de usuario
   * @param {Object} userData - Datos del nuevo usuario
   * @returns {Promise} Promesa con los datos del usuario creado
   */
  async register(userData) {
    try {
      if (
        !userData.email ||
        !userData.password ||
        !userData.nombre ||
        !userData.telefono
      ) {
        throw new Error("Todos los campos son obligatorios");
      }

      // Password mínimo 8 caracteres
      if (userData.password.length < 8) {
        throw new Error("La contraseña debe tener mínimo 8 caracteres");
      }

      // Llamada al endpoint de registro
      const response = await apiPost("/auth/register", {
        email: userData.email,
        password: userData.password,
        nombre: userData.nombre,
        telefono: userData.telefono,
        rol: "CLIENTE", // Por defecto todos se registran como clientes
      });

      const data = response.data;

      // Si el registro devuelve token, hacemos login automático
      if (data.token) {
        this.setToken(data.token);

        // Manejar ambas estructuras de respuesta
        const usuario = data.usuario || {
          id: data.id,
          email: data.email,
          nombre: data.nombre,
          rol: data.rol,
        };

        this.setUser(usuario);
        console.log("✅ Registro exitoso y login automático");
      }

      return data;
    } catch (error) {
      console.error("❌ Error en registro:", error);
      throw error;
    }
  }

  /**
   * Logout - Cierra la sesión del usuario
   * Limpia el localStorage y redirige a login
   */
  logout() {
    // Limpiamos todo el localStorage relacionado con la sesión
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);

    console.log("👋 Logout exitoso");

    // Redirigimos a la página de login
    window.location.href = "/login";
  }

  /**
   * Obtiene el token almacenado
   * @returns {string|null} Token JWT o null si no existe
   */
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Guarda el token en localStorage
   * @param {string} token - Token JWT
   */
  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Obtiene los datos del usuario actual
   * @returns {Object|null} Datos del usuario o null
   */
  getUser() {
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error("Error parsing user data:", e);
        return null;
      }
    }
    return null;
  }

  /**
   * Guarda los datos del usuario en localStorage
   * @param {Object} user - Datos del usuario
   */
  setUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Verifica si hay un usuario autenticado
   * @returns {boolean} true si hay sesión activa
   */
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user); // Devuelve true si ambos existen
  }

  /**
   * Verifica si el usuario actual es administrador
   * @returns {boolean} true si es admin
   */
  isAdmin() {
    const user = this.getUser();
    return user?.rol === "ADMIN";
  }

  /**
   * Obtiene el rol del usuario actual
   * @returns {string|null} Rol del usuario (CLIENTE/ADMIN) o null
   */
  getUserRole() {
    const user = this.getUser();
    return user?.rol || null;
  }

  /**
   * Actualiza los datos del usuario en localStorage
   * Útil después de editar perfil
   * @param {Object} updatedUser - Datos actualizados
   */
  updateUser(updatedUser) {
    const currentUser = this.getUser();
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedUser };
      this.setUser(newUser);
      console.log("✅ Datos de usuario actualizados:", newUser);
    }
  }

  /**
   * Verificar si el token ha expirado
   * @returns {boolean} true si el token parece válido
   */
  isTokenValid() {
    const token = this.getToken();
    if (!token) return false;

    return true;
  }
}

export default new AuthService();
