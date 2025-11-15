// Footer Component - Pie de página con enlaces y ayuda
import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Mail, Phone, MapPin, AlertCircle, Facebook, Instagram, Twitter } from 'lucide-react';

/**
 * Footer Component
 *
 * Pie de página con:
 * - Información de contacto
 * - Enlaces útiles
 * - Botón de ayuda/incidencias
 * - Redes sociales
 * - Copyright
 */

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Columna 1: Sobre nosotros */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Scissors className="w-6 h-6 text-beauty-400" />
              <h3 className="text-white font-bold text-lg">BeautyBooking</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Tu plataforma de reservas para servicios de belleza.
              Fácil, rápido y seguro.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-beauty-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-beauty-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-beauty-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Columna 2: Enlaces rápidos */}
          <div>
            <h3 className="text-white font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/servicios"
                  className="hover:text-beauty-400 transition-colors"
                >
                  Servicios
                </Link>
              </li>
              <li>
                <Link
                  to="/mis-reservas"
                  className="hover:text-beauty-400 transition-colors"
                >
                  Mis Reservas
                </Link>
              </li>
              <li>
                <Link
                  to="/perfil"
                  className="hover:text-beauty-400 transition-colors"
                >
                  Mi Perfil
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-beauty-400 transition-colors"
                >
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-beauty-400 transition-colors"
                >
                  Términos y Condiciones
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Contacto */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-beauty-400 flex-shrink-0" />
                <span>
                  Calle Belleza 123<br />
                  28001 Madrid, España
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-beauty-400 flex-shrink-0" />
                <a
                  href="tel:+34900123456"
                  className="hover:text-beauty-400 transition-colors"
                >
                  +34 900 123 456
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-beauty-400 flex-shrink-0" />
                <a
                  href="mailto:info@beautybooking.com"
                  className="hover:text-beauty-400 transition-colors"
                >
                  info@beautybooking.com
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 4: Ayuda e incidencias */}
          <div>
            <h3 className="text-white font-semibold mb-4">¿Necesitas Ayuda?</h3>
            <p className="text-sm text-gray-400 mb-4">
              ¿Encontraste algún problema o error? Repórtalo aquí.
            </p>
            <Link
              to="/incidencias"
              className="inline-flex items-center gap-2 px-4 py-2
                       bg-gradient-to-r from-pink-500 to-red-500
                       text-white rounded-lg font-medium text-sm
                       hover:from-pink-600 hover:to-red-600
                       transition-all shadow-lg hover:shadow-xl
                       transform hover:-translate-y-0.5"
            >
              <AlertCircle className="w-5 h-5" />
              Reportar Incidencia
            </Link>
            <p className="text-xs text-gray-500 mt-3">
              También puedes escribirnos a:<br />
              <a
                href="mailto:incidencias@beautybooking.com"
                className="text-beauty-400 hover:underline"
              >
                incidencias@beautybooking.com
              </a>
            </p>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>
              © {new Date().getFullYear()} BeautyBooking. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-beauty-400 transition-colors">
                Política de Cookies
              </a>
              <a href="#" className="hover:text-beauty-400 transition-colors">
                Accesibilidad
              </a>
              <Link to="/incidencias" className="hover:text-beauty-400 transition-colors">
                Soporte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
