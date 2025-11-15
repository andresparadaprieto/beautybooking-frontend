// Header Component - Barra de navegación principal
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Calendar, Scissors } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Header Component
 * 
 * Barra de navegación responsive con:
 * - Logo y marca
 * - Enlaces de navegación según el rol del usuario
 * - Menú de usuario con dropdown
 * - Menú móvil hamburguesa
 */

const Header = () => {
  const { user, logout, isAdmin, isCliente } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estado para el menú móvil
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Estado para el dropdown del usuario
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  /**
   * Maneja el logout
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  /**
   * Verifica si una ruta está activa
   */
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };
  
  /**
   * Obtiene las clases para un link según si está activo
   */
  const getLinkClasses = (path) => {
    const baseClasses = 'px-3 py-2 rounded-md text-sm font-medium transition-colors';
    if (isActiveRoute(path)) {
      return `${baseClasses} bg-beauty-500 text-white`;
    }
    return `${baseClasses} text-gray-700 hover:bg-beauty-50 hover:text-beauty-600`;
  };
  
  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo y marca */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-xl font-bold text-beauty-500"
            >
              <Scissors className="w-6 h-6" />
              <span>BeautyBooking</span>
            </Link>
            
            {/* Badge de admin si es necesario */}
            {isAdmin() && (
              <span className="ml-3 px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded">
                ADMIN
              </span>
            )}
          </div>
          
          {/* Enlaces de navegación - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Enlaces para todos */}
            <Link
              to="/servicios"
              className={getLinkClasses('/servicios')}
            >
              Servicios
            </Link>
            
            {/* Enlaces para usuarios autenticados */}
            {user && (
              <>
                {/* Enlaces para clientes */}
                {isCliente() && (
                  <>
                    <Link
                      to="/mis-reservas"
                      className={getLinkClasses('/mis-reservas')}
                    >
                      Mis Reservas
                    </Link>
                    <Link
                      to="/perfil"
                      className={getLinkClasses('/perfil')}
                    >
                      Perfil
                    </Link>
                  </>
                )}
                
                {/* Enlaces para admin */}
                {isAdmin() && (
                  <>
                    <Link
                      to="/admin"
                      className={getLinkClasses('/admin')}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/reservas"
                      className={getLinkClasses('/admin/reservas')}
                    >
                      Reservas
                    </Link>
                    <Link
                      to="/admin/servicios"
                      className={getLinkClasses('/admin/servicios')}
                    >
                      Gestión Servicios
                    </Link>
                  </>
                )}
                
                {/* Dropdown de usuario */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 text-gray-700 hover:text-beauty-600 
                             px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <User className="w-5 h-5" />
                    <span>{user.nombre}</span>
                  </button>
                  
                  {/* Menú dropdown */}
                  {userMenuOpen && (
                    <>
                      {/* Overlay para cerrar al hacer click fuera */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setUserMenuOpen(false)}
                      />
                      
                      {/* Menú */}
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md 
                                    shadow-lg py-1 z-20 border border-gray-200">
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">
                            {user.nombre}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        
                        {isAdmin() && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 
                                     hover:bg-gray-100"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Panel Admin
                          </Link>
                        )}
                        
                        {isCliente() && (
                          <Link
                            to="/perfil"
                            className="block px-4 py-2 text-sm text-gray-700 
                                     hover:bg-gray-100"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Mi Perfil
                          </Link>
                        )}
                        
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 
                                   hover:bg-gray-100 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
            
            {/* Enlaces para usuarios no autenticados */}
            {!user && (
              <>
                <Link
                  to="/login"
                  className={getLinkClasses('/login')}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
          
          {/* Botón menú móvil */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-beauty-600 p-2"
              aria-label="Menú móvil"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Menú móvil */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Enlaces para todos */}
              <Link
                to="/servicios"
                className={`block ${getLinkClasses('/servicios')}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Servicios
              </Link>
              
              {/* Enlaces para usuarios autenticados */}
              {user && (
                <>
                  {isCliente() && (
                    <>
                      <Link
                        to="/mis-reservas"
                        className={`block ${getLinkClasses('/mis-reservas')}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Mis Reservas
                      </Link>
                      <Link
                        to="/perfil"
                        className={`block ${getLinkClasses('/perfil')}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Perfil
                      </Link>
                    </>
                  )}
                  
                  {isAdmin() && (
                    <>
                      <Link
                        to="/admin"
                        className={`block ${getLinkClasses('/admin')}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard Admin
                      </Link>
                      <Link
                        to="/admin/reservas"
                        className={`block ${getLinkClasses('/admin/reservas')}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Gestión Reservas
                      </Link>
                      <Link
                        to="/admin/servicios"
                        className={`block ${getLinkClasses('/admin/servicios')}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Gestión Servicios
                      </Link>
                    </>
                  )}
                  
                  {/* Información del usuario */}
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.nombre}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 
                               hover:bg-gray-100 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
              
              {/* Enlaces para usuarios no autenticados */}
              {!user && (
                <>
                  <Link
                    to="/login"
                    className={`block ${getLinkClasses('/login')}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="block btn-primary text-sm text-center mt-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;