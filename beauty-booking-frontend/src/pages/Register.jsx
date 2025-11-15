import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, Phone, Scissors } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useForm } from "../hooks";
import { InlineAlert } from "../components/common/Alert";
import { LoadingButton } from "../components/common/Loading";

/**
 * Register Page
 *
 * Página de registro con:
 * - Formulario completo de registro
 * - Validación en tiempo real
 * - Verificación de contraseña
 * - Términos y condiciones
 */

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  // Estados locales
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");

  // Hook de formulario con validaciones
  const form = useForm(
    {
      nombre: "",
      email: "",
      telefono: "",
      password: "",
      confirmPassword: "",
    },
    {
      nombre: {
        required: true,
        minLength: 2,
        message: "El nombre debe tener al menos 2 caracteres",
      },
      email: {
        required: true,
        email: true,
        message: "Email válido requerido",
      },
      telefono: {
        required: true,
        validate: (value) => {
          // Validación básica de teléfono español
          const phoneRegex = /^[6-9]\d{8}$/;
          if (!phoneRegex.test(value.replace(/\s/g, ""))) {
            return "Número de teléfono inválido";
          }
          return null;
        },
      },
      password: {
        required: true,
        minLength: 8,
        validate: (value) => {
          // Validación de fortaleza de contraseña
          if (!/[A-Z]/.test(value)) {
            return "La contraseña debe tener al menos una mayúscula";
          }
          if (!/[a-z]/.test(value)) {
            return "La contraseña debe tener al menos una minúscula";
          }
          if (!/[0-9]/.test(value)) {
            return "La contraseña debe tener al menos un número";
          }
          return null;
        },
      },
      confirmPassword: {
        required: true,
        validate: (value, allValues) => {
          if (value !== allValues.password) {
            return "Las contraseñas no coinciden";
          }
          return null;
        },
      },
    }
  );

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/servicios");
    }
  }, [isAuthenticated, navigate]);

  /**
   * Formatear número de teléfono mientras taping
   */
  const handlePhoneChange = (e) => {
    // Eliminar todos los caracteres no numéricos
    let value = e.target.value.replace(/\D/g, "");

    // Limitar a 9 dígitos
    value = value.substring(0, 9);

    form.setFieldValue("telefono", value);
  };

  /**
   * Maneja el submit del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Limpiar mensajes
    setError("");

    // Validar formulario
    if (!form.validate()) {
      setError("Por favor, corrige los errores en el formulario");
      return;
    }

    // Verificar términos y condiciones
    if (!acceptTerms) {
      setError("Debes aceptar los términos y condiciones");
      return;
    }

    // Iniciar proceso de registro
    form.setIsSubmitting(true);

    try {
      // Preparar datos para enviar
      const userData = {
        nombre: form.values.nombre.trim(),
        email: form.values.email.toLowerCase().trim(),
        telefono: form.values.telefono,
        password: form.values.password,
      };

      // Intentar registro
      await register(userData);

      // Si llegamos aquí, registro exitoso
      console.log("✅ Registro exitoso");

      // Redirigir a servicios (el registro hace login automático)
      navigate("/servicios");
    } catch (error) {
      // Manejar errores específicos
      if (error.status === 400) {
        // Verificar si es email duplicado
        if (error.message.includes("email")) {
          setError("Este email ya está registrado");
        } else {
          setError("Datos de registro inválidos");
        }
      } else {
        setError(
          error.message || "Error al crear la cuenta. Intenta de nuevo."
        );
      }
    } finally {
      form.setIsSubmitting(false);
    }
  };

  /**
   * Indicador de fortaleza de contraseña
   */
  const getPasswordStrength = () => {
    const password = form.values.password;
    if (!password) return null;

    let strength = 0;
    let message = "Muy débil";
    let color = "bg-red-500";

    // Criterios de fortaleza
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    // Determinar nivel
    if (strength <= 2) {
      message = "Débil";
      color = "bg-red-500";
    } else if (strength <= 4) {
      message = "Media";
      color = "bg-yellow-500";
    } else {
      message = "Fuerte";
      color = "bg-green-500";
    }

    const percentage = (strength / 6) * 100;

    return { message, color, percentage };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-beauty-100 p-3 rounded-full">
              <Scissors className="w-8 h-8 text-beauty-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Crear Cuenta Nueva
          </h1>
          <p className="mt-2 text-gray-600">
            Únete a BeautyBooking y reserva online
          </p>
        </div>

        {/* Alertas */}
        {error && <InlineAlert type="error" message={error} className="mb-4" />}

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-md space-y-6"
        >
          {/* Campo Nombre */}
          <div>
            <label htmlFor="nombre" className="form-label">
              Nombre Completo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="nombre"
                name="nombre"
                type="text"
                autoComplete="name"
                required
                value={form.values.nombre}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                className={`
                  form-input pl-10
                  ${
                    form.errors.nombre && form.touched.nombre
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }
                `}
                placeholder="María García"
              />
            </div>
            {form.errors.nombre && form.touched.nombre && (
              <p className="mt-1 text-sm text-red-600">{form.errors.nombre}</p>
            )}
          </div>

          {/* Campo Email */}
          <div>
            <label htmlFor="email" className="form-label">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.values.email}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                className={`
                  form-input pl-10
                  ${
                    form.errors.email && form.touched.email
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }
                `}
                placeholder="maria@ejemplo.com"
              />
            </div>
            {form.errors.email && form.touched.email && (
              <p className="mt-1 text-sm text-red-600">{form.errors.email}</p>
            )}
          </div>

          {/* Campo Teléfono */}
          <div>
            <label htmlFor="telefono" className="form-label">
              Teléfono
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                autoComplete="tel"
                required
                value={form.values.telefono}
                onChange={handlePhoneChange}
                onBlur={form.handleBlur}
                className={`
                  form-input pl-10
                  ${
                    form.errors.telefono && form.touched.telefono
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }
                `}
                placeholder="666555444"
              />
            </div>
            {form.errors.telefono && form.touched.telefono && (
              <p className="mt-1 text-sm text-red-600">
                {form.errors.telefono}
              </p>
            )}
          </div>

          {/* Campo Contraseña */}
          <div>
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={form.values.password}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                className={`
                  form-input pl-10 pr-10
                  ${
                    form.errors.password && form.touched.password
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }
                `}
                placeholder="Mínimo 8 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>

            {/* Indicador de fortaleza */}
            {form.values.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Fortaleza:</span>
                  <span className="text-xs font-medium text-gray-700">
                    {passwordStrength?.message}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`${passwordStrength?.color} h-1.5 rounded-full transition-all`}
                    style={{ width: `${passwordStrength?.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {form.errors.password && form.touched.password && (
              <p className="mt-1 text-sm text-red-600">
                {form.errors.password}
              </p>
            )}
          </div>

          {/* Campo Confirmar Contraseña */}
          <div>
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={form.values.confirmPassword}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                className={`
                  form-input pl-10 pr-10
                  ${
                    form.errors.confirmPassword && form.touched.confirmPassword
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }
                `}
                placeholder="Repite la contraseña"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {form.errors.confirmPassword && form.touched.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {form.errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Términos y condiciones */}
          <div className="flex items-start">
            <input
              id="accept-terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="h-4 w-4 mt-0.5 text-beauty-500 focus:ring-beauty-500 
                       border-gray-300 rounded"
            />
            <label
              htmlFor="accept-terms"
              className="ml-2 text-sm text-gray-700"
            >
              Acepto los{" "}
              <Link
                to="/terms"
                className="text-beauty-500 hover:text-beauty-600"
              >
                términos y condiciones
              </Link>{" "}
              y la{" "}
              <Link
                to="/privacy"
                className="text-beauty-500 hover:text-beauty-600"
              >
                política de privacidad
              </Link>
            </label>
          </div>

          {/* Botón de submit */}
          <LoadingButton
            type="submit"
            loading={form.isSubmitting}
            disabled={!acceptTerms}
            className="w-full"
          >
            CREAR CUENTA
          </LoadingButton>
        </form>

        {/* Enlace a login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Link
              to="/login"
              className="font-medium text-beauty-500 hover:text-beauty-600"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
