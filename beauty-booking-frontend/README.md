# 💅 BeautyBooking - Frontend

Sistema de gestión de reservas para centros de estética y salones de belleza - Interfaz de Usuario.

**Proyecto:** DAW (Desarrollo de Aplicaciones Web) - Ciclo Formativo  
**Autor:** Andrés Eduardo Parada Prieto  
**Tecnologías:** React, Vite, TailwindCSS, React Router  
**Backend:** [BeautyBooking API](https://github.com/andresparadaprieto/beautybooking-backend)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Configuración](#️-configuración-importante)
- [Ejecutar la Aplicación](#-ejecutar-la-aplicación)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Funcionalidades](#-funcionalidades)
- [Despliegue](#️-despliegue)
- [Tecnologías](#-tecnologías-utilizadas)
- [Credenciales de Prueba](#-credenciales-de-prueba)

---

## ✨ Características

### Funcionalidades para Clientes

✅ **Registro e Inicio de Sesión** - Autenticación segura con JWT  
✅ **Catálogo de Servicios** - Visualización de tratamientos disponibles  
✅ **Sistema de Reservas** - Selección de fecha, hora y servicio  
✅ **Mis Reservas** - Historial y gestión de citas  
✅ **Cancelación de Citas** - Gestión autónoma de reservas  

### Panel de Administración

👑 **Gestión de Servicios** - CRUD completo de tratamientos  
👑 **Gestión de Franjas Horarias** - Configuración de disponibilidad  
👑 **Panel de Reservas** - Vista completa de todas las citas  
👑 **Confirmación de Reservas** - Validación de citas pendientes  
👑 **Dashboard** - Estadísticas y resumen del día  

---

## 🛠️ Requisitos

- **Node.js** 18 o superior ([Descargar](https://nodejs.org/))
- **npm** 9+ (incluido con Node.js)
- **Backend API** ejecutándose (ver [repositorio backend](https://github.com/andresparadaprieto/beautybooking-backend))

---

## 📦 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/andresparadaprieto/beautybooking-frontend.git
cd beautybooking-frontend/beauty-booking-frontend
```

### 2. Instalar dependencias

```bash
npm install
```

---

## ⚙️ Configuración Importante

### 🔴 Configurar la URL del Backend

**Archivo:** `src/services/api.js`

#### Para Desarrollo Local

```javascript
// src/services/api.js
const api = axios.create({
  baseURL: 'http://localhost:8080',  // ⬅️ Backend local
  headers: {
    'Content-Type': 'application/json',
  },
});
```

#### Para Producción (Railway)

```javascript
// src/services/api.js
const api = axios.create({
  baseURL: 'https://tu-backend.railway.app',  // ⬅️ URL de Railway
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## 🚀 Ejecutar la Aplicación

### Modo Desarrollo

```bash
npm run dev
```

La aplicación se abrirá en: **http://localhost:5173**

### Compilar para Producción

```bash
npm run build
```
### Preview de Producción

```bash
npm run preview
```

---

## 🎯 Funcionalidades

### Rutas Públicas

| Ruta | Descripción |
|------|-------------|
| `/` | Página de inicio |
| `/login` | Inicio de sesión |
| `/register` | Registro de usuario |
| `/servicios` | Catálogo de servicios |

### Rutas Protegidas (Requieren autenticación)

| Ruta | Descripción | Rol |
|------|-------------|-----|
| `/reservas` | Crear nueva reserva | CLIENTE |
| `/mis-reservas` | Ver mis reservas | CLIENTE |
| `/admin` | Panel de administración | ADMIN |
| `/admin/servicios` | Gestión de servicios | ADMIN |
| `/admin/franjas` | Gestión de horarios | ADMIN |
| `/admin/reservas` | Todas las reservas | ADMIN |

---

## ☁️ Despliegue

### Vercel 

1. **Crear cuenta en [Vercel](https://vercel.com)**
2. **Importar repositorio desde GitHub**
3. **Configurar el proyecto:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `beauty-booking-frontend`
4. **Deploy automático** ✅


**⚠️ Importante:** Actualiza la URL del backend en `api.js` antes del deploy.

---

## 📦 Tecnologías Utilizadas

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **React** | 19.x | Framework principal |
| **Vite** | 5.x | Build tool y dev server |
| **TailwindCSS** | 3.x | Estilos y diseño responsive |
| **React Router** | 6.x | Navegación y rutas |
| **Axios** | 1.x | Cliente HTTP para API |
| **date-fns** | 3.x | Manejo de fechas |
| **React Context** | - | Gestión de estado (Auth) |

---

## 🔑 Credenciales de Prueba

### 👑 Usuario Administrador

- **Email:** `admin@beautybooking.com`
- **Password:** `admin123`

### 👤 Clientes de Prueba

| Email | Password |
|-------|----------|
| `maria.garcia@example.com` | `password123` |
| `carlos.rodriguez@example.com` | `password123` |

---

## 🔗 Integración con Backend

El frontend consume los siguientes endpoints del backend:

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario

### Servicios
- `GET /servicios` - Listar servicios
- `GET /servicios/{id}` - Detalle de servicio

### Reservas
- `POST /reservas` - Crear reserva
- `GET /reservas/mis` - Mis reservas
- `DELETE /reservas/{id}` - Cancelar reserva

### Admin
- `POST /admin/servicios` - Crear servicio
- `PUT /admin/servicios/{id}` - Actualizar servicio
- `GET /admin/reservas` - Todas las reservas
- `PATCH /admin/reservas/{id}/confirmar` - Confirmar reserva

---
