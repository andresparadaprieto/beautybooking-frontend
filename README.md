# Beauty Booking - Sistema de Reservas

**Autor:** Andrés Eduardo Parada Prieto  
**Ciclo:** Desarrollo de Aplicaciones Web (DAW)  
**Curso:** 2023-2025

---

## **🌐 Aplicación Actualmente Desplegada en Producción**

**Se puede probar la aplicación funcionando aquí:**
- **Frontend:** https://beautybookingweb.vercel.app
- **Backend:** https://beautybooking-backend-production.up.railway.app

### 👤 Credenciales de Prueba
- **Administrador:** admin@beautybooking.com / admin123
- **Cliente:** carlos.rodriguez@example.com	 / password123
- **Cliente:** maria.garcia@example.com	/ password123

---

## 💻 Requisitos para Ejecución Local (Windows)

### Descargar e Instalar:
1. **Java JDK 19+:** https://www.oracle.com/es/java/technologies/downloads/ (descargar e instalar el `.msi`)
2. **Maven:** https://maven.apache.org/download.cgi (descargar, extraer y configurar PATH)
3. **Node.js 16+:** https://nodejs.org/ (descargar e instalar el `.msi` - incluye npm)

### Verificar Instalación:
Abrir CMD o PowerShell y ejecutar:
```cmd
java -version
mvn -version
node -v
npm -v
```

---

## 🚀 Ejecutar la Aplicación

### 1️⃣ Backend (Puerto 8080)

Abrir una terminal (CMD o PowerShell):
```cmd
cd beautybooking-backend
mvn clean install
mvn spring-boot:run
```

**Esperar a ver el mensaje:**
```
Started BeautyBookingApplication in X.XXX seconds
```

✅ **Backend listo en:** http://localhost:8080

### 2️⃣ Frontend (Puerto 5173)

Abrir **otra terminal diferente**:
```cmd
cd beautybooking-frontend
npm install
npm run dev
```

**Esperar a ver:**
```
VITE ready in X ms
Local: http://localhost:5173
```

✅ **Frontend listo en:** http://localhost:5173

> ⚠️ **Importante:** El backend DEBE estar ejecutándose antes de iniciar el frontend.

---

## 🔍 Verificar que Funciona

- **Aplicación Web:** http://localhost:5173
- **API Backend:** http://localhost:8080/api
- **Consola H2:** http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:beautydb`
  - Usuario: `sa`
  - Password: (dejar vacío)

---

## 🏗️ Arquitectura Técnica

### Backend
- **Framework:** Spring Boot 3.x
- **Seguridad:** Spring Security + JWT
- **Base de Datos (Local):** H2 en memoria (se inicializa automáticamente con datos de prueba)
- **Base de Datos (Producción):** MySQL en Railway
- **Puerto:** 8080

### Frontend
- **Framework:** React + Vite
- **Cliente HTTP:** Axios
- **Puerto:** 5173
- **Configuración API:** `http://localhost:8080` (en `src/api.js`)

---

## 📊 Funcionalidades

✅ Sistema de autenticación (JWT)  
✅ Roles de usuario (Administrador/Cliente)  
✅ Gestión de servicios del salón  
✅ Sistema de reservas con disponibilidad  
✅ Panel de administración  
✅ Panel de cliente  
✅ Validaciones frontend y backend  

---

## 🚀 Despliegue en Producción

### Backend → Railway
- Base de datos MySQL
- Variables de entorno configuradas
- Despliegue automático desde GitHub (rama `main`)

### Frontend → Vercel
- Variable de entorno: URL del backend de Railway
- Despliegue automático desde GitHub (rama `main`)

---

## 📝 Repositorios en GitHub

- **Backend:** https://github.com/andresparadaprieto/beautybooking-backend
- **Frontend:** https://github.com/andresparadaprieto/beautybooking-frontend
