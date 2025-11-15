// Hooks personalizados
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * useLoading - Hook para manejar estados de carga
 * Útil para mostrar spinners mientras se cargan datos
 */
export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);

  // Función para ejecutar algo con loading
  const executeWithLoading = useCallback(async (callback) => {
    setIsLoading(true);
    try {
      const result = await callback();
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, setIsLoading, executeWithLoading };
};

/**
 * useError - Hook para manejar errores
 * Centraliza el manejo de errores con auto-limpieza
 */
export const useError = () => {
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);

  // Establecer error con auto-limpieza opcional
  const setErrorWithTimeout = useCallback((errorMessage, timeout = 5000) => {
    setError(errorMessage);

    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Establecer nuevo timeout
    if (timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        setError(null);
      }, timeout);
    }
  }, []);

  // Limpiar error manualmente
  const clearError = useCallback(() => {
    setError(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { error, setError: setErrorWithTimeout, clearError };
};

/**
 * useForm - Hook para manejar formularios
 * Simplifica el manejo de inputs y validación
 */
export const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Actualizar un campo
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      setValues((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));

      // Limpiar error del campo si existe
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Marcar campo como tocado
  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      // Validar campo individual
      if (validationRules[name]) {
        validateField(name, values[name]);
      }
    },
    [values, validationRules]
  );

  // Validar un campo individual
  const validateField = useCallback(
    (name, value) => {
      const rule = validationRules[name];
      if (!rule) return true;

      let error = null;

      // Validación requerida
      if (rule.required && !value) {
        error = rule.message || `${name} es requerido`;
      }

      // Validación de email
      if (rule.email && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          error = rule.message || "Email inválido";
        }
      }

      // Validación de longitud mínima
      if (rule.minLength && value && value.length < rule.minLength) {
        error = rule.message || `Mínimo ${rule.minLength} caracteres`;
      }

      // Validación personalizada
      if (rule.validate) {
        const customError = rule.validate(value, values);
        if (customError) {
          error = customError;
        }
      }

      if (error) {
        setErrors((prev) => ({ ...prev, [name]: error }));
        return false;
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
        return true;
      }
    },
    [validationRules, values]
  );

  // Validar todo el formulario
  const validate = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((field) => {
      if (!validateField(field, values[field])) {
        isValid = false;
      }
    });

    return isValid;
  }, [validationRules, values, validateField]);

  // Resetear formulario
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Establecer valores programáticamente
  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Establecer múltiples valores
  const setFieldValues = useCallback((newValues) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    validate,
    reset,
    setFieldValue,
    setFieldValues,
    setIsSubmitting,
  };
};

/**
 * useDebounce - Hook para debounce de valores
 * Útil para búsquedas en tiempo real
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * useLocalStorage - Hook para usar localStorage reactivamente
 * Sincroniza estado con localStorage
 */
export const useLocalStorage = (key, initialValue) => {
  // Estado inicial desde localStorage o valor por defecto
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error leyendo localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Función para actualizar el valor
  const setValue = useCallback(
    (value) => {
      try {
        // Permitir value ser una función como useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error guardando localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Función para eliminar el valor
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error eliminando localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

/**
 * useProtectedRoute - Hook para rutas protegidas
 * Redirige si no hay autenticación o permisos
 */
export const useProtectedRoute = (requiredRole = null) => {
  const { user, isAuthenticated, isAdmin, isCliente } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si no está autenticado, redirigir a login
    if (!isAuthenticated()) {
      console.log("🔒 Ruta protegida - Redirigiendo a login");
      navigate("/login");
      return;
    }

    // Si se requiere un rol específico
    if (requiredRole) {
      if (requiredRole === "ADMIN" && !isAdmin()) {
        console.log("🔒 Se requiere rol ADMIN - Redirigiendo");
        navigate("/");
        return;
      }

      if (requiredRole === "CLIENTE" && !isCliente()) {
        console.log("🔒 Se requiere rol CLIENTE - Redirigiendo");
        navigate("/");
        return;
      }
    }
  }, [user, isAuthenticated, isAdmin, isCliente, requiredRole, navigate]);

  return { user, isAuthenticated: isAuthenticated() };
};

/**
 * useToggle - Hook para manejar estados booleanos
 * Útil para modales, menús desplegables, etc.
 */
export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return { value, toggle, setTrue, setFalse, setValue };
};

/**
 * useOnClickOutside - Hook para detectar clicks fuera de un elemento
 * Útil para cerrar modales o menús
 */
export const useOnClickOutside = (handler) => {
  const ref = useRef(null);

  useEffect(() => {
    const listener = (event) => {
      // No hacer nada si se clickea dentro del elemento
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [handler]);

  return ref;
};

/**
 * useWindowSize - Hook para obtener el tamaño de la ventana
 * Útil para responsive design programático
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowSize({
        width,
        height: window.innerHeight,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};
