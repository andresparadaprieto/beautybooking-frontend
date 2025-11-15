import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Star,
  Users,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Check,
  Scissors,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

/**
 * Home Page
 *
 * Página principal que muestra:
 * - Hero section con CTA
 * - Servicios destacados
 * - Información del salón
 * - Testimonios
 * - Información de contacto
 */

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-beauty-400 to-beauty-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Tu Salón de Belleza Online
            </h1>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Reserva tu cita en segundos, sin llamadas ni esperas. Gestiona tu
              belleza con un solo click.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/servicios")}
                className="px-8 py-4 bg-white text-beauty-600 rounded-lg font-semibold
                         hover:bg-gray-100 transition-colors text-lg"
              >
                Ver Servicios
              </button>
              {!isAuthenticated() && (
                <button
                  onClick={() => navigate("/register")}
                  className="px-8 py-4 bg-beauty-700 text-white rounded-lg font-semibold
                           hover:bg-beauty-800 transition-colors text-lg"
                >
                  Crear Cuenta Gratis
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Decoración ondulada */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="white">
            <path d="M0,64 C240,150 480,10 720,64 C960,118 1200,10 1440,64 L1440,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* Características */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-beauty-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-beauty-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Reserva Online 24/7
              </h3>
              <p className="text-gray-600">
                Reserva cuando quieras, desde donde quieras. Sin horarios de
                atención.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-beauty-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-beauty-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sin Esperas</h3>
              <p className="text-gray-600">
                Elige tu horario preferido y ven directamente. Tu tiempo es
                valioso.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-beauty-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-beauty-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Confirmación Inmediata
              </h3>
              <p className="text-gray-600">
                Recibe confirmación instantánea por email con todos los
                detalles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios Destacados */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nuestros Servicios Más Populares
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Descubre nuestros tratamientos más solicitados. Calidad
              profesional con los mejores productos del mercado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="p-8 text-center">
                  <div className="text-5xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <div className="flex justify-center items-center gap-4 mb-4">
                    <span className="text-2xl font-bold text-beauty-600">
                      {service.price}€
                    </span>
                    <span className="text-sm text-gray-500">
                      {service.duration} min
                    </span>
                  </div>
                  <Link
                    to="/servicios"
                    className="inline-flex items-center text-beauty-600 hover:text-beauty-700 font-medium"
                  >
                    Reservar ahora
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/servicios"
              className="btn-primary inline-flex items-center gap-2"
            >
              Ver todos los servicios
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-gray-600">
              La satisfacción de nuestros clientes es nuestra mejor carta de
              presentación
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.comment}"
                </p>
                <div className="border-t pt-4">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.service}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-beauty-500 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Lista para tu próxima cita?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a miles de clientes satisfechos que ya disfrutan de nuestros
            servicios
          </p>
          <button
            onClick={() =>
              navigate(isAuthenticated() ? "/servicios" : "/register")
            }
            className="px-8 py-4 bg-white text-beauty-600 rounded-lg font-semibold
                     hover:bg-gray-100 transition-colors text-lg"
          >
            {isAuthenticated() ? "Reservar Ahora" : "Comenzar Gratis"}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Información */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Scissors className="w-6 h-6" />
                BeautyBooking
              </h3>
              <p className="text-gray-400">
                Tu salón de belleza de confianza. Más de 10 años cuidando de tu
                imagen.
              </p>
            </div>

            {/* Enlaces rápidos */}
            <div>
              <h4 className="font-semibold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/servicios" className="hover:text-white">
                    Servicios
                  </Link>
                </li>
                <li>
                  <Link to="/mis-reservas" className="hover:text-white">
                    Mis Reservas
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white">
                    Sobre Nosotros
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <div className="space-y-2 text-gray-400">
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Calle Belleza 123 28001 Madrid, España
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  91 123 45 67
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  info@beautybooking.com
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  L-V: 09:00-21:00 | S: 10:00-20:00
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 BeautyBooking. Todos los derechos reservados.</p>
            <p className="text-sm mt-2">
              Desarrollado por Andres Eduardo Parada Prieto
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
