import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Scissors, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useForm } from "../hooks";
import { InlineAlert } from "../components/common/Alert";
import { LoadingButton } from "../components/common/Loading";

/**
 * Login Page
 *
 * Página de inicio de sesión con:
 * - Formulario de email y contraseña
 * - Validación de campos
 * - Recordar sesión
 * - Enlaces a registro y recuperación
 * - Información lateral sobre el servicio
 */

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Estado para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);

  // Estado para recordar sesión
  const [rememberMe, setRememberMe] = useState(false);

  // Estado para mensajes
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Obtener redirect URL si existe
  const from = location.state?.from?.pathname || "/";

  // Hook de formulario con validaciones
  const form = useForm(
    {
      email: "",
      password: "",
    },
    {
      email: {
        required: true,
        email: true,
        message: "Email válido requerido",
      },
      password: {
        required: true,
        minLength: 8,
        message: "La contraseña debe tener mínimo 8 caracteres",
      },
    }
  );

  // Redirigir si el usuario ya está autenticado
  // Solo se ejecuta una vez al montar el componente
  useEffect(() => {
    const checkAuthAndRedirect = () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          const destination = user.rol === "ADMIN" ? "/admin" : "/servicios";
          console.log(
            "👤 Usuario ya autenticado, redirigiendo a:",
            destination
          );
          navigate(destination, { replace: true });
        } catch (error) {
          console.error("Error parseando usuario:", error);
        }
      }
    };

    checkAuthAndRedirect();
  }, []); // Array vacío = solo se ejecuta al montar

  useEffect(() => {
    if (location.state?.registered) {
      setSuccess("¡Registro exitoso! Ahora puedes iniciar sesión.");
    }
  }, [location.state]);

  /**
   * Maneja el submit del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Limpiar mensajes anteriores
    setError("");
    setSuccess("");

    // Validar formulario
    if (!form.validate()) {
      setError("Por favor, corrige los errores en el formulario");
      return;
    }

    // Iniciar proceso de login
    form.setIsSubmitting(true);

    try {
      // Intentar login -  actualiza el estado del usuario en el contexto
      const response = await login(form.values.email, form.values.password);

      // Si llegamos aquí, login exitoso
      console.log("✅ Login exitoso");

      // Redirigir según el rol del usuario que viene en la respuesta

      const userRole = response.usuario?.rol || response.rol;

      if (userRole === "ADMIN") {
        console.log("👤 Redirigiendo admin a /admin");
        navigate("/admin", { replace: true });
      } else {
        console.log("�� Redirigiendo cliente a /servicios");
        // Si hay una página de origen, volver ahí
        navigate(from !== "/login" ? from : "/servicios", { replace: true });
      }
    } catch (error) {
      // Manejar errores específicos del backend
      if (error.status === 401) {
        setError("Email o contraseña incorrectos");
      } else if (error.status === 400) {
        setError("Datos de acceso inválidos");
      } else {
        setError(error.message || "Error al iniciar sesión. Intenta de nuevo.");
      }

      // Limpiar contraseña por seguridad
      form.setFieldValue("password", "");
    } finally {
      form.setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Lado izquierdo - Formulario */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-beauty-100 p-3 rounded-full">
                <Scissors className="w-8 h-8 text-beauty-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h1>
            <p className="mt-2 text-gray-600">Tu salón de belleza online</p>
          </div>

          {/* Alertas */}
          {error && (
            <InlineAlert type="error" message={error} className="mb-4" />
          )}

          {success && (
            <InlineAlert type="success" message={success} className="mb-4" />
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="usuario@ejemplo.com"
                />
              </div>
              {form.errors.email && form.touched.email && (
                <p className="mt-1 text-sm text-red-600">{form.errors.email}</p>
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
                  autoComplete="current-password"
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
                  placeholder="••••••••"
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
              {form.errors.password && form.touched.password && (
                <p className="mt-1 text-sm text-red-600">
                  {form.errors.password}
                </p>
              )}
            </div>

            {/* Opciones adicionales */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-beauty-500 focus:ring-beauty-500 
                           border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Recordarme
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="text-beauty-500 hover:text-beauty-600"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            {/* Botón de submit */}
            <LoadingButton
              type="submit"
              loading={form.isSubmitting}
              className="w-full"
            >
              ENTRAR
            </LoadingButton>
          </form>

          {/* Enlace a registro */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{" "}
              <Link
                to="/register"
                className="font-medium text-beauty-500 hover:text-beauty-600"
              >
                CREAR CUENTA NUEVA
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Lado derecho - Información */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-beauty-400 to-beauty-600">
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="max-w-lg">
            <h2 className="text-3xl font-bold text-white mb-6">
              ✨ Bienvenido a BeautyBooking
            </h2>

            <div className="space-y-4 text-white">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p>Reserva tus citas online 24/7</p>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p>Gestiona tu historial de reservas</p>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p>Recibe confirmaciones por email</p>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p>Cancela con total flexibilidad</p>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p>Descubre nuestros servicios</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
