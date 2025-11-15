import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Componentes comunes
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import Loading from "./components/common/Loading";

// Páginas públicas
import Login from "./pages/Login";
import Register from "./pages/Register";
import Services from "./pages/Services";
import Incidencias from "./pages/Incidencias";

// Páginas autenticadas - Cliente
import Booking from "./pages/Booking";
import BookingConfirm from "./pages/BookingConfirm";
import MyReservations from "./pages/MyReservations";

// Páginas autenticadas - Admin
import Dashboard from "./pages/admin/Dashboard";
import ReservationsManagement from "./pages/admin/ReservationsManagement";
import ServicesManagement from "./pages/admin/ServicesManagement";
import TimeSlotManagement from "./pages/admin/TimeSlotManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import Reports from "./pages/admin/Reports";

// Componentes de rutas protegidas
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";

/**
 * App Component
 *
 * Componente principal que configura:
 * - Contexto de autenticación global
 * - Sistema de rutas de la aplicación
 * - Layout base con header
 * - Rutas públicas y protegidas
 */

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Header global */}
          <Routes>
            {/* Rutas sin header (login/register) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rutas con header */}
            <Route path="/*" element={<AppWithHeader />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

/**
 * Componente con Header y Footer
 * Todas las páginas excepto login/register tienen header y footer
 */
function AppWithHeader() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* Página principal - redirige a servicios */}
          <Route path="/" element={<Navigate to="/servicios" replace />} />

          {/* Rutas públicas */}
          <Route path="/servicios" element={<Services />} />
          <Route path="/incidencias" element={<Incidencias />} />

          {/* Rutas protegidas - Requieren autenticación */}
          <Route element={<PrivateRoute />}>
            {/* Booking flow */}
            <Route path="/booking/:servicioId" element={<Booking />} />
            <Route path="/booking/confirm" element={<BookingConfirm />} />

            {/* Área de cliente */}
            <Route path="/mis-reservas" element={<MyReservations />} />
            <Route path="/perfil" element={<UserProfile />} />
          </Route>

          {/* Rutas de administración - Requieren rol ADMIN */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<Dashboard />} />
            <Route path="reservas" element={<ReservationsManagement />} />
            <Route path="servicios" element={<ServicesManagement />} />
            <Route path="franjas" element={<TimeSlotManagement />} />
            <Route path="usuarios" element={<UsersManagement />} />
            <Route path="reportes" element={<Reports />} />
          </Route>

          {/* Página 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

/**
 * Página de perfil de usuario (placeholder)
 */
function UserProfile() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Mi Perfil</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Página de perfil en construcción...</p>
      </div>
    </div>
  );
}

/**
 * Página 404 - No encontrado
 */
function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Página no encontrada
        </h2>
        <p className="text-gray-600 mb-6">
          La página que buscas no existe o ha sido movida.
        </p>
        <a href="/servicios" className="btn-primary">
          Volver al inicio
        </a>
      </div>
    </div>
  );
}

export default App;
