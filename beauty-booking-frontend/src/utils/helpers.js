// Funciones de utilidad para toda la aplicación
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";

/**
 * FORMATTERS - Funciones para formatear datos
 */

// Formatear precio en euros
export const formatPrice = (price) => {
  if (price === null || price === undefined) return "0,00 €";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

// Formatear fecha en español
export const formatDate = (date, formatStr = "dd/MM/yyyy") => {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "";
    return format(dateObj, formatStr, { locale: es });
  } catch (error) {
    console.error("Error formateando fecha:", error);
    return "";
  }
};

// Formatear fecha y hora
export const formatDateTime = (date) => {
  return formatDate(date, "dd/MM/yyyy 'a las' HH:mm");
};

// Formatear hora
export const formatTime = (time) => {
  if (!time) return "";
  // Si viene en formato HH:MM:SS, quitar los segundos
  return time.substring(0, 5);
};

// Formatear duración en minutos a texto legible
export const formatDuration = (minutes) => {
  if (!minutes) return "";

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}min`;
};

// Formatear número de teléfono español
export const formatPhone = (phone) => {
  if (!phone) return "";

  // Eliminar espacios y caracteres no numéricos
  const cleaned = phone.replace(/\D/g, "");

  // Formato: XXX XXX XXX
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }

  return phone;
};

/**
 * VALIDATORS - Funciones de validación
 */

// Validar email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar teléfono español
export const isValidPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 9 && /^[679]\d{8}$/.test(cleaned);
};

// Validar contraseña segura
export const isValidPassword = (password) => {
  // Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

// Obtener fuerza de la contraseña
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, message: "Muy débil", color: "red" };

  let score = 0;

  // Criterios de puntuación
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  // Determinar nivel
  const levels = [
    { min: 0, message: "Muy débil", color: "red" },
    { min: 2, message: "Débil", color: "orange" },
    { min: 4, message: "Media", color: "yellow" },
    { min: 5, message: "Fuerte", color: "green" },
    { min: 6, message: "Muy fuerte", color: "green" },
  ];

  const level = levels.reverse().find((l) => score >= l.min);

  return {
    score,
    percentage: (score / 6) * 100,
    ...level,
  };
};

// Validar fecha futura
export const isFutureDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkDate = typeof date === "string" ? parseISO(date) : date;
  return checkDate >= today;
};

// Validar horario de apertura (07:00 - 22:00)
export const isValidBusinessHour = (hour) => {
  const hourNum = parseInt(hour.split(":")[0]);
  return hourNum >= 7 && hourNum < 22;
};

/**
 * STRING UTILITIES - Utilidades para strings
 */

// Capitalizar primera letra
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncar texto
export const truncate = (str, maxLength = 50) => {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength) + "...";
};

// Generar slug desde texto
export const slugify = (text) => {
  if (!text) return "";

  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .replace(/[^a-z0-9\s-]/g, "") // Eliminar caracteres especiales
    .replace(/\s+/g, "-") // Reemplazar espacios con -
    .replace(/-+/g, "-"); // Eliminar múltiples -
};

// Generar iniciales desde nombre
export const getInitials = (name) => {
  if (!name) return "";

  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * ARRAY & OBJECT UTILITIES
 */

// Agrupar array por propiedad
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {});
};

// Ordenar array por propiedad
export const sortBy = (array, key, order = "asc") => {
  return [...array].sort((a, b) => {
    if (order === "asc") {
      return a[key] > b[key] ? 1 : -1;
    } else {
      return a[key] < b[key] ? 1 : -1;
    }
  });
};

// Eliminar duplicados de array
export const unique = (array, key) => {
  if (key) {
    return array.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t[key] === item[key])
    );
  }
  return [...new Set(array)];
};

/**
 * DATE UTILITIES
 */

// Obtener rango de fechas
export const getDateRange = (startDate, endDate) => {
  const dates = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

// Verificar si es día laboral
export const isWeekday = (date) => {
  const day = date.getDay();
  return day !== 0 && day !== 6; // No domingo ni sábado
};

// Obtener nombre del día
export const getDayName = (date) => {
  return format(date, "EEEE", { locale: es });
};

// Calcular edad desde fecha
export const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = typeof birthDate === "string" ? parseISO(birthDate) : birthDate;

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

/**
 * STORAGE UTILITIES
 */

// Guardar en localStorage con manejo de errores
export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Error guardando en localStorage:", error);
    return false;
  }
};

// Obtener de localStorage con manejo de errores
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error leyendo localStorage:", error);
    return defaultValue;
  }
};

// Eliminar de localStorage
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error("Error eliminando de localStorage:", error);
    return false;
  }
};

/**
 * MISC UTILITIES
 */

// Generar ID único
export const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Copiar al portapapeles
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Error copiando al portapapeles:", error);
    return false;
  }
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Sleep/delay function
export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Verificar si es móvil
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Obtener query params de URL
export const getQueryParams = (url = window.location.search) => {
  const params = new URLSearchParams(url);
  const result = {};

  for (const [key, value] of params) {
    result[key] = value;
  }

  return result;
};

// Construir query string desde objeto
export const buildQueryString = (params) => {
  return Object.keys(params)
    .filter((key) => params[key] !== null && params[key] !== undefined)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    )
    .join("&");
};
